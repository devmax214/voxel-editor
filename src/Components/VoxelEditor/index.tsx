'use client'

import React, { Suspense, useRef, useState, useEffect, useCallback, useMemo, PointerEventHandler, useLayoutEffect } from "react";
import { Canvas, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, RoundedBox, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useBasicStore, useThreeStore } from "@/store";

import ToolInfo from "./ToolInfo";
import StatusBar from "./StatusBar";
import { Loading } from "@ui/Spinner";

const voxelSize = Number(process.env.NEXT_PUBLIC_VOXEL_SIZE);

type VoxelsProps = {
  voxels: THREE.Vector3[] | null;
}

const VoxelsView: React.FC<VoxelsProps> = ({ voxels }) => {
  const rollOverMeshRef = useRef<THREE.Mesh>(null);
  const [attachables, setAttachables] = useState<THREE.Mesh[]>([]);
  const { camera, size, scene } = useThree();
  const rayCaster = new THREE.Raycaster();

  const geometry = useMemo(() => {
    return new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
  }, []);
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 'blue',
      opacity: 0.5,
      transparent: true,
    });
  }, []);

  useEffect(() => {
    if (voxels) {
      let tmp = voxels.map(voxel => new THREE.Mesh(geometry, material));
      setAttachables(tmp);
    }
  }, [voxels]);

  
  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    const save = camera.position.clone();
    rayCaster.setFromCamera(event.pointer, camera);
    const intersects = rayCaster.intersectObjects(attachables);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      rollOverMeshRef.current?.position.copy(intersect.point).add(intersect.face!.normal);
      rollOverMeshRef.current?.position.divideScalar(voxelSize).floor().multiplyScalar(voxelSize).addScalar(voxelSize/2)
    }
    camera.position.set(save.x, save.y, save.z);
  }

  if (!voxels)
    return null;

  return (
    <group onPointerMove={handlePointerMove}>
      <mesh ref={rollOverMeshRef}>
        <boxGeometry args={[voxelSize, voxelSize, voxelSize]} />
        <meshStandardMaterial color={0x00ff00} transparent={true} opacity={0.5} wireframe={false} />
      </mesh>

      {voxels.map((voxel, index) => (
        <RoundedBox key={index} args={[voxelSize, voxelSize, voxelSize]} position={voxel} radius={voxelSize / 20}>
          <meshStandardMaterial color={0x00ff00} wireframe={false} />
        </RoundedBox>
      ))}
    </group>
  );
};

type MeshProps = {
  mesh: THREE.Mesh | null;
}

const MeshView: React.FC<MeshProps> = ({ mesh }) => {
  if (!mesh)
    return null;

  return (
    <>
      <primitive object={mesh} />
    </>
  );
}

const SceneBackground: React.FC = () => {
  const { scene } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color('grey');
  }, [scene]);

  return null;
}

const Scene: React.FC = () => {
  const controlsRef = useRef(null);
  const { loading, viewMode } = useBasicStore();
  const { voxels, mesh } = useThreeStore();

  console.log(loading);

  return (
    <div className="canvas">
      <Loading isLoading={loading} />
      <ToolInfo />
      <StatusBar />
      <div className="w-full h-full">
        <Canvas>
          <Environment files="/models/potsdamer_platz_1k.hdr" />
          <SceneBackground />
          <PerspectiveCamera makeDefault position={[0, 0, 3]} />
          <ambientLight intensity={0.1} />
          <directionalLight position={[1, 1, 1]} intensity={1} />
          <Suspense fallback={null}>
            {
              viewMode === 'voxel'
              ?
              <VoxelsView voxels={voxels} />
              :
              <MeshView mesh={mesh} />
            }
          </Suspense>
          <OrbitControls ref={controlsRef} />
        </Canvas>
      </div>
    </div>
  );
}

export default Scene;