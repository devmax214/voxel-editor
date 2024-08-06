'use client'

import React, { Suspense, useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Canvas, useThree, ThreeEvent, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Html } from "@react-three/drei";
import { mergeVertices, OBJLoader, MTLLoader } from "three-stdlib";
import * as THREE from "three";
import { useBasicStore, useThreeStore } from "@/store";

import ToolInfo from "./ToolInfo";
import StatusBar from "./StatusBar";
import InfoBox from "./InfoBox";
import { useParams } from "next/navigation";
import { useAuthContext } from "@/contexts/authContext";
import { useProjectContext } from "@/contexts/projectContext";
import { useToast } from "@chakra-ui/react";
// import { voxelCreated, updateVoxel } from "utils/api";
import { voxelCreated, updateVoxel } from "@/Firebase/dbactions";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ModelTip from "./ModelTip";
import { cropToSquare } from "utils/utils";
import { storage } from "@/Firebase/config";

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
    reflectivity: 0,
    roughness: 0.9,
    metalness: 0
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
  const aoMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_AO_2K.jpg");
  const colMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_COL_2K.jpg");
  const glossMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_GLOSS_2K.jpg");
  const normalMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_NRM_2K.jpg");
  const metalnessMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_REFL_2K.jpg");

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

  if (!mesh) return;

  return (
    <mesh
      rotation={[Math.PI * 3 / 2, 0, 0]}
      geometry={mesh}
      material={material}
    />
  )
}

const ModelView: React.FC = () => {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { projects } = useProjectContext();
  const current = projects.filter(project => project.id === projectId)[0];
  const [urls, setUrls] = useState({
    obj: '',
    mtl: '',
    albedo: '',
    metallic: '',
    roughness: ''
  });

  const baseURL = `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/getAsset?projectId=${projectId}&fileName=`;

  const { useNormalMap } = useBasicStore(state => ({ useNormalMap: state.useNormalMap }));

  useEffect(() => {
    if ((current?.status === 'Completed' || current?.status === 'Editing') && current?.meshGenerated) {
      setUrls({
        obj: `${baseURL}model.obj`,
        mtl: `${baseURL}model.mtl`,
        albedo: `${baseURL}texture_kd.jpg`,
        metallic: `${baseURL}texture_metallic.jpg`,
        roughness: `${baseURL}texture_roughness.jpg`
      });
    }
  }, [current, baseURL]);

  const materials = useLoader(MTLLoader, urls.mtl);
  const obj = useLoader(
    OBJLoader,
    urls.obj,
    (model) => {
      if (model) {
        model.setMaterials(materials);
      }
      return model;
    }
  );

  const metallicnessMap = useLoader(THREE.TextureLoader, urls.metallic);
  const roughnessMap = useLoader(THREE.TextureLoader, urls.roughness);
  const textureMap = useLoader(THREE.TextureLoader, urls.albedo);

  if (!obj.children) return null;

  let objMesh = obj.children[0] as THREE.Mesh;
  let geometry = objMesh.geometry;

  // Merge vertices to ensure smooth normals
  geometry = mergeVertices(geometry);
  // Compute vertex normals for smooth shading
  geometry.computeVertexNormals();

  const bounds = new THREE.Box3().setFromObject(obj);

  return (
    <>
      {urls.obj ? (
        <group>
          <mesh
            castShadow
            receiveShadow
            rotation={[0, Math.PI * 3 / 2, 0]}
            geometry={geometry}
          >
            {useNormalMap ? (
              <meshNormalMaterial
                attach="material"
                side={THREE.DoubleSide}
              />
            ) : (
              <meshPhysicalMaterial
                attach="material"
                side={THREE.DoubleSide}
                map={textureMap}
                roughnessMap={roughnessMap}
                metalnessMap={metallicnessMap}
              />
            )}
          </mesh>
          <ContactShadows opacity={0.5} blur={3} scale={4} far={20} resolution={256} position={[0, bounds.min.y, 0]} />
        </group>
      ) : (
        <group></group>
      )}
    </>
  );
}

const SceneBackground: React.FC = () => {
  const { scene } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color('#ffffff');
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
  
  const current = projects.filter(project => project.id === projectId)[0];

  const storage = getStorage();
  const storageRef = ref(storage, current.voxelDataLink);
  if( current.voxelDataLink != ""){
    getDownloadURL(storageRef)
      .then(url => fetch(url))
      .then(response => response.json())
      .then(data => localStorage.setItem("voxelData", JSON.stringify(data)));
  }
  const save = useCallback(async (e: KeyboardEvent) => {
    

    if (current.status === 'Generating') return;

    if (e.code === "Backslash" && user) {
      e.preventDefault();
      if (viewMode === 'voxel') {
        gl.domElement.toBlob(async (blob) => {
          if (blob) {
            try {
              setLoading(true);
              const croppedBlob = await cropToSquare(blob);
              const storage = getStorage();
              const storageRef = ref(storage, `${projectId}/icon.png`);
              const snapshot = await uploadBytes(storageRef, croppedBlob);
              const iconUrl = await getDownloadURL(storageRef);

              console.log("saved", current);
              const voxelData = voxels.map(voxel => ({ x: voxel.x, y: voxel.y, z: voxel.z }));
              if (current.voxelDataLink === "") {
                const res: any = await voxelCreated(user.uid, projectId, 0, voxelData, iconUrl, current.prompt);
                updateProject(projectId, { status: res.project.status, voxelDataLink: `voxelData/${projectId}.json`, lastModified: new Date().toISOString() });
              } else {
                const res = await updateVoxel(projectId, voxelData, "Editing", current.prompt);
                updateProject(projectId, { status: "Editing",  voxelDataLink: `voxelData/${projectId}.json`, lastModified: new Date().toISOString() });
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
    }
  },
    [gl, user, projectId, projects, setLoading, toast, updateProject, voxels, viewMode]
  );

  const autoSave = useCallback(async () => {
    if (current.status === 'Generating') return;

    if (localStorage.getItem("voxelData")?.length !== voxels.length) {
      console.log("autoSaved");
      const voxelData = voxels.map(voxel => ({ x: voxel.x, y: voxel.y, z: voxel.z }));
      try {
        const res = await updateVoxel(projectId, voxelData, "Editing", current.prompt);
        updateProject(projectId, { status: "Editing", lastModified: new Date().toISOString() });
      } catch (error) {
        console.log(error);
      }
    }
  }, [projectId, projects, voxels, updateProject]);

  useEffect(() => {
    document.addEventListener('keyup', save);
    const timer = setInterval(autoSave, 60 * 1000);

    return () => {
      document.removeEventListener('keyup', save);
      clearInterval(timer);
    }
  }, [save, autoSave]);

  return (
    <>
      {viewMode === 'voxel' && <Suspense fallback={<Html center><p className="text-2xl">Loading...</p></Html>}>
        <VoxelsView voxels={voxels} />
      </Suspense>}
      {viewMode === 'mesh' && <Suspense fallback={<Html center><p className="text-2xl">Loading...</p></Html>}>
        <MeshView mesh={mesh} />
      </Suspense>}
      {viewMode === 'model' && <>
        <Suspense fallback={<Html center><p className="text-2xl">Loading...</p></Html>}>
          <ModelView />
        </Suspense>
        <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
      </>}
    </>
  )
}

const Scene: React.FC = () => {
  return (
    <div className="canvas">
      <InfoBox />
      <StatusBar />
      <ToolInfo />
      <ModelTip />
      <div className="w-full h-full">
        <Canvas
          shadows="soft"
          flat={true}
          dpr={[1, 1]}
          frameloop="demand"
          gl={{ preserveDrawingBuffer: true, powerPreference: 'high-performance', antialias: false }}
        >
          <Environment files="/models/mud_road_puresky_1k.hdr" />
          <SceneBackground />
          <PerspectiveCamera makeDefault position={[0, 2.0, 2.0]} />
          <ambientLight intensity={0} />
          {/* <ambientLight intensity={0.5 * Math.PI} /> */}
          {/* <directionalLight castShadow position={[2.5, 4, 5]} intensity={1} shadow-mapSize={1024}>
            <orthographicCamera attach="shadow-camera" args={[-10, 10, -10, 10, 0.1, 50]} />
          </directionalLight> */}
          <Views />
          <OrbitControls makeDefault />
        </Canvas>
      </div>
    </div>
  );
}

export default Scene;