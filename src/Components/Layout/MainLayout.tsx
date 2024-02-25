'use client'

import { FC, PropsWithChildren, useEffect, useState } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { useAuthContext } from '@/contexts/authContext'
import { useRouter } from 'next/navigation'

import { useBasicStore } from "@/store";
import { Loading } from "@ui/Spinner";

import theme from '@/theme'
import MainHeader from '../Elements/Header/MainHeader'
import { useProjectContext } from '@/contexts/projectContext';
// import { getProjectsByUid } from 'utils/api';
import { getProjectsByUid } from '@/Firebase/dbactions';
import { Project } from 'utils/types'

export const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuthContext();
  const { setProjects } = useProjectContext();
  const { loading } = useBasicStore();
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async (userId: string) => {
      try {
        const res: Project[] = await getProjectsByUid(userId);
        // const res = await getProjectsByUid(userId);
        // const projects = res.projects.map((project: any) => {
        //   return {
        //     ...project.data,
        //     id: project.id
        //   }
        // });
        // setProjects(projects);
        setProjects(res);
      } catch (error) {
        console.log(`Project fetching error: ${error}`);
      }
    }

    if (user === null) router.push("/login");
    else {
      fetchProjects(user.uid);
      router.push("/");
    };
  },[user, router, setProjects]);

  return <ChakraProvider theme={theme}>
    <Loading isLoading={loading} />
    <MainHeader />
    {children}
  </ChakraProvider>
}
