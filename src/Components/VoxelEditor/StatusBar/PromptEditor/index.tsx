import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import VoxelCase from './VoxelCase';
import MeshCase from './MeshCase';
import ModelCase from './ModelCase';
import { useBasicStore } from '@/store';
import { useProjectContext } from '@/contexts/projectContext';
import { ProjectStatus } from 'utils/types';

const PromptEditor = () => {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { viewMode, setViewMode } = useBasicStore();
  const { projects } = useProjectContext();
  const current = projects.filter(project => project.id === projectId)[0];

  useEffect(() => {
    if (current){
      if (current?.status === ProjectStatus.MaterialCompleted || current?.status === ProjectStatus.MaterialGenerating)
        setViewMode('model');
      else if (current?.status === ProjectStatus.GeometryEditing || current?.status === ProjectStatus.GeometryGenerating || current?.status === ProjectStatus.MaterialFailed)
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
