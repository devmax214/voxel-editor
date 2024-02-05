'use client'

import { FC, PropsWithChildren, useEffect, useState } from 'react'
import { ChakraProvider } from '@chakra-ui/react'

import theme from '@/theme'
import MainHeader from '../Elements/Header/MainHeader'
import MainFooter from '../Elements/Footer/MainFooter'

export const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  return <ChakraProvider theme={theme}>
    {/* <MainHeader /> */}
    {children}
    {/* <MainFooter /> */}
  </ChakraProvider>
}
