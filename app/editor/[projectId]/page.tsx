'use client'

import React from 'react';
import * as THREE from "three";
import { useThreeStore } from '@/store';
import { useProjectContext } from '@/contexts/projectContext';
import VoxelEditor from '@/Components/VoxelEditor';

interface Props {
  params: {
    projectId: string;
  }
}

export default function Page({ params }: Props) {
  const { projects } = useProjectContext();
  const { setProjectName, setVoxels } = useThreeStore();
  const { projectId } = params;

  React.useEffect(() => {
    if (projects.length > 0) {
      const current = projects.filter(project => project.id === projectId)[0];
      if (current) {
        setProjectName(current.name);
        const voxelData = current.voxelData.map(pos => new THREE.Vector3(pos.x, pos.y, pos.z));
        setVoxels(voxelData);
      }
    }
  }, [projects, projectId, setProjectName, setVoxels]);

  return (
    <VoxelEditor />
  )
}
