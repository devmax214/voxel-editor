'use client'

import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, RoundedBox, Environment } from "@react-three/drei";
import * as THREE from "three";
import usePLYLoader from "@/hooks/usePLYLoader";
import { Voxel } from "utils/voxel";

import ToolInfo from "./ToolInfo";
import StatusBar from "./StatusBar";

const voxelSize = Number(process.env.NEXT_PUBLIC_VOXEL_SIZE);

type VoxelsProps = {
  voxels: Voxel[];
}

const Voxels: React.FC<VoxelsProps> = ({ voxels }) => (
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

const SceneBackground: React.FC = () => {
  const { scene } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color('grey');
  }, [scene]);

  return null;
}

const Scene: React.FC = () => {
  const controlsRef = useRef(null);
  const [plyFile, setPlyFile] = useState<File | null>(null);

  const voxelData = usePLYLoader(plyFile, voxelSize);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length) {
      setPlyFile(files[0]);
    }
  };

  return (
    <div className="canvas">
      <div className="absolute z-10">
        <input type='file' onChange={handleFileUpload} id="plyUpload" accept=".ply" />
      </div>
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
            {voxelData && <Voxels voxels={voxelData} />}
          </Suspense>
          <OrbitControls ref={controlsRef} />
        </Canvas>
      </div>
    </div>
  );
}

export default Scene;