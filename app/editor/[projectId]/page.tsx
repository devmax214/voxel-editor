'use client'

import React from 'react';
import * as THREE from "three";
import { useThreeStore } from '@/store';
import { useProjectContext } from '@/contexts/projectContext';
import Editor from '@/Page/Editor/Editor';

interface Props {
  params: {
    projectId: string;
  }
}

export default function Page({ params }: Props) {
  const { projects } = useProjectContext();
  const { setVoxels } = useThreeStore();
  const { projectId } = params;

  React.useEffect(() => {
    if (projects.length > 0) {
      const current = projects.filter(project => project.id === projectId)[0];
      if (current) {
        const voxelData = current.voxelData.map(pos => new THREE.Vector3(pos.x, pos.y, pos.z));
        setVoxels(voxelData);
      }
    }
  }, [projects, projectId, setVoxels]);

  return (
    <Editor />
  )
}
