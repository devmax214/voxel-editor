import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useBasicStore, useThreeStore } from '@/store';
import useMeshReqStatus from '@/hooks/useMeshReqStatus';
import { getStatusById, requestMesh } from 'utils/apiCall';
import { Input } from '@chakra-ui/input';
import { Button } from '@chakra-ui/react';
import { changeProjectName } from 'utils/api';
import { useProjectContext } from "@/contexts/projectContext";

const voxelSize = Number(process.env.NEXT_PUBLIC_VOXEL_SIZE);

const PromptEditor = () => {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [reqId, setReqId] = useState<string| null>(null);
  const { setVoxels, setMesh, setProjectName } = useThreeStore();
  const [propmt, setPrompt] = useState<string>('');
  const [meshData, setMeshData] = useState(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const { setMeshReqStatus, setLoading } = useBasicStore();
  const { updateProject } = useProjectContext();

  const [voxelData, imMesh] = useMeshReqStatus(meshData, voxelSize);

  useEffect(() => {
    const savedId = window.localStorage.getItem(projectId);
    if (savedId) {
      setReqId(savedId);
    }
  }, [projectId]);

  useEffect(() => {
    setVoxels(voxelData);
    setMesh(imMesh);
  }, [voxelData, setVoxels, imMesh, setMesh]);

  const updateProjectName = async () => {
    try {
      const res = await changeProjectName(projectId, propmt);
      setProjectName(res.name);
      updateProject(projectId, { name: res.name });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {    
    if (!reqId) return;

    const checkReq = async () => {
      const res = await getStatusById(reqId);
      if (res) {
        setMeshReqStatus(res.status);
        if (res.status === 'IN_QUEUE' || res.status === 'IN_PROGRESS') {
          setLoading(true);
          setTimer(setTimeout(checkReq, 3000));
        }
        else if (res.status === 'COMPLETED') {
          setLoading(false);
          window.localStorage.removeItem(projectId);
          setReqId(null);
          setMeshData(res.output);
        }
      }
    }
    
    checkReq();
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }, [projectId, reqId, setLoading, setMeshReqStatus]);

  const handleGenerate = async () => {
    const res = await requestMesh(propmt);
    if (res) {
      window.localStorage.setItem(projectId, res.id);
      setReqId(res.id);
      await updateProjectName();
    }
  }

  return (
    <div className="flex gap-x-2 w-96">
      <Input placeholder="Propmt" value={propmt} onChange={e => setPrompt(e.target.value)} />
      <Button onClick={handleGenerate} isDisabled={propmt === ''}>Generate</Button>
    </div>
  );
}

export default PromptEditor;
