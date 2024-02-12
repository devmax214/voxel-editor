'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import CardView from '@/Components/Elements/Card/CardView';
import { Text, Grid, GridItem, Progress, Flex } from '@chakra-ui/react';
import { Container } from '@ui/Container/Container';
import TemplateButton from '@/Components/Elements/Buttons/TemplateButton';
import { Box } from '@ui/Box/Box';
import { useProjectContext } from '@/contexts/projectContext';
import { useAuthContext } from '@/contexts/authContext';
import { createProject } from 'utils/api';
import { useBasicStore } from '@/store';

const Home = () => {
  const { user } = useAuthContext();
  const { projects, addProject } = useProjectContext();
  const { setLoading } = useBasicStore();
  const router = useRouter();

  const processingProjects = projects.filter(project => project.status !== 'Completed');
  const completedProjects = projects.filter(project => project.status === 'Completed');

  const handleCreateNew = async () => {
    if (user) {
      setLoading(true);
      const res = await createProject(user.uid);
      addProject({
        id: res.projectId,
        name: '',
        progress: 0,
        status: 'Blank',
        uid: user.uid,
        voxelData: [],
        meshLink: '',
        imageLink: ''
      });
      setLoading(false);
      router.push(`/editor/${res.projectId}`);
    }
  }

  return (
    <>
      <Container w={'full'} maxW='8xl' my={4}>
        <Grid templateColumns='repeat(2, 1fr)' gap={4} w={'100%'}>
          <GridItem colSpan={1} border={1} borderStyle={'solid'} borderColor={'dark'} borderRadius={8} p={2}>
            <Text fontSize='md'>3D Project in Progress</Text>
            <Flex flexDirection="column">
              {processingProjects.map((project: any, index: number)=>(
                <CardView key={`progressing ${index}`} project={project} />
              ))}
            </Flex>

          </GridItem>
          <GridItem colSpan={1} border={1} borderStyle={'solid'} borderColor={'dark'} borderRadius={8} p={2}>
            <Text fontSize='md'>3D Project Completed</Text>
            <Flex flexDirection="column">
              {completedProjects.map((project: any, index: number)=>(
                <CardView key={`completed_${index}`} project={project} />
              ))}
            </Flex>

          </GridItem>
        </Grid>
      </Container>

      <Container w={'full'} maxW='8xl' my={4}>
        <Grid templateColumns='repeat(12, 1fr)' gap={4} w={'100%'} border={1} borderStyle={'solid'} borderColor={'dark'} borderRadius={8}>
          <GridItem colSpan={4} p={2}>
            <Text fontSize='md'>Create New</Text>
            <Flex mt={3}>
              <TemplateButton text='Create New' h={16} w={160} borderColor={'gray.400'} color={'gray.400'} onClick={handleCreateNew} />
            </Flex>
          </GridItem>
          <GridItem colSpan={8} p={2} ml={-12}>
            <Text fontSize='md'>Create from my template</Text>
            <Flex mt={3} gap={2}>
              <TemplateButton text='Template 1' h={16} w={160} borderColor={'gray.400'} color={'gray.400'} />
              <TemplateButton text='Template 2' h={16} w={160} borderColor={'gray.400'} color={'gray.400'} />
              <TemplateButton text='Template 3' h={16} w={160} borderColor={'gray.400'} color={'gray.400'} />
              <TemplateButton text='Template 4' h={16} w={160} borderColor={'gray.400'} color={'gray.400'} />
            </Flex>
          </GridItem>
          <GridItem colSpan={12} p={2}>
            <Text fontSize='md'>Create from popular template</Text>
            <Flex mt={3} gap={2}>
              <TemplateButton text='Template 1' h={16} w={160} borderColor={'gray.400'} color={'gray.400'} />
              <TemplateButton text='Template 2' h={16} w={160} borderColor={'gray.400'} color={'gray.400'} />
              <TemplateButton text='Template 3' h={16} w={160} borderColor={'gray.400'} color={'gray.400'} />
              <TemplateButton text='Template 4' h={16} w={160} borderColor={'gray.400'} color={'gray.400'} />
              <TemplateButton text='Template 5' h={16} w={160} borderColor={'gray.400'} color={'gray.400'} />
              <TemplateButton text='Template 6' h={16} w={160} borderColor={'gray.400'} color={'gray.400'} />
            </Flex>
          </GridItem>
        </Grid>
      </Container>

      {/* <Container w={'full'} maxW='6xl' my={4}>
        <Grid templateColumns='repeat(12, 1fr)' gap={4} w={'100%'} border={1} borderStyle={'solid'} borderColor={'dark'} borderRadius={8}>
          <GridItem colSpan={6} p={2}>
            <Text fontSize='lg'>POST / NEWS</Text>
            <Flex flexDir={'column'}>
              <Box mt={3} w={'full'} border={1} borderStyle={'solid'} borderColor={'gray.500'} borderRadius={8} h={20} />
              <Box mt={3} w={'full'} border={1} borderStyle={'solid'} borderColor={'gray.500'} borderRadius={8} h={20} />
              <Box mt={3} w={'full'} border={1} borderStyle={'solid'} borderColor={'gray.500'} borderRadius={8} h={20} />
            </Flex>
          </GridItem>
          <GridItem colSpan={6} p={2}>
            <Text fontSize='lg'>DOCUMENTATION</Text>
            <Flex flexDir={'column'}>
              <Box mt={3} w={'full'} border={1} borderStyle={'solid'} borderColor={'gray.500'} borderRadius={8} h={20} />
              <Box mt={3} w={'full'} border={1} borderStyle={'solid'} borderColor={'gray.500'} borderRadius={8} h={20} />
              <Box mt={3} w={'full'} border={1} borderStyle={'solid'} borderColor={'gray.500'} borderRadius={8} h={20} />
            </Flex>
          </GridItem>
        </Grid>
      </Container> */}
    </>
  )
}

export default Home