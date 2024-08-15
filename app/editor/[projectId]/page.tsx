'use client'

import React, {useState} from 'react';
import * as THREE from "three";
import { useThreeStore } from '@/store';
import { useProjectContext } from '@/contexts/projectContext';
import VoxelEditor from '@/Components/VoxelEditor';
import { storage } from '@/Firebase/config';
import { ref, getDownloadURL } from 'firebase/storage';
import { Voxel } from 'utils/types';

interface Props {
  params: {
    projectId: string;
  }
}

export default function Page({ params }: Props) {
  const { projects } = useProjectContext();
  const { setVoxels } = useThreeStore();
  const { projectId } = params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    
    const current = projects.filter(project => project.id === projectId)[0];
    const fetchVoxelData = async () => {
      try {
          const filePath = current.voxelDataLink;
          const voxelRef = ref(storage, filePath); 
          const url = await getDownloadURL(voxelRef);
          const response = await fetch(url);
          const data = await response.json();
          const voxelData = data.map(( pos: Voxel )=> new THREE.Vector3(pos.x, pos.y, pos.z));
          console.log("hererererer");
          console.log(data);
          setVoxels(voxelData);
      } catch (err) {
          // setError(err);
      } finally {
          setLoading(false);
      }
    };
    if (projects.length > 0) {
      if (current) {
        console.log(current); 
        fetchVoxelData();
      }
    }
  }, [projects, projectId, setVoxels]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <VoxelEditor />
  )
}
