'use client'

import { useState, useEffect } from "react";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import { voxelizeMesh, Material } from "utils/voxel";
import { useBasicStore } from "@/store";

const usePLYLoader = (file: File | null, voxelSize: number) => {
  const [vertices, setVertices] = useState<THREE.Vector3[]>([]);
  const [mesh, setMesh] = useState<THREE.BufferGeometry | null>(null);
  const { setLoading } = useBasicStore();

  useEffect(() => {
    if (!file) return;
  
    const loadFile = async () => {
      try {
        setLoading(true);
        const readFile = (file: File) => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event: ProgressEvent<FileReader>) => {
            resolve(event.target?.result);
          };
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        });
  
        const arrayBuffer = await readFile(file);
        if (arrayBuffer) {
          const loader = new PLYLoader();
          const geometry = loader.parse(arrayBuffer as ArrayBuffer);
          geometry.computeVertexNormals();
          
          // const mesh = new THREE.Mesh(geometry, Material);
          // const vertices = voxelizeMesh(geometry, voxelSize);
          setMesh(geometry);
          // setVertices(vertices);
        }
      } catch (error) {
        console.error("Error reading file:", error);
      } finally {
        setLoading(false);
      }
    };
  
    loadFile();
  }, [file, voxelSize, setLoading]);

  return [vertices, mesh] as [typeof vertices, typeof mesh];
}

export default usePLYLoader;