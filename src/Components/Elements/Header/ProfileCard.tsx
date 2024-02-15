'use-client'
import { ReactNode, useEffect, useState } from 'react';
import { auth } from '@/Firebase/config';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Link,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from '@chakra-ui/react';
import { useAuthContext } from '@/contexts/authContext';
import { signOut } from 'firebase/auth';

const ProfileCard = () => {
  const { user, userInfo, setUser } = useAuthContext();

  const MenuItem = ({ children, isLast, to = "/", ...rest }: { children: ReactNode, isLast?: boolean, to: string }) => {
    return (
      <Link href={to}>
        <Text display="block" {...rest}>
          {children}
        </Text>
      </Link>
    );
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
          // Sign-out successful.
          setUser(null);
      })
      .catch((error) => {
          console.error('Error signing out:', error);
      });
  }

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Flex className="cursor-pointer" border={1} p={2} borderStyle={'solid'} borderColor={'dark'} borderRadius={8} gap={4} alignItems={'center'} >
          <Flex>
            <Avatar src='https://bit.ly/broken-link' size='sm' />
          </Flex>

          <Flex flexDir={'column'}>
            <Text fontSize='md'>{user?.email}</Text>
            <Text fontSize='md'>Credit: {userInfo?.billing.compute_unit}</Text>
          </Flex>
        </Flex>
      </PopoverTrigger>
      <PopoverContent width={200}>
        <PopoverBody>
          <Text className="cursor-pointer" onClick={handleLogout}>Log out</Text>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default ProfileCard