'use-client'
import { ReactNode, useEffect, useState } from 'react'
import { Avatar, Box, Button, Flex, Link, Text } from '@chakra-ui/react'
import { useAuthContext } from '@/contexts/authContext'

const ProfileCard = () => {
  const { user, userInfo } = useAuthContext();

  const MenuItem = ({ children, isLast, to = "/", ...rest }: { children: ReactNode, isLast?: boolean, to: string }) => {
    return (
      <Link href={to}>
        <Text display="block" {...rest}>
          {children}
        </Text>
      </Link>
    );
  };

  return (
    <Flex border={1} p={2} borderStyle={'solid'} borderColor={'dark'} borderRadius={8} gap={4} alignItems={'center'} >
      <Flex>
        <Avatar src='https://bit.ly/broken-link' size='sm' />
      </Flex>

      <Flex flexDir={'column'}>
        <Text fontSize='md'>{user?.email}</Text>
        <Text fontSize='md'>Credit: {userInfo?.billing.compute_unit}</Text>
      </Flex>
    </Flex>
  )
}

export default ProfileCard