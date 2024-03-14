'use client'

import { FC, PropsWithChildren, useEffect, useState } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { useAuthContext } from '@/contexts/authContext'
import { useRouter, redirect } from 'next/navigation'

import { useBasicStore, useCompletedProjects } from "@/store";
import { Loading } from "@ui/Spinner";

import theme from '@/theme'
import MainHeader from '../Elements/Header/MainHeader'
import { useProjectContext } from '@/contexts/projectContext';
// import { getProjectsByUid } from 'utils/api';
import { getProjectsByUid, getCompletedProjects } from '@/Firebase/dbactions';
import { Project } from 'utils/types'

export const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuthContext();
  const { setProjects } = useProjectContext();
  const { setPopulars } = useCompletedProjects();
  const { loading } = useBasicStore();
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async (userId: string) => {
      try {
        const res: Project[] = await getProjectsByUid(userId);
        const res1: Project[] = await getCompletedProjects();
        setProjects(res);
        setPopulars(res1);
      } catch (error) {
        console.log(`Project fetching error: ${error}`);
      }
    }

    if (user === null) router.push("/login");
    else {
      fetchProjects(user.uid);
      router.push("/");
    };
  },[user, router, setProjects, setPopulars]);

  return <ChakraProvider theme={theme}>
    <Loading isLoading={loading} />
    <MainHeader />
    {children}
  </ChakraProvider>
}
