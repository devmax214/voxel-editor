import { useState, useRef, useEffect, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
} from '@chakra-ui/react';
import { Input } from '@chakra-ui/input';
import { Button } from '@chakra-ui/react';
import { requestMesh } from 'utils/apiCall';
import { saveVoxelReqId, changeProjectName, getUserInfo } from '@/Firebase/dbactions';
import { useProjectContext } from '@/contexts/projectContext';
import { useThreeStore, useBasicStore } from '@/store';
import { delay, voxelSize } from 'utils/utils';
import { getStatusById } from 'utils/apiCall';
import { useAuthContext } from '@/contexts/authContext';
import { Project } from 'utils/types';
import useMeshReqStatus from '@/hooks/useMeshReqStatus';

const VoxelCase = ({
  projectId,
  current
}: {
  projectId: string,
  current: Project
}) => {
  const { user, setUserInfo } = useAuthContext();
  const [reqId, setReqId] = useState<string| null>(null);
  const [propmt, setPrompt] = useState<string>('');
  const [meshData, setMeshData] = useState(null);
  const { updateProject } = useProjectContext();
  const { voxels, setVoxels, setMesh } = useThreeStore();
  const { setMeshReqStatus, setLoading, setViewMode } = useBasicStore();

  useEffect(() => {
    const savedId = window.localStorage.getItem(projectId);
    if (savedId) {
      setReqId(savedId);
    }
    setPrompt(current?.prompt);
  }, [current, projectId]);

  const alert = useDisclosure();
  const cancelRef = useRef(null);

  const [voxelData] = useMeshReqStatus(meshData, voxelSize);

  useEffect(() => {
    setVoxels(voxelData);
  }, [voxelData, setVoxels]);

  const handleSave = useCallback(() => {
    const evt = new KeyboardEvent('keyup', {
        bubbles: true,
        cancelable: true,
        code: "F8"
    });

    document.dispatchEvent(evt);
  }, []);

  const updateUserInfo = useCallback(() => {
    const fetchUserInfo = async () => {
      const userData: any = await getUserInfo(user?.uid as string);
      setUserInfo(userData);
    }

    fetchUserInfo();
  }, [user, setUserInfo]);

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
  }, [projectId, reqId, setLoading, setMeshReqStatus, handleSave, setViewMode, updateUserInfo]);

  const handleGenerate = async () => {
    try {
      const res = await requestMesh(propmt);
      if (res) {
        setReqId(res.id);
        window.localStorage.setItem(projectId, res.id);
        await saveVoxelReqId(projectId, res.id);
        if (current.name === 'undefined') {
          await changeProjectName(projectId, propmt);
          updateProject(projectId, { name: propmt, prompt: propmt });
        } else {
          updateProject(projectId, { prompt: propmt });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleClose = () => {
    alert.onClose();
    handleGenerate();
  }

  return (
    <div>
      <div className="flex gap-x-2">
        <Input placeholder="Propmt" value={propmt} onChange={e => setPrompt(e.target.value)} />
        <Button className='w-44' colorScheme='orange' onClick={voxels.length > 0 ? alert.onOpen : handleGenerate} isDisabled={propmt === ''}>Generate Voxel</Button>
      </div>
      
      <AlertDialog motionPreset='slideInBottom' isOpen={alert.isOpen} leastDestructiveRef={cancelRef} onClose={alert.onClose} >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Override voxel
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? This will override voxel in the editor.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={alert.onClose}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={handleClose} ml={3}>
                Override
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </div>
  );
}

export default VoxelCase;
