import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
  useToast,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
} from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';
import { generatePointCloud } from 'utils/voxel';
import { useProjectContext } from "@/contexts/projectContext";
import { useAuthContext } from '@/contexts/authContext';
import { startStage2 } from 'utils/api';
import { getUserInfo, checkStatus } from '@/Firebase/dbactions';
import { useThreeStore, useBasicStore } from '@/store';
import { delay, voxelSize } from 'utils/utils';
import{ type Project, ProjectStatus } from 'utils/types';

const ModelCase = ({
  projectId,
  current
}: {
  projectId: string,
  current: Project
}) => {
  const toast = useToast();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { voxels, setVoxels, setMesh } = useThreeStore();
  const { setViewMode } = useBasicStore();
  const { user, setUserInfo } = useAuthContext();
  const { updateProject } = useProjectContext();

  const alert = useDisclosure();
  const outDated = useDisclosure();
  const cancelRef = useRef(null);

  const updateUserInfo = useCallback(() => {
    const fetchUserInfo = async () => {
      const userData: any = await getUserInfo(user?.uid as string);
      setUserInfo(userData);
    }

    fetchUserInfo();
  }, [user, setUserInfo]);

  useEffect(() => {
    if (current.status === ProjectStatus.GeometryEditing && current.modelGenerated) {
      outDated.onOpen();
    }
  }, [current]);

  useEffect(() => {
    if (!isGenerating) return;

    const checkReq = async () => {
      const res = await checkStatus(projectId) as Project;
      if (res) {
        if (res.status === ProjectStatus.MaterialGenerating) {
          await delay(10000);
          checkReq();
        }
        else if (res.status === ProjectStatus.MaterialCompleted) {
          setViewMode('model');
          window.sessionStorage.removeItem(projectId);
          updateUserInfo();
          setIsGenerating(false);
        }
        else if (res.status === ProjectStatus.MaterialFailed) {
          setViewMode('mesh');
          updateProject(projectId, {status: ProjectStatus.MaterialFailed});
          window.sessionStorage.removeItem(projectId);
          updateUserInfo();
          setIsGenerating(false);
        }
      }
    }

    checkReq();
  }, [projectId, isGenerating, setViewMode, updateProject, updateUserInfo]);

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
      updateProject(projectId, {status: ProjectStatus.MaterialGenerating});
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
    handleGenerateModel();
  }

  return (
    <div>
      <div className="flex gap-x-2">
        <Input placeholder="Propmt" isDisabled={true} value={current?.prompt} />
        <Popover
          placement='right'
          isOpen={outDated.isOpen}
        >
          <PopoverTrigger>
            <Button
              className='w-44'
              colorScheme='blue'
              onClick={alert.onOpen}
              isDisabled={voxels.length === 0 || isGenerating}
              isLoading={isGenerating}
            >
              Generate Model
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverBody>
              <p className="text-sm">Mesh is outdated, click here to regenerate</p>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </div>

      <AlertDialog motionPreset='slideInBottom' isOpen={alert.isOpen} leastDestructiveRef={cancelRef} onClose={alert.onClose} >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Generate Model
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? This process can take approximately 60 minutes and 60 credits for mesh generation. You can leave page and come back later.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={alert.onClose}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={handleClose} ml={3}>
                Generate
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </div>
  );
}

export default ModelCase;
