'use client'

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import CardView from '@/Components/Elements/Card/CardView';
import { Text, Grid, GridItem, Box, Flex, Heading, Container, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import TemplateButton from '@/Components/Elements/Buttons/TemplateButton';
import { useProjectContext } from '@/contexts/projectContext';
import { useAuthContext } from '@/contexts/authContext';
import { createProject } from '@/Firebase/dbactions';
import { useBasicStore, useCompletedProjects } from '@/store';
import { Project } from "utils/types";

const Home = () => {
  const { user } = useAuthContext();
  const { projects, addProject, loadProjects } = useProjectContext();
  const { populars } = useCompletedProjects();
  const { setLoading } = useBasicStore();
  const router = useRouter();

  const [loading, setLoadingState] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        await loadProjects();
        setLoadingState(false);
      } catch (err) {
        console.error("Error loading projects:", (err as Error).message);
        setError((err as Error).message);
        setLoadingState(false);
      }
    };

    fetchProjects();
  }, [loadProjects]);

  const processingProjects = Array.isArray(projects) ? projects.filter((project: Project) => project.status !== 'Completed') : [];
  const completedProjects = Array.isArray(projects) ? projects.filter((project: Project) => project.status === 'Completed') : [];

  const handleCreateNew = async () => {
    if (user) {
      setLoading(true);
      try {
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
          meshGenerated: false,
          lastModified: new Date().toISOString(),
          prompt: "",
        });
        router.push(`/editor/${res.projectId}`);
      } catch (err) {
        console.error("Error creating project:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Flex>
    );
  }

  return (
    <>
      <Container w={'full'} maxW='8xl' my={4}>
        <Heading mb={8} as={'h2'} className='text-3xl' noOfLines={1}>Enlighten SDS (Alpha)</Heading>
        <Grid mb={4} templateColumns='repeat(8, 1fr)' gap={4} w={'100%'} backgroundColor={'#f1f1f1'} borderRadius={15}>
          <GridItem colSpan={4} p={3}>
            <Text fontSize='md'>Create New</Text>
            <Flex mt={3} px={2}>
              <TemplateButton text='Create New' h={16} w={160} borderColor={'gray.400'} color={'gray.400'} onClick={handleCreateNew} />
            </Flex>
          </GridItem>
        </Grid>
        <Grid templateColumns='repeat(2, 1fr)' gap={4} w={'100%'}>
          <GridItem colSpan={1} backgroundColor={'#f1f1f1'} borderRadius={15} p={3}>
            <Text fontSize='md'>3D Asset in Progress</Text>
            <Flex flexDirection="column" className="h-96 overflow-y-auto">
              {processingProjects.map((project: Project, index: number) => (
                <CardView key={`progressing ${index}`} project={project} />
              ))}
            </Flex>

          </GridItem>
          <GridItem colSpan={1} backgroundColor={'#f1f1f1'} borderRadius={15} p={3}>
            <Text fontSize='md'>3D Asset Completed</Text>
            <Flex flexDirection="column" className="h-96 overflow-y-auto">
              {completedProjects.map((project: Project, index: number) => (
                <CardView key={`completed_${index}`} project={project} />
              ))}
            </Flex>

          </GridItem>
        </Grid>
      </Container>

      <Container w={'full'} maxW='8xl' my={4}>
        <Box p={3} backgroundColor={'#f1f1f1'} borderRadius={15}>
          <Text fontSize='md'>Latest Public Assets</Text>
          <Grid templateColumns='repeat(8, 1fr)' p={3} gap={3} w={'100%'}>
            {(populars && populars.length > 0 ? populars.slice(0, 24) : []).map((popular, index) => (
              <GridItem key={`popular_${index}`}>
                <Box borderRadius={8} overflow={'hidden'}>
                  <Link href={`/view/${popular.id}`}>
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/getAsset?projectId=${popular.id}&fileName=mesh.png`}
                      alt='Image'
                      height={160}
                      width={160}
                      fetchPriority='high'
                      priority={true}
                    />
                  </Link>
                </Box>
              </GridItem>
            ))}
          </Grid>
        </Box>
      </Container>
    </>
  )
}

export default Home