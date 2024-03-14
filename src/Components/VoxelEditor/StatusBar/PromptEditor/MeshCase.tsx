import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
} from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';
import { Project } from 'utils/types';

const MeshCase = ({
  projectId,
  current
}: {
  projectId: string,
  current: Project
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [propmt, setPrompt] = useState<string>('');

  useEffect(() => {
    setPrompt(current?.prompt);
  }, [current]);

  const alert = useDisclosure();
  const cancelRef = React.useRef(null);

  const handleClose = () => {
    alert.onClose();
  }

  return (
    <div>
      <div className="flex gap-x-2">
        <Input placeholder="Propmt" value={propmt} onChange={e => setPrompt(e.target.value)} />
        <Button
          className='w-44'
          colorScheme='blue'
          onClick={alert.onOpen}
          isDisabled={!propmt || !current.voxelGenerated}
          isLoading={isGenerating}
        >
          Generate Mesh
        </Button>
      </div>

      <AlertDialog motionPreset='slideInBottom' isOpen={alert.isOpen} leastDestructiveRef={cancelRef} onClose={alert.onClose} >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Generate Mesh
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

export default MeshCase;
