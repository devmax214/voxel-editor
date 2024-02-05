'use-client'
import { ReactNode, useEffect, useState } from 'react'
import { Avatar, Box, Button, Flex, Link, Text } from '@chakra-ui/react'

const ProfileCard = () => {
  
  const [email, setEmail] = useState('')
  const [credit, setCredit] = useState(0)

  useEffect(()=>{
    if (typeof window !== 'undefined'){
      const  userAuthInfo = localStorage.getItem('userAuthInfo')
      const  userInfo = localStorage.getItem('userInfo')
      userAuthInfo && setEmail(JSON.parse(userAuthInfo).email)
      userInfo && setCredit(JSON.parse(userInfo).billing.compute_unit)
    }
  })
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
        <Text fontSize='md'>{email}</Text>
        <Text fontSize='md'>Credit: {credit}</Text>
      </Flex>
    </Flex>
  )
}

export default ProfileCard