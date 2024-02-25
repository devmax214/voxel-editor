import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure
} from '@chakra-ui/react';
import { useBasicStore, useThreeStore } from '@/store';
import useMeshReqStatus from '@/hooks/useMeshReqStatus';
import { getStatusById, requestMesh } from 'utils/apiCall';
import { Input } from '@chakra-ui/input';
import { Button, Spinner } from '@chakra-ui/react';
import { changeProjectName, startStage2 } from 'utils/api';
import { useProjectContext } from "@/contexts/projectContext";
import { checkStatus } from '@/Firebase/dbactions';
import { generatePointCloud } from 'utils/voxel';

const voxelSize = Number(process.env.NEXT_PUBLIC_VOXEL_SIZE);

const PromptEditor = () => {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [reqId, setReqId] = useState<string| null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { voxels, setVoxels, setMesh, projectName, setProjectName } = useThreeStore();
  const [propmt, setPrompt] = useState<string>('');
  const [meshData, setMeshData] = useState(null);
  const { setMeshReqStatus, setLoading, setViewMode, viewMode } = useBasicStore();
  const { updateProject } = useProjectContext();

  const {isOpen, onOpen, onClose} = useDisclosure();
  const cancelRef = React.useRef(null);

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
    // setMesh(imMesh);
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

  const handleSave = useCallback(() => {
    const evt = new KeyboardEvent('keyup', {
        bubbles: true,
        cancelable: true,
        code: "Backslash"
    });

    document.dispatchEvent(evt);
  }, []);

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
          setViewMode('voxel');
          setMeshData(res.output);
          setTimeout(handleSave, 2000);
        }
      }
    }
    
    checkReq();
  }, [projectId, reqId, setLoading, setMeshReqStatus, delay, handleSave, setViewMode]);

  const handleGenerate = async () => {
    const res = await requestMesh(propmt);
    if (res) {
      window.localStorage.setItem(projectId, res.id);
      setReqId(res.id);
      if (projectName === 'undefined')
        await updateProjectName();
    }
  }

  useEffect(() => {
    if (!isGenerating) return;

    const checkReq = async () => {
      const res = await checkStatus(projectId) as ({status: string, progress: number});
      if (res) {
        if (res.status === 'Editing' || res.status === 'Generating') {
          await delay(10000);
          checkReq();
        }
        else if (res.status === 'Completed') {
          setViewMode('mesh');
          updateProject(projectId, {status: "Completed"});
          window.sessionStorage.removeItem(projectId);
          setIsGenerating(false);
        }
      }
    }

    checkReq();
  }, [projectId, isGenerating, delay, setViewMode, updateProject]);

  const handleGenerateModel = async () => {
    startStage2(projectId, propmt);
    updateProject(projectId, {status: "Generating"});
    window.sessionStorage.setItem(projectId, "true");
    setIsGenerating(true);
  }

  return (
    <>
      <div className="flex gap-x-2">
        <Input placeholder="Propmt" value={propmt} onChange={e => setPrompt(e.target.value)} />
        {viewMode === 'voxel' ?
          <Button colorScheme='orange' onClick={voxels.length > 0 ? onOpen : handleGenerate} isDisabled={propmt === ''}>Generate<br />Voxel</Button>
          :
          <Button colorScheme='blue' onClick={handleGenerateModel} isDisabled={propmt === '' || voxels.length === 0 || isGenerating}>
            {isGenerating ?
              <div>
                <Spinner />
              </div>
              :
              <div>Generate<br />Model</div>
            }
          </Button>}
      </div>

      <AlertDialog motionPreset='slideInBottom' isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Project
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? This will override voxel in the editor.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={() => {onClose(); handleGenerate();}} ml={3}>
                Override
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

export default PromptEditor;
