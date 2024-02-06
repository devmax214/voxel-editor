'use client'

import React, { Suspense, useRef, useState, useEffect, useLayoutEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import * as THREE from "three";

import { voxelizeMesh, Voxel } from "utils/voxel";
const voxelSize = Number(process.env.NEXT_PUBLIC_VOXEL_SIZE);

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
  const [vertices, setVertices] = useState<Voxel[] | null>(null);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        if (event.target && event.target.result) {
          const loader = new PLYLoader();
          const geometry = loader.parse(event.target.result as ArrayBuffer);
          // geometry.computeVertexNormals();
          const material = new THREE.MeshPhongMaterial({ color: 0x00ff00, wireframe: false });
          material.side = THREE.DoubleSide;

          material.transparent = true;
          material.opacity = 0.5;
          const mesh = new THREE.Mesh(geometry, material);

          const vertices = voxelizeMesh(mesh, voxelSize);
          setVertices(vertices);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file]);

  return vertices;
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
  const [plyFile, setPlyFile] = useState<File | null>(null);

  const voxelData = usePLYLoader(plyFile);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length) {
      setPlyFile(files[0]);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div className="absolute z-10">
        <input type='file' onChange={handleFileUpload} id="plyUpload" accept=".ply" />
      </div>
      <div className="w-full h-full">
        <Canvas
          dpr={[1, 1]}
        >
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

const Page: React.FC = () => {
  return <Scene />;
}

export default Page;