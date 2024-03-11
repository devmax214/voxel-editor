import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  useToast
} from '@chakra-ui/react';
import { useBasicStore, useThreeStore } from '@/store';
import useMeshReqStatus from '@/hooks/useMeshReqStatus';
import { getStatusById, requestMesh } from 'utils/apiCall';
import { Input } from '@chakra-ui/input';
import { Button, Spinner } from '@chakra-ui/react';
import { changeProjectName, startStage2 } from 'utils/api';
import { useProjectContext } from "@/contexts/projectContext";
import { checkStatus, getUserInfo, saveVoxelReqId } from '@/Firebase/dbactions';
import { generatePointCloud } from 'utils/voxel';
import { useAuthContext } from '@/contexts/authContext';
import { Project } from 'utils/types';

const voxelSize = Number(process.env.NEXT_PUBLIC_VOXEL_SIZE);

const PromptEditor = () => {
  const toast = useToast();
  const { user, setUserInfo } = useAuthContext();
  const params = useParams();
  const projectId = params?.projectId as string;
  const [reqId, setReqId] = useState<string| null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { voxels, setVoxels, setMesh } = useThreeStore();
  const [propmt, setPrompt] = useState<string>('');
  const [meshData, setMeshData] = useState(null);
  const { setMeshReqStatus, setLoading, setViewMode, viewMode } = useBasicStore();
  const { projects, updateProject } = useProjectContext();
  const current = projects.filter(project => project.id === projectId)[0];

  const alert = useDisclosure();
  const outDated = useDisclosure();
  const cancelRef = React.useRef(null);

  const [voxelData, imMesh] = useMeshReqStatus(meshData, voxelSize);

  useEffect(() => {
    const savedId = window.localStorage.getItem(projectId);
    if (savedId) {
      setReqId(savedId);
    }
    const savedGenerating = window.sessionStorage.getItem(projectId);
    if (current?.status === 'Generating' && savedGenerating) {
      setIsGenerating(true);
    } else {
      window.sessionStorage.removeItem(projectId);
    }
  }, [current, projectId]);

  useEffect(() => {
    if (current){
      if (current?.status === 'Completed') setViewMode('mesh');
      else setViewMode('voxel');
      setPrompt(current.prompt);
      if (current?.status === 'Editing' && current.meshGenerated) {
        outDated.onOpen();
      }
    }
  }, [current, setViewMode]);

  useEffect(() => {
    setVoxels(voxelData);
    // setMesh(imMesh);
  }, [voxelData, setVoxels, imMesh, setMesh]);

  const delay = useCallback((ms: number) => new Promise(resolve => setTimeout(resolve, ms)), []);

  const updateUserInfo = useCallback(() => {
    const fetchUserInfo = async () => {
      const userData: any = await getUserInfo(user?.uid as string);
      setUserInfo(userData);
    }

    fetchUserInfo();
  }, [user, setUserInfo]);

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
          checkReq();
          await delay(3000);
        }
        else if (res.status === 'COMPLETED') {
          setLoading(false);
          window.localStorage.removeItem(projectId);
          setTimeout(updateUserInfo, 1500);
          setReqId(null);
          setViewMode('voxel');
          setMeshData(res.output);
          setTimeout(handleSave, 2000);
        }
        else if (res.status === 'FAILED') {
          setLoading(false);
          window.localStorage.removeItem(projectId);
          setReqId(null);
          setViewMode('voxel');
        }
      }
    }
    
    checkReq();
  }, [projectId, reqId, setLoading, setMeshReqStatus, delay, handleSave, setViewMode, updateUserInfo]);

  const handleGenerate = async () => {
    try {
      const res = await requestMesh(propmt);
      if (res) {
        setReqId(res.id);
        window.localStorage.setItem(projectId, res.id);
        await saveVoxelReqId(projectId, res.id);
        if (current.name === 'undefined') {
          const res = await changeProjectName(projectId, propmt);
          updateProject(projectId, { name: res.name, prompt: propmt });
        } else {
          updateProject(projectId, { prompt: propmt });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!isGenerating) return;

    const checkReq = async () => {
      const res = await checkStatus(projectId) as Project;
      if (res) {
        if (res.status === 'Editing' || res.status === 'Generating') {
          await delay(10000);
          checkReq();
        }
        else if (res.status === 'Completed') {
          setViewMode('mesh');
          window.sessionStorage.removeItem(projectId);
          updateUserInfo();
          setIsGenerating(false);
        }
        else if (res.status === 'Failed') {
          setViewMode('voxel');
          updateProject(projectId, {status: "Failed"});
          window.sessionStorage.removeItem(projectId);
          updateUserInfo();
          setIsGenerating(false);
        }
      }
    }

    checkReq();
  }, [projectId, isGenerating, delay, setViewMode, updateProject, updateUserInfo]);

  const handleGenerateModel = async () => {
    const vertices = generatePointCloud(voxels, voxelSize);
    // const blob = new Blob([JSON.stringify({
    //   prompt: current?.prompt,
    //   vertices: vertices
    // })], { type: 'application/json' });
    // const url = URL.createObjectURL(blob);
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = 'voxelData.json';
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    try {
      setIsGenerating(true);
      updateProject(projectId, {status: "Generating"});
      await startStage2(projectId, current?.prompt, vertices);
      updateUserInfo();
      outDated.onClose();
      window.sessionStorage.setItem(projectId, "true");
    } catch (error: any) {
      setIsGenerating(false);
      console.log(error);
      toast({
        title: 'Error',
        description: error?.response?.data,
        status: 'warning',
        duration: 5000,
        isClosable: true,
        variant: 'left-accent',
        position: 'top',
        containerStyle: {
          top: '120px'
        }
      });
    }
  }

  const handleClose = () => {
    alert.onClose();
    if (viewMode === 'voxel') handleGenerate();
    else handleGenerateModel();
  }

  return (
    <>
      <div className="flex gap-x-2">
        {viewMode === 'voxel' ?
          <Input placeholder="Propmt" value={propmt} onChange={e => setPrompt(e.target.value)} />
          :
          <Input placeholder="Propmt" isDisabled={true} value={current?.prompt} onChange={e => setPrompt(e.target.value)} />
        }
        {viewMode === 'voxel' ?
          <Button className='w-44' colorScheme='orange' onClick={voxels.length > 0 ? alert.onOpen : handleGenerate} isDisabled={propmt === ''}>Generate Voxel</Button>
          :
          <Popover
            placement='right'
            isOpen={outDated.isOpen}
          >
            <PopoverTrigger>
              <Button className='w-44' colorScheme='blue' onClick={alert.onOpen} isDisabled={voxels.length === 0 || isGenerating}>
                {isGenerating ?
                  <div>
                    <Spinner />
                  </div>
                  :
                  <div>Generate Mesh</div>}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverBody>
                <p className="text-sm">Mesh is outdated, click here to regenerate</p>
              </PopoverBody>
            </PopoverContent>
          </Popover>}
      </div>

      <AlertDialog motionPreset='slideInBottom' isOpen={alert.isOpen} leastDestructiveRef={cancelRef} onClose={alert.onClose} >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              {viewMode === 'voxel' ? 'Override voxel' : 'Generate Model'}
            </AlertDialogHeader>
            <AlertDialogBody>
              {viewMode === 'voxel' ? 'Are you sure? This will override voxel in the editor.' : 'Are you sure? This process can take approximately 60 minutes and 60 credits for mesh generation. You can leave page and come back later.'}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={alert.onClose}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={handleClose} ml={3}>
                {viewMode === 'voxel' ? 'Override' : 'Generate'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

export default PromptEditor;
