'use client'

import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import * as THREE from "three";

import Grid from "./Grid";

type Voxel = {
  position: [number, number, number],
  size: [number, number, number];
};
type VoxelsProps = {
  voxels: Voxel[];
}

const Voxels: React.FC<VoxelsProps> = ({ voxels }) => (
  <>
    {voxels.map((voxel, index) => (
      <mesh key={index} position={voxel.position}>
        <boxGeometry args={voxel.size} />
        <meshStandardMaterial color={0x00ff00} wireframe={false} />
      </mesh>
    ))}
  </>
);

const usePLYLoader = (file: File | null) => {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        if (event.target && event.target.result) {
          const loader = new PLYLoader();
          const geometry = loader.parse(event.target.result as ArrayBuffer);
          setGeometry(geometry);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file]);

  return geometry;
}

const Scene: React.FC = () => {
  const controlsRef = useRef(null);
  const [plyFile, setPlyFile] = useState<File | null>(null);

  const plyGeometry = usePLYLoader(plyFile);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length) {
      setPlyFile(files[0]);
    }
  };

  const voxelData: Voxel[] = [];

  return (
    <>
      <div style={{ width: "100vw", height: "100vh" }}>
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[1, 1, 1]} />
          <Suspense fallback={null}>
            <Voxels voxels={voxelData} />
            {plyGeometry && <primitive object={new THREE.Mesh(plyGeometry)} />}
          </Suspense>
          <OrbitControls ref={controlsRef} />
        </Canvas>
      </div>
      <input type='file' onChange={handleFileUpload} id="plyUpload" accept=".ply" />
    </>
  );
}

const Page: React.FC = () => {
  return <Scene />;
}

export default Page;