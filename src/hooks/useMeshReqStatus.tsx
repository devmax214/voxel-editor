'use client'

import { useState, useEffect } from "react";
import * as THREE from "three";
import { voxelizeMesh } from "utils/voxel";
import { useBasicStore } from "@/store";

type Vertex = [number, number, number];
type Triangle = [number, number, number];

interface MeshData {
  faces: Triangle[],
  vertices: Vertex[]
}

const useMeshReqStatus = (meshData: MeshData | null, voxelSize: number) => {
  const [vertices, setVertices] = useState<THREE.Vector3[]>([]);
  const [mesh, setMesh] = useState<THREE.BufferGeometry | null>(null);
  const { setLoading } = useBasicStore();
  // const sleep = (ms:number) => new Promise(resolve => setTimeout(resolve, ms));
  useEffect(() => {
    if (!meshData) return;

    const loadData = async () => {
      try {
        console.log("load");
        setLoading(true);
        const convertData = async (meshData: MeshData) => {
          const tmpGeometry = new THREE.BufferGeometry();
  
          const vertexs = [];
          for (let i = 0; i < meshData.vertices.length; i++) {
            vertexs.push(...meshData.vertices[i]);
          }
          const verticesArray = new Float32Array(vertexs);
          tmpGeometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesArray, 3));
      
          const indices = [];
          for (let i = 0; i < meshData.faces.length; i++) {
            indices.push(...meshData.faces[i]);
          }
          const indicesArray = new Uint32Array(indices);
          tmpGeometry.setIndex(new THREE.BufferAttribute(indicesArray, 1));
          tmpGeometry.computeVertexNormals();
          return tmpGeometry;
        }
        
        const geometry = await convertData(meshData);
        // await sleep(3000);
        // const mesh = new THREE.Mesh(geometry, Material)
        console.log("voxelize");
        const vertices = voxelizeMesh(geometry, voxelSize);
        setMesh(geometry);
        setVertices(vertices);
        console.log("done");
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [meshData, voxelSize, setLoading]);

  return [vertices, mesh] as [typeof vertices, typeof mesh];
}

export default useMeshReqStatus;
