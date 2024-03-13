import Image from "next/image";
import { Box, Flex, Progress, Text, Button, Spinner } from '@chakra-ui/react';
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
// import { removeProject, duplicateProject } from 'utils/api';
import { removeProject, duplicateProject } from '@/Firebase/dbactions';
import { useProjectContext } from '@/contexts/projectContext';
import { useBasicStore } from '@/store';

const CardView = ({
  project
} : {
  project: Project
}) => {
  const { id, progress, status, uid, voxelData, name, lastModified } = project;
  const { addProject, deleteProject } = useProjectContext();
  const { setLoading } = useBasicStore();

  const {isOpen, onOpen, onClose} = useDisclosure();
  const cancelRef = React.useRef(null);

  const handleDuplicate = async () => {
    setLoading(true);
    const res: any = await duplicateProject(id);
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

  const baseURL = `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/getAsset?projectId=${id}&fileName=`;

  return (
    <>
      <div className="flex justify-between items-center gap-x-2">
        <Flex position={'relative'} m={2} alignItems={'center'}>
          <Link href={`/editor/${id}`}>
            <Box width={160} height={160} borderRadius={8} overflow={'hidden'}>
              <Image src={status === 'Completed' ? `${baseURL}mesh.png` : status === 'Blank' ? "/default_img.png" : `${baseURL}icon.png`} alt='Image' height={160} width={160} fetchPriority='high' />
            </Box>
          </Link>
          <Box width={110}>
            {(status === 'Blank' || status === 'Editing') && <p className="w-[110px] px-2 text-center">Not Started</p>}
            {status === 'Generating' && <div className="w-[110px] px-2 text-center">
              <Spinner />
            </div>}
            {status === 'Completed' && <p className="w-[110px] px-2 text-center">Complete</p>}
            {status === 'Failed' && <p className="w-[110px] px-2 text-center">Failed</p>}
          </Box>
          <div>
            <Text noOfLines={2} className="text-lg">{name}</Text>
            <p className="text-xs">{new Date(lastModified).toLocaleString()}</p>
          </div>
        </Flex>
        <div className="flex gap-x-2">
          <Button variant={'outline'} size={'sm'} colorScheme='blue' isDisabled={status === 'Generating'} onClick={handleDuplicate}>
            Duplicate
          </Button>
          <Button variant={'solid'} size={'sm'} colorScheme='pink' isDisabled={status === 'Generating'} onClick={onOpen}>
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