import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useBasicStore, useThreeStore } from '@/store';
import useMeshReqStatus from '@/hooks/useMeshReqStatus';
import { getStatusById, requestMesh } from 'utils/apiCall';
import { Input } from '@chakra-ui/input';
import { Button, Spinner } from '@chakra-ui/react';
import { changeProjectName, startStage2 } from 'utils/api';
import { useProjectContext } from "@/contexts/projectContext";
import { checkStatus } from '@/Firebase/dbactions';

const voxelSize = Number(process.env.NEXT_PUBLIC_VOXEL_SIZE);

const PromptEditor = () => {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [reqId, setReqId] = useState<string| null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { voxels, setVoxels, setMesh, projectName, setProjectName } = useThreeStore();
  const [propmt, setPrompt] = useState<string>('');
  const [meshData, setMeshData] = useState(null);
  const { setMeshReqStatus, setLoading, setViewMode } = useBasicStore();
  const { updateProject } = useProjectContext();

  const [voxelData, imMesh] = useMeshReqStatus(meshData, voxelSize);

  useEffect(() => {
    const savedId = window.localStorage.getItem(projectId);
    if (savedId) {
      setReqId(savedId);
    }
    const savedGenerating = window.sessionStorage.getItem(projectId);
    if (savedGenerating) {
      setIsGenerating(true);
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

  const delay = useCallback((ms: number) => new Promise(resolve => setTimeout(resolve, ms)), []);

  useEffect(() => {    
    if (!reqId) return;

    const checkReq = async () => {
      const res = await getStatusById(reqId);
      if (res) {
        setMeshReqStatus(res.status);
        if (res.status === 'IN_QUEUE' || res.status === 'IN_PROGRESS') {
          setLoading(true);
          await delay(3000);
          checkReq();
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
  }, [projectId, reqId, setLoading, setMeshReqStatus, delay]);

  const handleGenerate = async () => {
    const res = await requestMesh(propmt);
    if (res) {
      window.localStorage.setItem(projectId, res.id);
      setReqId(res.id);
      if (!projectName)
        await updateProjectName();
    }
  }

  useEffect(() => {
    if (!isGenerating) return;

    const checkReq = async () => {
      const res = await checkStatus(projectId) as ({status: string, progress: number});
      console.log(res);
      if (res) {
        if (res.status === 'Editing' || res.status === 'Generating') {
          await delay(10000);
          checkReq();
        }
        else if (res.status === 'Completed') {
          setViewMode('mesh');
          window.sessionStorage.removeItem(projectId);
          setIsGenerating(false);
        }
      }
    }

    checkReq();
  }, [projectId, isGenerating, delay, setViewMode]);

  const handleGenerateModel = async () => {
    startStage2(projectId, propmt);
    window.sessionStorage.setItem(projectId, "true");
    setIsGenerating(true);
  }

  return (
    <div className="flex gap-x-2">
      <Input placeholder="Propmt" value={propmt} onChange={e => setPrompt(e.target.value)} />
      <Button colorScheme='orange' onClick={handleGenerate} isDisabled={propmt === ''}>Generate<br />Voxel</Button>
      <Button colorScheme='blue' onClick={handleGenerateModel} isDisabled={propmt === '' || voxels.length === 0 || isGenerating}>
        {isGenerating ?
          <div>
            <Spinner />
          </div>
          :
          <div>Generate<br />Model</div>
        }
      </Button>
    </div>
  );
}

export default PromptEditor;
