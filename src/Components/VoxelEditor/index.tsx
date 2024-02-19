'use client'

import React, { Suspense, useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Canvas, useThree, ThreeEvent, useLoader } from "@react-three/fiber";
import { OBJLoader } from 'three-stdlib';
import { MTLLoader } from 'three-stdlib';
import { OrbitControls, PerspectiveCamera, Environment, Plane } from "@react-three/drei";
import * as THREE from "three";
import { useBasicStore, useThreeStore } from "@/store";

import ToolInfo from "./ToolInfo";
import StatusBar from "./StatusBar";
import InfoBox from "./InfoBox";
import { Material } from "utils/voxel";
import { useParams } from "next/navigation";
import { useAuthContext } from "@/contexts/authContext";
import { useProjectContext } from "@/contexts/projectContext";
import { useToast } from "@chakra-ui/react";
import { voxelCreated, updateVoxel } from "utils/api";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const voxelSize = Number(process.env.NEXT_PUBLIC_VOXEL_SIZE);

type VoxelsProps = {
  voxels: THREE.Vector3[];
}

const VoxelsView: React.FC<VoxelsProps> = ({ voxels }) => {
  const tempBoxes = useMemo(() => new THREE.Object3D(), []);
  const tmpBox = useRef<THREE.Mesh>(null);
  const [tmpPos, setTmpPos] = useState<THREE.Vector3 | undefined>(undefined);

  const aoMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_AO_2K.jpg");
  const colMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_COL_2K.jpg");
  const glossMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_GLOSS_2K.jpg");
  const normalMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_NRM_2K.jpg");
  const metalnessMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_REFL_2K.jpg");

  const boxGeometry = useMemo(() => new THREE.BoxGeometry(voxelSize * 0.98, voxelSize * 0.98, voxelSize * 0.98), []);
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    side: THREE.DoubleSide,
    wireframe: false,
    map: colMap,
    aoMap: aoMap,
    normalMap: normalMap,
    specularColorMap: metalnessMap,
    roughnessMap: glossMap,
    reflectivity: 0.5,
    roughness: 0.8,
    metalness: 0.3
  }), [aoMap, colMap, normalMap, metalnessMap, glossMap]);
  const ref = useRef<THREE.InstancedMesh>(null);
  const { raycaster, mouse, camera } = useThree();

  const { removeMode } = useBasicStore();
  const { addVoxel, removeVoxel } = useThreeStore();
  
  useEffect(() => {
    if (ref.current) {
      for (let i = 0; i < voxels.length; i++) {
        tempBoxes.position.set(voxels[i].x, voxels[i].y, voxels[i].z);
        tempBoxes.updateMatrix();
        ref.current.setMatrixAt(i, tempBoxes.matrix);
      }

      ref.current.instanceMatrix.needsUpdate = true;
    }
  });

  const onMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.faceIndex && ref.current) {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(ref.current);

      if (intersects.length > 0) {
        const { instanceId } = intersects[0];
        if (instanceId) {
          let tmpMatrix = new THREE.Matrix4();
          let tmpPosition = new THREE.Vector3();
          ref.current.getMatrixAt(instanceId, tmpMatrix);
          tmpPosition.setFromMatrixPosition(tmpMatrix);
          const { x, y, z } = tmpPosition;
          const dir = [
            [x + voxelSize, y, z],
            [x - voxelSize, y, z],
            [x, y + voxelSize, z],
            [x, y - voxelSize, z],
            [x, y, z + voxelSize],
            [x, y, z - voxelSize],
          ];
          const newPos = new THREE.Vector3(...dir[Math.floor(e.faceIndex / 2)]);
          setTmpPos(newPos);
        }
      }
    }
  }, [camera, mouse, raycaster]);

  const onOut = useCallback(() => setTmpPos(undefined), []);

  const onClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.faceIndex && ref.current) {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(ref.current);

      if (intersects.length > 0) {
        const { instanceId } = intersects[0];
        if (instanceId) {
          const tmpPosition = voxels[instanceId];
          
          if (!removeMode) {
            const { x, y, z } = tmpPosition;
            const dir = [
              [x + voxelSize, y, z],
              [x - voxelSize, y, z],
              [x, y + voxelSize, z],
              [x, y - voxelSize, z],
              [x, y, z + voxelSize],
              [x, y, z - voxelSize],
            ];
            const newPos = new THREE.Vector3(...dir[Math.floor(e.faceIndex / 2)]);
            addVoxel(newPos);
          } else {
            removeVoxel(tmpPosition);
          }
        }
      }
    }
  }, [voxels, camera, mouse, raycaster, removeMode, addVoxel, removeVoxel]);

  return (
    <group rotation={[Math.PI * 3 / 2, 0, 0]}>
      {tmpPos && <mesh ref={tmpBox} position={tmpPos}>
        <boxGeometry args={[voxelSize * 0.98, voxelSize * 0.98, voxelSize * 0.98]} />
      </mesh>}
      <instancedMesh
        ref={ref}
        args={[boxGeometry, material, voxels.length]}
        onPointerMove={onMove}
        onPointerLeave={onOut}
        onClick={onClick}
      />
    </group>
  );
};

type MeshProps = {
  mesh: THREE.BufferGeometry | null;
}

const MeshView: React.FC<MeshProps> = ({ mesh }) => {
  // const data = new THREE.Mesh(mesh, Material);
  const materials = useLoader(MTLLoader, "/models/motor-new/model.mtl");
  // Apply these materials to the subsequent OBJ loader
  const obj = useLoader(OBJLoader, "/models/motor-new/model.obj", (model) => {
    if (model) {
      model.setMaterials(materials);
      
    }
    return model;
  });

  // if (!mesh)
  //   return null;
  
  return (
    // <mesh
    //   rotation={[Math.PI * 3 / 2, 0, 0]}
    //   geometry={mesh}
    //   material={Material}
    // />
    <group>
      <mesh
        castShadow
        receiveShadow
        rotation={[Math.PI * 3 / 2, 0, 0]}
        geometry={obj.children[0].geometry}
      >
        <meshPhysicalMaterial
          attach={'material'}
          map={obj.children[0].material.map}
          roughnessMap={obj.children[0].material.roughnessMap}
          normalMap={obj.children[0].material.normalMap}
          metalnessMap={obj.children[0].material.metalnessMap}          
          roughness={0.6}
          metalness={0.8}
          reflectivity={0.5}
          clearcoat={0.1}
          clearcoatRoughness={0.1}
          transmission={0}
        />
      </mesh>
      <Plane
        receiveShadow
        rotation={[Math.PI * 3 / 2, 0, 0]}
        position={[0, -0.6, 0]}
        args={[100, 100]}
      >
        <meshStandardMaterial attach="material" color="grey" />
      </Plane>
    </group>
  );
}

const SceneBackground: React.FC = () => {
  const { scene } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color('grey');
  }, [scene]);

  return null;
}

const Views: React.FC = () => {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { user } = useAuthContext();
  const { projects, updateProject } = useProjectContext();
  const { gl } = useThree();
  const { viewMode, setLoading } = useBasicStore();
  const { voxels, mesh } = useThreeStore();
  const toast = useToast();

  const save = useCallback(async (e: KeyboardEvent) => {
    if (e.code === "Backslash" && user) {
      e.preventDefault();
      gl.domElement.toBlob(async (blob) => {
        if (blob) {
          try {
            setLoading(true);
            const storage = getStorage();
            const storageRef = ref(storage, `${projectId}/icon.png`);
            const snapshot = await uploadBytes(storageRef, blob);
            const iconUrl = await getDownloadURL(storageRef);
  
            const current = projects.filter(project => project.id === projectId)[0];
            const voxelData = voxels.map(voxel => ({x: voxel.x, y: voxel.y, z: voxel.z}));
            if (current.voxelData.length === 0) {
                const res = await voxelCreated(user.uid, projectId, 0, voxelData, iconUrl);
                updateProject(projectId, { status: res.project.status, voxelData: voxelData, imageLink: iconUrl });
            } else {
                const res = await updateVoxel(projectId, voxelData);
                updateProject(projectId, { voxelData: voxelData });
            }
            toast({
                title: 'Success',
                description: "You saved voxel data successfully.",
                status: 'success',
                position: 'top',
                duration: 3000,
                isClosable: true,
            });
            setLoading(false);
          } catch (error) {
            setLoading(false);
          }
        }
      }, 'image/png');
    }
  },
  [gl, user, projectId, projects, setLoading, toast, updateProject, voxels]
  );

  useEffect(() => {
    document.addEventListener('keyup', save);

    return () => {
      document.removeEventListener('keyup', save);
    }
  }, [save]);

  return (
    <>
      {
        viewMode === 'voxel'
        ?
        <VoxelsView voxels={voxels} />
        :
        <MeshView mesh={mesh} />
      }
    </>
  )
}

const Scene: React.FC = () => {
  const controlsRef = useRef(null);

  return (
    <div className="canvas">
      <InfoBox />
      <StatusBar />
      <ToolInfo />
      <div className="w-full h-full">
        <Canvas
          shadows
          dpr={[1, 1]}
          frameloop="demand"
          gl={{ preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
        >
          <Environment files="/models/potsdamer_platz_1k.hdr" />
          <SceneBackground />
          <PerspectiveCamera makeDefault position={[0, 3, 3]} />
          <ambientLight intensity={1} />
          <directionalLight
            rotation={[Math.PI * 3 / 2, 0, 0]}
            castShadow
            position={[10, 10, 5]}
            intensity={1.5}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={0.5}
            shadow-camera-far={500}
          />
          <Suspense fallback={null}>
            <Views />
          </Suspense>
          <OrbitControls ref={controlsRef} />
        </Canvas>
      </div>
    </div>
  );
}

export default Scene;