import React, { useCallback } from 'react';
import { useParams } from 'next/navigation';
import * as THREE from "three";
import { PLYExporter } from 'three/examples/jsm/exporters/PLYExporter.js';
import { useBasicStore, useThreeStore } from '@/store';
import { Material } from 'utils/voxel';
import { Button } from '@chakra-ui/react';
import { updateMesh } from '@/Firebase/dbactions';
import { useProjectContext } from '@/contexts/projectContext';
import { ProjectStatus } from 'utils/types';

const ImExportBar = () => {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { viewMode } = useBasicStore();
  const { mesh } = useThreeStore();
  const { projects, updateProject } = useProjectContext();
  const current = projects.find(project => project.id === projectId);

  const captureImage = useCallback(() => {
    const evt = new KeyboardEvent('keyup', {
        bubbles: true,
        cancelable: true,
        code: "F9"
    });

    document.dispatchEvent(evt);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files?.length && current) {
      await updateMesh(projectId, files[0]);
      updateProject(projectId, { status: ProjectStatus.GeometryEditing, meshGenerated: true });
      setTimeout(captureImage, 4000);
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

  if (viewMode === 'voxel' || viewMode === 'model')
    return null;

  return (
    <div className="flex gap-x-2">
      {viewMode === 'mesh' && <div className="relative">
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
