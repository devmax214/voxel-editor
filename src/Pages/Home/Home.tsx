'use client'

import React from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import CardView from '@/Components/Elements/Card/CardView';
import { Text, Grid, GridItem, Box, Flex, Heading, Container, Image } from '@chakra-ui/react';
import TemplateButton from '@/Components/Elements/Buttons/TemplateButton';
import { useProjectContext } from '@/contexts/projectContext';
import { useAuthContext } from '@/contexts/authContext';
// import { createProject } from 'utils/api';
import { createProject } from '@/Firebase/dbactions';
import { useBasicStore, useCompletedProjects } from '@/store';

const Home = () => {
  const { user } = useAuthContext();
  const { projects, addProject } = useProjectContext();
  const { populars } = useCompletedProjects();
  const { setLoading } = useBasicStore();
  const router = useRouter();

  const processingProjects = projects.filter(project => project.status !== 'Completed');
  const completedProjects = projects.filter(project => project.status === 'Completed');

  const handleCreateNew = async () => {
    if (user) {
      setLoading(true);
      const res: any = await createProject(user.uid);
      addProject({
        id: res.projectId,
        name: 'undefined',
        progress: 0,
        status: 'Blank',
        uid: user.uid,
        voxelReqId: '',
        voxelData: [],
        meshReqId: '',
        meshLink: '',
        objUrl: '',
        mtlUrl: '',
        albedoUrl: '',
        metallicUrl: '',
        roughnessUrl: '',
        imageLink: '',
        lastModified: new Date().toISOString(),
        prompt: "",
      });
      setLoading(false);
      router.push(`/editor/${res.projectId}`);
    }
  }

  return (
    <>
      <Container w={'full'} maxW='8xl' my={4}>
        <Heading mb={4} as={'h2'} size={'2xl'} noOfLines={1}>Enlighten Asset (Alpha)</Heading>
        <Grid mb={4} templateColumns='repeat(12, 1fr)' gap={4} w={'100%'} border={1} borderStyle={'solid'} borderColor={'dark'} borderRadius={8}>
          <GridItem colSpan={4} p={2}>
            <Text fontSize='md'>Create New</Text>
            <Flex mt={3}>
              <TemplateButton text='Create New' h={16} w={160} borderColor={'gray.400'} color={'gray.400'} onClick={handleCreateNew} />
            </Flex>
          </GridItem>
        </Grid>
        <Grid templateColumns='repeat(2, 1fr)' gap={4} w={'100%'}>
          <GridItem colSpan={1} border={1} borderStyle={'solid'} borderColor={'dark'} borderRadius={8} p={2}>
            <Text fontSize='md'>3D Project in Progress</Text>
            <Flex flexDirection="column" className="h-96 overflow-y-auto">
              {processingProjects.map((project: any, index: number)=>(
                <CardView key={`progressing ${index}`} project={project} />
              ))}
            </Flex>

          </GridItem>
          <GridItem colSpan={1} border={1} borderStyle={'solid'} borderColor={'dark'} borderRadius={8} p={2}>
            <Text fontSize='md'>3D Project Completed</Text>
            <Flex flexDirection="column" className="h-96 overflow-y-auto">
              {completedProjects.map((project: any, index: number)=>(
                <CardView key={`completed_${index}`} project={project} />
              ))}
            </Flex>

          </GridItem>
        </Grid>
      </Container>

      <Container w={'full'} maxW='8xl' my={4}>
        <Box border={1} borderStyle={'solid'} p={2} borderColor={'dark'} borderRadius={8}>
          <Text fontSize='md'>Popular Assets</Text>
          <Grid templateColumns='repeat(12, 1fr)' p={2} gap={4} w={'100%'}>
            {populars.map((popular, index) => (
              <GridItem key={`popular_${index}`}>
                <Link href={`/view/${popular.id}`}>
                  <Image src={popular.meshLink || popular.imageLink} alt='Image' height={100} width={100} fetchPriority='high' />
                </Link>
              </GridItem>
            ))}
          </Grid>
        </Box>
      </Container>
    </>
  )
}

export default Home