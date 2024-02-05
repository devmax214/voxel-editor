import React, {useState, useEffect} from 'react'
import TemplateButton from '@/Components/Elements/Buttons/TemplateButton'
import CardView from '@/Components/Elements/Card/CardView'
import { Text, Grid, GridItem, Progress, Flex } from '@chakra-ui/react'
import { Box } from '@ui/Box/Box'
import { Container } from '@ui/Container/Container'
import MainHeader from '@/Components/Elements/Header/MainHeader'
import { getProjectsByUid } from 'utils/api'

const Home = () => {
  const [userInfo, setUserInfo] = useState<null | string>('null')
  const [progressingProjects, setProgressingProjects] = useState<any>([])
  const [completedProjects, setCompletedProjects] = useState<any>([])
  useEffect(()=>{
    if (typeof window !== 'undefined'){
      let  tempInfo = localStorage.getItem('userAuthInfo')
      setUserInfo(tempInfo)
    }
  },[])

  useEffect(() => {
    const fetchData = async () => {
      if (typeof window !== 'undefined') {
        const userAuthInfo = localStorage.getItem('userAuthInfo');
        if (userAuthInfo) {
          try {
            const projects = await getProjectsByUid(JSON.parse(userAuthInfo).uid);
            console.log('=========projects=========', projects.projects)
            const progressingprojects = await projects.projects.filter((project:any) => project.data.status !== 'Completed');
            const completedprojects = await projects.projects.filter((project:any) => project.data.status === 'Completed');
            setProgressingProjects(progressingprojects);
            setCompletedProjects(completedprojects);
          } catch (error) {
            // Handle error, e.g., display an error message or log it
            console.error('Error fetching projects:', error);
          }
        }
      }
    };
  
    fetchData();
  }, []);

  return (
    <>
      {/* <Login /> */}
      {userInfo && <MainHeader />}
      <Container w={'full'} maxW='8xl' my={4}>
        <Grid templateColumns='repeat(2, 1fr)' gap={4} w={'100%'} height="500px">
          <GridItem colSpan={1} border={1} borderStyle={'solid'} borderColor={'dark'} borderRadius={8} p={2}>
            <Text fontSize='md'>3D Project in Progress</Text>
            <Flex flexDirection="column">
              {progressingProjects && progressingProjects.map((project: any, index: number)=>(
                <CardView key={`progressing ${index}`} progress={project.data.progress} imageLink={project.data.imageLink} />
              ))}
            </Flex>

          </GridItem>
          <GridItem colSpan={1} border={1} borderStyle={'solid'} borderColor={'dark'} borderRadius={8} p={2}>
            <Text fontSize='md'>3D Project Completed</Text>
            <Flex>
              {completedProjects && completedProjects.map((project: any, index: number)=>(
                <CardView key={`progressing ${index}`} imageLink={project.data.imageLink}/>
              ))}
            </Flex>

          </GridItem>
        </Grid>
      </Container>

      {/* <Container w={'full'} maxW='6xl' my={4}>
          <Grid templateColumns='repeat(12, 1fr)' gap={4} w={'100%'} border={1} borderStyle={'solid'} borderColor={'dark'} borderRadius={8}>
              <GridItem colSpan={4} p={2}>
                  <Text fontSize='md'>File in progress</Text>
                  <Flex mt={3}>
                      <TemplateButton text='Create New' h={16} w={160} borderColor={'gray.400'} color={'gray.400'} />
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

      <Container w={'full'} maxW='6xl' my={4}>
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