import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import { useThree, ThreeEvent, useLoader } from "@react-three/fiber";
import { useBasicStore, useThreeStore } from "@/store";

const voxelSize = Number(process.env.NEXT_PUBLIC_VOXEL_SIZE);

type VoxelsProps = {
  voxels: THREE.Vector3[];
}

const VoxelView: React.FC<VoxelsProps> = ({ voxels }) => {
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

export default VoxelView;