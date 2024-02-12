'use client'

import React, { Suspense, useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useBasicStore, useThreeStore } from "@/store";

import ToolInfo from "./ToolInfo";
import StatusBar from "./StatusBar";
import InfoBox from "./InfoBox";
import { Material } from "utils/voxel";

const voxelSize = Number(process.env.NEXT_PUBLIC_VOXEL_SIZE);

type VoxelProps = {
  position: THREE.Vector3;
}

const Voxel: React.FC<VoxelProps> = (props) => {
  const [hover, set] = useState<number | null>(null);
  const { removeMode } = useBasicStore();
  const { addVoxel, removeVoxel } = useThreeStore();

  const onMove = useCallback((e: ThreeEvent<PointerEvent>) => e.faceIndex && (e.stopPropagation(), set(Math.floor(e.faceIndex / 2))), []);
  const onOut = useCallback(() => set(null), [])
  const onClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.faceIndex !== undefined) {
      if (!removeMode) {
        const { x, y, z } = props.position;
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
      }
      else {
        removeVoxel(props.position, voxelSize);
      }
    }
  }, [removeMode, addVoxel, removeVoxel, props]);

  return (
    <mesh type="static" receiveShadow castShadow onPointerMove={onMove} onPointerOut={onOut} onClick={onClick} position={props.position}>
      {[...Array(6)].map((_, index) => (
        <meshStandardMaterial key={index} attach={`material-${index}`} color={hover === index ? 0xff0000 : 0x00ff00} />
      ))}
      <boxGeometry args={[voxelSize * 0.99, voxelSize * 0.99, voxelSize * 0.99]} />
    </mesh>
  )
} 

type VoxelsProps = {
  voxels: THREE.Vector3[];
}

const VoxelsView: React.FC<VoxelsProps> = ({ voxels }) => {
  return (
    <>
      {voxels.map((voxel, index) => (<Voxel key={index} position={voxel} />))}
    </>
  );
};

type MeshProps = {
  mesh: THREE.BufferGeometry | null;
}

const MeshView: React.FC<MeshProps> = ({ mesh }) => {
  if (!mesh)
    return null;

  const data = new THREE.Mesh(mesh, Material);
  
  return (
    <primitive object={data} />
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
  const { viewMode } = useBasicStore();
  const { voxels, mesh } = useThreeStore();

  console.log(voxels);

  return (
    <div className="canvas">
      <InfoBox />
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