import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import VoxelCase from './VoxelCase';
import MeshCase from './MeshCase';
import ModelCase from './ModelCase';
import { useBasicStore } from '@/store';
import { useProjectContext } from '@/contexts/projectContext';

const PromptEditor = () => {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { viewMode, setViewMode } = useBasicStore();
  const { projects } = useProjectContext();
  const current = projects.filter(project => project.id === projectId)[0];

  useEffect(() => {
    if (current){
      if (current?.status === 'Material Completed' || current?.status === 'Material Generating')
        setViewMode('model');
      else if (current?.status === 'Geometry Editing' || current?.status === 'Geometry Generating' || current?.status === 'Material Failed')
        setViewMode('mesh');
      else setViewMode('voxel');
    }
  }, [current, setViewMode]);

  return (
    <div>
      { viewMode === 'voxel' && <VoxelCase projectId={projectId} current={current} />}
      { viewMode === 'mesh' && <MeshCase projectId={projectId} current={current} />}
      { viewMode === 'model' && <ModelCase projectId={projectId} current={current} />}
    </div>
  );
}

export default PromptEditor;
