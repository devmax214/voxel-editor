'use client'

import { FC, PropsWithChildren } from 'react'
import { Container as ContainerUi, ContainerProps } from '@chakra-ui/react'

export const Container: FC<PropsWithChildren<ContainerProps>> = ({ children, ...props }) => (
  <ContainerUi {...props}>{children}</ContainerUi>
)
