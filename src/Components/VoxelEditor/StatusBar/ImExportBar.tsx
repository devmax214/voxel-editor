import React, { useState, useEffect } from 'react';
import * as THREE from "three";
import { PLYExporter } from 'three/examples/jsm/exporters/PLYExporter.js';
import { useBasicStore, useThreeStore } from '@/store';
import usePLYLoader from '@/hooks/usePLYLoader';
import { Material } from 'utils/voxel';
import { Button } from '@chakra-ui/react';
import { voxelSize } from 'utils/utils';

const ImExportBar = () => {
  const [plyFile, setPlyFile] = useState<File | null>(null);
  const { viewMode } = useBasicStore();
  const { setVoxels, setMesh, mesh } = useThreeStore();

  const [voxelData, imMesh] = usePLYLoader(plyFile, voxelSize);

  useEffect(() => {
    // setVoxels(voxelData);
    setMesh(imMesh);
  }, [voxelData, setVoxels, imMesh, setMesh]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length) {
      setPlyFile(files[0]);
    }
  };

  const handleExportMesh = () => {
    const exporter = new PLYExporter();
    
    if (mesh !== null) {
      const data = new THREE.Mesh(mesh, Material);
      exporter.parse(data, (result) => {
        const blob = new Blob([result], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export.ply';
        a.click();
      }, { binary: true });
    } else {
      alert('No mesh data!');
    }
  }

  if (viewMode === 'voxel')
    return null;

  return (
    <div className="flex gap-x-2">
      {viewMode === 'mesh' &&<div className="relative">
        <input
          className="absolute w-full h-full opacity-0 z-10"
          type="file"
          accept=".ply"
          onChange={handleFileUpload}
          />
        <Button className="absolute uppercase z-0">import</Button>
      </div>}
      {/* <Button as={'div'} className="uppercase" onClick={handleExportMesh}>export</Button> */}
    </div>
  );
}

export default ImExportBar;
