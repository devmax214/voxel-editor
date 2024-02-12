import { Box, Flex, Progress, Text, Image, Button } from '@chakra-ui/react';
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure
} from '@chakra-ui/react';
import React from 'react';
import Link from 'next/link';
import { Project } from 'utils/types';
import { removeProject, duplicateProject } from 'utils/api';
import { useProjectContext } from '@/contexts/projectContext';
import { useBasicStore } from '@/store';

const CardView = ({
  project
} : {
  project: Project
}) => {
  const { id, progress, status, uid, voxelData, meshLink, imageLink, name } = project;
  const { addProject, deleteProject } = useProjectContext();
  const { setLoading } = useBasicStore();

  const {isOpen, onOpen, onClose} = useDisclosure();
  const cancelRef = React.useRef(null);

  const handleDuplicate = async () => {
    setLoading(true);
    const res = await duplicateProject(id);
    addProject({ ...project, id: res.projectId });
    setLoading(false);
  }

  const handleDelete = async () => {
    onClose();
    setLoading(true);
    await removeProject(id);
    deleteProject(id);
    setLoading(false);
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <Flex position={'relative'} m={2} alignItems={'center'}>
          <Box w={70} h={70} bg={'gray.300'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
            <Link href={`/editor/${id}`}>
              <Image src={imageLink ? imageLink: "default_img.png"} alt='Image' />
            </Link>
          </Box>
          {(progress || progress == 0) && 
            <Progress colorScheme='blue' w={'110px'} bg={'gray.300'} height='20px' value={progress} hasStripe mx={2}>
              {progress}
            </Progress>
          }
          <p className="text-lg">{name || "undefined"}</p>
        </Flex>
        <div className="flex gap-x-2">
          <Button variant={'outline'} size={'sm'} colorScheme='blue' onClick={handleDuplicate}>
            Duplicate
          </Button>
          <Button variant={'solid'} size={'sm'} colorScheme='pink' onClick={onOpen}>
            Delete
          </Button>
        </div>

      </div>
      <AlertDialog motionPreset='slideInBottom' isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Project
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can&apos;t undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default CardView