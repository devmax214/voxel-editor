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
import { getProjectsByUid } from 'utils/api';

export const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuthContext();
  const { setProjects } = useProjectContext();
  const { loading } = useBasicStore();
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async (userId: string) => {
      try {
        const res = await getProjectsByUid(userId);
        const projects = res.projects.map((project: any) => {
          const voxelData = project.data.voxelData === "" ? [] : project.data.voxelData;
          return {
            ...project.data,
            id: project.id,
            voxelData: voxelData
          }
        });
        setProjects(projects);
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
