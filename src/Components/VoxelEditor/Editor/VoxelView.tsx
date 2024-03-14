import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useThree, ThreeEvent } from "@react-three/fiber";
import { useBasicStore, useThreeStore } from "@/store";
import useMaterial from "@/hooks/useMaterial";
import { useToast } from "@chakra-ui/react";
import { cropToSquare, voxelSize } from "utils/utils";
import { voxelCreated, updateVoxel } from "@/Firebase/dbactions";
import { useAuthContext } from "@/contexts/authContext";
import { useProjectContext } from "@/contexts/projectContext";
import { ProjectStatus, Voxel } from "utils/types";
import axios from "axios";

const VoxelView = ({
  projectId
} : {
  projectId: string
}) => {
  const [voxelData, setVoxelData] = useState<Voxel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toast = useToast();
  const { user } = useAuthContext();
  const { projects, updateProject } = useProjectContext();
  const { gl } = useThree();
  const { viewMode, setLoading } = useBasicStore();
  const current = projects.find((project) => project.id === projectId);

  const tempBoxes = useMemo(() => new THREE.Object3D(), []);
  const tmpBox = useRef<THREE.Mesh>(null);
  const [tmpPos, setTmpPos] = useState<THREE.Vector3 | null>(null);

  const boxGeometry = useMemo(() => new THREE.BoxGeometry(voxelSize * 0.98, voxelSize * 0.98, voxelSize * 0.98), []);
  const material = useMaterial();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { raycaster, mouse, camera } = useThree();

  const { removeMode } = useBasicStore();
  const { voxels, addVoxel, removeVoxel, setVoxels, setMesh } = useThreeStore();

  const baseURL = `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/getAsset?projectId=${projectId}&fileName=`;

  const getVoxelData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = (await axios.get(`${baseURL}voxel.json`)).data;
      const parseData = res.map((v: Voxel) => new THREE.Vector3(v.x, v.y, v.z));
      setVoxelData(parseData);
      setVoxels(parseData);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }, [baseURL, setVoxels]);

  useEffect(() => {
    if (current?.voxelGenerated)
      getVoxelData();
    setMesh(null);
  }, [current, getVoxelData, setMesh]);

  useEffect(() => {
    if (meshRef.current) {
      for (let i = 0; i < voxels.length; i++) {
        tempBoxes.position.set(voxels[i].x, voxels[i].y, voxels[i].z);
        tempBoxes.updateMatrix();
        meshRef.current.setMatrixAt(i, tempBoxes.matrix);
      }

      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const onMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.faceIndex && meshRef.current) {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(meshRef.current);

      if (intersects.length > 0) {
        const { instanceId } = intersects[0];
        if (instanceId) {
          let tmpMatrix = new THREE.Matrix4();
          let tmpPosition = new THREE.Vector3();
          meshRef.current.getMatrixAt(instanceId, tmpMatrix);
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

  const onOut = useCallback(() => {
    setTmpPos(null);
  }, []);

  const onClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.faceIndex && meshRef.current) {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(meshRef.current);

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

  const save = useCallback(async (e: KeyboardEvent) => {
    const current = projects.filter(project => project.id === projectId)[0];
    if (e.code === "F8" && user) {
      e.preventDefault();
      if (viewMode === 'voxel') {
        gl.domElement.toBlob(async (blob) => {
          if (blob) {
            try {
              setLoading(true);
              const croppedBlob = await cropToSquare(blob);
              console.log("saved", current);
              const voxelTmpData = voxels.map(voxel => ({ x: voxel.x, y: voxel.y, z: voxel.z }));
              if (!current.voxelGenerated) {
                const res: any = await voxelCreated(user.uid, projectId, 0, voxelTmpData, croppedBlob, current.prompt);
                updateProject(projectId, { status: res.project.status, voxelGenerated: true, lastModified: new Date().toISOString() });
              } else {
                const res = await updateVoxel(projectId, voxelTmpData, current.prompt);
                updateProject(projectId, { status: ProjectStatus.VoxelEditing, lastModified: new Date().toISOString() });
              }
              setVoxelData(voxelTmpData);
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
    const current = projects.filter(project => project.id === projectId)[0];

    if (voxelData.length !== voxels.length) {
      console.log("autoSaved");
      const voxelTmpData = voxels.map(voxel => ({ x: voxel.x, y: voxel.y, z: voxel.z }));
      try {
        const res = await updateVoxel(projectId, voxelTmpData, current.prompt);
        updateProject(projectId, { status: ProjectStatus.VoxelEditing, lastModified: new Date().toISOString() });
        setVoxelData(voxelTmpData);
      } catch (error) {
        console.log(error);
      }
    }
  }, [projectId, voxelData, projects, voxels, updateProject]);

  useEffect(() => {
    document.addEventListener('keyup', save);
    const timer = setInterval(autoSave, 60 * 1000);

    return () => {
      document.removeEventListener('keyup', save);
      clearInterval(timer);
    }
  }, [save, autoSave]);

  return (
    <group rotation={[Math.PI * 3 / 2, 0, 0]}>
      {isLoading && <Html center><p className="text-2xl">Loading...</p></Html>}
      {tmpPos && <mesh ref={tmpBox} position={tmpPos}>
        <boxGeometry args={[voxelSize * 0.98, voxelSize * 0.98, voxelSize * 0.98]} />
      </mesh>}
      <instancedMesh
        ref={meshRef}
        args={[boxGeometry, material, voxels.length]}
        onPointerMove={onMove}
        onPointerLeave={onOut}
        onClick={onClick}
      />
    </group>
  );
};

export default VoxelView;