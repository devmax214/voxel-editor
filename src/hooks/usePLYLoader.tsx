import { useState, useEffect } from "react";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import { voxelizeMesh, Voxel } from "utils/voxel";

const usePLYLoader = (file: File | null, voxelSize: number) => {
  const [vertices, setVertices] = useState<Voxel[] | null>(null);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        if (event.target && event.target.result) {
          const loader = new PLYLoader();
          const geometry = loader.parse(event.target.result as ArrayBuffer);
          // geometry.computeVertexNormals();
          const material = new THREE.MeshPhongMaterial({color: 0x00ff00, wireframe: false});
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
  }, [file, voxelSize]);

  return vertices;
}

export default usePLYLoader;