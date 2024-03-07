'use client'
import React, { useState, useEffect } from 'react';
import { auth } from '@/Firebase/config';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import {
  Flex,
  Heading,
  Input,
  Button,
  InputGroup,
  Stack,
  InputLeftElement,
  chakra,
  Box,
  Link,
  Avatar,
  FormControl,
  Divider,
  AbsoluteCenter,
  InputRightElement,
  Text,
  Image
} from "@chakra-ui/react";
import { FaUserAlt, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from 'next/navigation';
import { useToast } from '@chakra-ui/react'
import { useAuthContext } from '@/contexts/authContext';

const CFaUserAlt = chakra(FaUserAlt);
const CFaLock = chakra(FaLock);

const Login = () => {
  const router = useRouter();
  const { setUser } = useAuthContext();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handleShowClick = () => setShowPassword(!showPassword);
  const toast = useToast()
  const provider = new GoogleAuthProvider();

  const loginWithGoogle = async () => {
    try {
      const userCredential = await signInWithPopup(auth, provider);
      setUser(userCredential.user);
      toast({
        title: 'Success',
        description: "You've logged in successfully.",
        status: 'success',
        position: 'top',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  // const signup = () => {
  //   createUserWithEmailAndPassword(auth, email, password)
  //     .then((userCredential) => {
  //         // send verification mail.
  //         sendEmailVerification(userCredential.user);
  //         // let interval = setInterval(async () => {
  //         //   if (userCredential.user && userCredential.user.emailVerified) {
  //         //     setUser(userCredential.user)
  //         //     clearInterval(interval)
  //         //   }
  //         //  await  userCredential.user.reload();
  //         // }, 2000);
  //         auth.signOut();
  //         alert("Email sent");
  //     })
  //     .catch(alert);
  // };
  const signup = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // send verification mail
        sendEmailVerification(userCredential.user)
          .then(() => {
            auth.signOut();
            alert("Verification email sent. Please check your inbox.");
          })
          .catch((error) => {
            console.log(error);
            alert("Failed to send verification email.");
          });
      })
      .catch((error) => {
        console.log(error);
        alert("Failed to create user.");
      });
  };
  // @ts-ignore
  const login = async (e) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      console.error('Please enter a valid email.');
      toast({
        title: 'Error',
        description: "Please enter a valid email.",
        status: 'error',
        position: 'top',
        duration: 3000,
        isClosable: true,
      })
      return;
    }

    if (!password || password.length < 6) {
      console.error('Please enter a password of at least 6 characters.');
      toast({
        title: 'Error',
        description: "Please enter a password of at least 6 characters.",
        status: 'error',
        position: 'top',
        duration: 3000,
        isClosable: true,
      })
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Signed in
      setUser(userCredential.user);
      
      toast({
        title: 'Success',
        description: "You've logged in successfully.",
        status: 'success',
        position: 'top',
        duration: 3000,
        isClosable: true,
      })
      router.push('/');
    } catch (error) {
      console.error('Error signing in with email and password:', error);
      toast({
        title: 'Error',
        description: "Wrong email or password!",
        status: 'error',
        position: 'top',
        duration: 3000,
        isClosable: true,
      })
    }
  };

  const logout = () => {
    signOut(auth)
      .then(() => {
          // Sign-out successful.
          setUser(null);
      })
      .catch((error) => {
          console.error('Error signing out:', error);
      });
  };

  return (
    <Flex
      flexDirection="column"
      width="100wh"
      height="100vh"
      // backgroundColor="#000000"
      justifyContent="center"
      alignItems="center"
    >
      <form>
        <Stack
          spacing={4}
          p="3rem"
          // backgroundColor="#f5f5f5"
          backgroundColor="#ffbd59bd"
          boxShadow="md"
          borderRadius="20px"
        >
          {/* <Avatar bg="blue.500" alignSelf="center" /> */}
          <Image alignSelf="center" src='/short-height-logo.jpg' height="40px" width="80px" alt='miniLogo' />
          
          <Heading fontSize={26} textAlign="center" color="">Welcome to Enlighten 3D</Heading>
          <Text fontSize={14} textAlign="center" color="">Enter your email and password to get started.</Text>
          <FormControl _focus={{borderColor: "yellow.800"}}>
            <InputGroup borderColor="yellow.600" _hover={{borderColor: "yellow.400"}}>
              <InputLeftElement
                pointerEvents="none"
              >
                <CFaUserAlt color="yellow.800" />
              </InputLeftElement>
              <Input value={email} 
                onChange={e => setEmail(e.target.value)}
                type="email"
                placeholder="Email" 
                _hover={{borderColor: "yellow.800"}}/>
            </InputGroup>
          </FormControl>
          <FormControl _focus={{borderColor: "yellow.800"}}>
            <InputGroup borderColor="yellow.600"  colorScheme='custom'>
              <InputLeftElement
                pointerEvents="none"
                color="yellow.800"
              >
                <CFaLock color="yellow.800" />
              </InputLeftElement>
              <Input
                value={password}
                onChange={e => setPassword(e.target.value)}  
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                _hover={{borderColor: "yellow.800"}}
              />
              <InputRightElement width="4.5rem">
                <Button colorScheme='gray.600' h="1.75rem" size="sm" onClick={handleShowClick} bg="gray.700" color="white">
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
            {/* <FormHelperText textAlign="right">
              <Link>forgot password?</Link>
            </FormHelperText> */}
          </FormControl>
          <Button
            // borderRadius={0}
            // type="submit"
            variant="solid"
            colorScheme="green"
            bg="gray.700" color="white"
            width="full"
            onClick={login}
            // _hover={{ bg: "gray.600" }}
          >
            Continue
          </Button>
          {/* <Text fontSize={14} color="">
            Don't have an account? &nbsp;
            <Link color="blue" href="#">
              Sign up
            </Link>
          </Text> */}
          {/* <Box position='relative' py='2'>
            <Divider borderColor="yellow.800" />
            <AbsoluteCenter bg='#ffbd59' px='4' fontSize={14}>
              OR
            </AbsoluteCenter>
          </Box>
          <Button
            // display="flex"
            // alignItems="center"
            // justifyContent="flex-start"
            leftIcon={<FcGoogle />} 
            colorScheme='green'
            bg="gray.700" color="white" 
            variant='solid'
            onClick={loginWithGoogle}
          >
            Continue with Google
          </Button> */}
        </Stack>
      </form>
    </Flex>
  );
}

export default Login;