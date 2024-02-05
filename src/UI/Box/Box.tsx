'use client'

import { FC, PropsWithChildren } from 'react'
import { Box as BoxUi, BoxProps } from '@chakra-ui/react'

export const Box: FC<PropsWithChildren<BoxProps>> = ({ children, ...props }) => (
  <BoxUi {...props}>{children}</BoxUi>
)
