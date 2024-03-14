import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import { useParams } from "next/navigation";
import { useThree, ThreeEvent, useLoader } from "@react-three/fiber";
import { useBasicStore, useThreeStore } from "@/store";
import useMaterial from "@/hooks/useMaterial";
import { useToast } from "@chakra-ui/react";
import { cropToSquare } from "utils/utils";
import { getDownloadURL, ref, getStorage, uploadBytes } from "firebase/storage";
import { voxelCreated, updateVoxel } from "@/Firebase/dbactions";
import { useAuthContext } from "@/contexts/authContext";
import { useProjectContext } from "@/contexts/projectContext";

const voxelSize = Number(process.env.NEXT_PUBLIC_VOXEL_SIZE);

const VoxelView: React.FC = () => {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { user } = useAuthContext();
  const { projects, updateProject } = useProjectContext();
  const { gl } = useThree();
  const { viewMode, setLoading } = useBasicStore();
  const { voxels } = useThreeStore();
  const toast = useToast();

  const tempBoxes = useMemo(() => new THREE.Object3D(), []);
  const tmpBox = useRef<THREE.Mesh>(null);
  const [tmpPos, setTmpPos] = useState<THREE.Vector3 | undefined>(undefined);

  // const aoMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_AO_2K.jpg");
  // const colMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_COL_2K.jpg");
  // const glossMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_GLOSS_2K.jpg");
  // const normalMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_NRM_2K.jpg");
  // const metalnessMap = useLoader(THREE.TextureLoader, "/textures/TerracottaClay001_REFL_2K.jpg");

  const boxGeometry = useMemo(() => new THREE.BoxGeometry(voxelSize * 0.98, voxelSize * 0.98, voxelSize * 0.98), []);
  const material = useMaterial();
  // const material = useMemo(() => new THREE.MeshPhysicalMaterial({
  //   side: THREE.DoubleSide,
  //   wireframe: false,
  //   map: colMap,
  //   aoMap: aoMap,
  //   normalMap: normalMap,
  //   specularColorMap: metalnessMap,
  //   roughnessMap: glossMap,
  //   reflectivity: 0.5,
  //   roughness: 0.8,
  //   metalness: 0.3
  // }), [aoMap, colMap, normalMap, metalnessMap, glossMap]);
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

  // const save = useCallback(async (e: KeyboardEvent) => {
  //   const current = projects.filter(project => project.id === projectId)[0];
  //   if (current.status === 'Generating') return;

  //   if (e.code === "Backslash" && user) {
  //     e.preventDefault();
  //     if (viewMode === 'voxel') {
  //       gl.domElement.toBlob(async (blob) => {
  //         if (blob) {
  //           try {
  //             setLoading(true);
  //             const croppedBlob = await cropToSquare(blob);
  //             const storage = getStorage();
  //             const storageRef = ref(storage, `${projectId}/icon.png`);
  //             const snapshot = await uploadBytes(storageRef, croppedBlob);
  //             const iconUrl = await getDownloadURL(storageRef);

  //             console.log("saved", current);
  //             const voxelData = voxels.map(voxel => ({ x: voxel.x, y: voxel.y, z: voxel.z }));
  //             if (current.voxelData.length === 0) {
  //               const res: any = await voxelCreated(user.uid, projectId, 0, voxelData, iconUrl, current.prompt);
  //               updateProject(projectId, { status: res.project.status, voxelData: voxelData, lastModified: new Date().toISOString() });
  //             } else {
  //               const res = await updateVoxel(projectId, voxelData, "Editing", current.prompt);
  //               updateProject(projectId, { status: "Editing", voxelData: voxelData, lastModified: new Date().toISOString() });
  //             }
  //             toast({
  //               title: 'Success',
  //               description: "You saved voxel data successfully.",
  //               status: 'success',
  //               position: 'top',
  //               duration: 3000,
  //               isClosable: true,
  //             });
  //             setLoading(false);
  //           } catch (error) {
  //             setLoading(false);
  //           }
  //         }
  //       }, 'image/png');
  //     }
  //   }
  // },
  //   [gl, user, projectId, projects, setLoading, toast, updateProject, voxels, viewMode]
  // );

  // const autoSave = useCallback(async () => {
  //   const current = projects.filter(project => project.id === projectId)[0];
  //   if (current.status === 'Generating') return;

  //   if (current?.voxelData.length !== voxels.length) {
  //     console.log("autoSaved");
  //     const voxelData = voxels.map(voxel => ({ x: voxel.x, y: voxel.y, z: voxel.z }));
  //     try {
  //       const res = await updateVoxel(projectId, voxelData, "Editing", current.prompt);
  //       updateProject(projectId, { voxelData: voxelData, status: "Editing", lastModified: new Date().toISOString() });
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  // }, [projectId, projects, voxels, updateProject]);

  // useEffect(() => {
  //   document.addEventListener('keyup', save);
  //   const timer = setInterval(autoSave, 60 * 1000);

  //   return () => {
  //     document.removeEventListener('keyup', save);
  //     clearInterval(timer);
  //   }
  // }, [save, autoSave]);

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

export default VoxelView;