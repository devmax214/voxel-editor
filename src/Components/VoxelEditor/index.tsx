'use client'

import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, RoundedBox, Environment } from "@react-three/drei";
import * as THREE from "three";
import { useBasicStore, useThreeStore } from "@/store";
import { Voxel } from "utils/voxel";

import ToolInfo from "./ToolInfo";
import StatusBar from "./StatusBar";
import { Loading } from "@ui/Spinner";

const voxelSize = Number(process.env.NEXT_PUBLIC_VOXEL_SIZE);

type VoxelsProps = {
  voxels: Voxel[] | null;
}

const VoxelsView: React.FC<VoxelsProps> = ({ voxels }) => {
  if (!voxels)
    return null;

  return (
    <>
      {voxels.map((voxel, index) => (
        <RoundedBox key={index} args={voxel.size} position={voxel.position} radius={voxelSize / 20}>
          <meshStandardMaterial color={0x00ff00} wireframe={false} />
        </RoundedBox>
        // <mesh key={index} position={voxel.position}>
        //   <boxGeometry args={voxel.size} />
        // </mesh>
      ))}
    </>
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
          <PerspectiveCamera makeDefault position={[0, 1, 3]} />
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