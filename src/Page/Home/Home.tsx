'use client'

import React, { useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import CardView from '@/Components/Elements/Card/CardView';
import { Text, Grid, GridItem, Box, Flex, Heading, Container } from '@chakra-ui/react';
import TemplateButton from '@/Components/Elements/Buttons/TemplateButton';
import { useProjectContext } from '@/contexts/projectContext';
import { useAuthContext } from '@/contexts/authContext';
import { createNewProject } from '@/Firebase/dbactions';
import { useBasicStore, useCompletedProjects, useThreeStore } from '@/store';
import { ProjectStatus } from 'utils/types';

const Home = () => {
  const { user } = useAuthContext();
  const { projects, addProject } = useProjectContext();
  const { populars } = useCompletedProjects();
  const { setLoading } = useBasicStore();
  const { setVoxels, setMesh } = useThreeStore();
  const router = useRouter();

  useEffect(() => {
    setMesh(null);
    setVoxels([]);
  }, [setMesh, setVoxels]);

  const stage1Projects = projects.filter(project => project.status === ProjectStatus.Blank || project.status === ProjectStatus.VoxelEditing || project.status === ProjectStatus.GeometryGenerating || project.status === ProjectStatus.GeometryFailed);
  const stage2Projects = projects.filter(project => project.status === ProjectStatus.GeometryEditing || project.status === ProjectStatus.MaterialGenerating || project.status === ProjectStatus.MaterialFailed);
  const stage3Projects = projects.filter(project => project.status === ProjectStatus.MaterialCompleted);

  const handleCreateNew = async () => {
    try {
      if (user) {
        setLoading(true);
        const res: any = await createNewProject(user.uid);
        addProject(res);
        setLoading(false);
        router.push(`/editor/${res.id}`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Container w={'full'} maxW='8xl' my={4}>
        <Heading mb={8} as={'h2'} className='text-3xl' noOfLines={1}>Enlighten Asset (Alpha)</Heading>
        <Grid mb={4} templateColumns='repeat(12, 1fr)' gap={4} w={'100%'} backgroundColor={'#f1f1f1'} borderRadius={8}>
          <GridItem colSpan={4} p={2}>
            <Text fontSize='md'>Create Project</Text>
            <Flex mt={3} px={2}>
              <TemplateButton text='Create New' h={16} w={160} borderColor={'gray.400'} color={'gray.400'} onClick={handleCreateNew} />
            </Flex>
          </GridItem>
        </Grid>
        <Grid templateColumns='repeat(3, 1fr)' gap={4} w={'100%'}>
          <GridItem colSpan={1} backgroundColor={'#f1f1f1'} borderRadius={8} p={2}>
            <Text fontSize='md'>Stage 1</Text>
            <Flex flexDirection="column" className="h-96 overflow-y-auto">
              {stage1Projects.map((project: any, index: number)=>(
                <CardView key={`stage1_${index}`} project={project} />
              ))}
            </Flex>
          </GridItem>
          <GridItem colSpan={1} backgroundColor={'#f1f1f1'} borderRadius={8} p={2}>
            <Text fontSize='md'>Stage 2</Text>
            <Flex flexDirection="column" className="h-96 overflow-y-auto">
              {stage2Projects.map((project: any, index: number)=>(
                <CardView key={`stage2_${index}`} project={project} />
              ))}
            </Flex>
          </GridItem>
          <GridItem colSpan={1} backgroundColor={'#f1f1f1'} borderRadius={8} p={2}>
            <Text fontSize='md'>Stage 3</Text>
            <Flex flexDirection="column" className="h-96 overflow-y-auto">
              {stage3Projects.map((project: any, index: number)=>(
                <CardView key={`stage2_${index}`} project={project} />
              ))}
            </Flex>
          </GridItem>
        </Grid>
      </Container>

      <Container w={'full'} maxW='8xl' my={4}>
        <Box p={2} backgroundColor={'#f1f1f1'} borderRadius={8}>
          <Text fontSize='md'>Popular Assets</Text>
          <Grid templateColumns='repeat(8, 1fr)' p={2} gap={2} w={'100%'}>
            {populars.map((popular, index) => (
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