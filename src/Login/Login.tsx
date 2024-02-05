'use client'
import React, { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
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
  FormHelperText,
  InputRightElement
} from "@chakra-ui/react";
import { FaUserAlt, FaLock } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { getUserInfo } from 'utils/api';

const CFaUserAlt = chakra(FaUserAlt);
const CFaLock = chakra(FaLock);

const Login = () => {

  useEffect(()=>{
    if (typeof window !== 'undefined'){
      const userInfo = localStorage.getItem('userAuthInfo')
      if(userInfo) router.push('/')
    }
  },[])
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handleShowClick = () => setShowPassword(!showPassword);

  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  const loginWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          // @ts-ignore
          const token = credential.accessToken;
          // The signed-in user info.
      }).catch((error) => {
          console.error('Error signing in with Google:', error);
      });
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
      return;
    }

    if (!password || password.length < 6) {
      console.error('Please enter a password of at least 6 characters.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Signed in
      localStorage.setItem('userAuthInfo', JSON.stringify(userCredential.user));
      
      const userInfo = await getUserInfo(userCredential.user.uid);
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      router.push('/');
    } catch (error) {
      console.error('Error signing in with email and password:', error);
    }
  };

  const logout = () => {
    signOut(auth)
      .then(() => {
          localStorage.removeItem('userAuthInfo')
          localStorage.removeItem('userInfo')
          // Sign-out successful.
          // setUser(null);
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
      backgroundColor="gray.200"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        flexDir="column"
        mb="2"
        justifyContent="center"
        alignItems="center"
      >
        <Avatar bg="teal.500" />
        <Heading color="teal.400">Welcome</Heading>
        <Box minW={{ base: "90%", md: "468px" }}>
          <form>
            <Stack
              spacing={4}
              p="1rem"
              backgroundColor="whiteAlpha.900"
              boxShadow="md"
            >
              <FormControl>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    children={<CFaUserAlt color="gray.300" />}
                  />
                  <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email address" />
                </InputGroup>
              </FormControl>
              <FormControl>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents="none"
                    color="gray.300"
                    children={<CFaLock color="gray.300" />}
                  />
                  <Input
                    value={password}
                    onChange={e => setPassword(e.target.value)}  
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleShowClick}>
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormHelperText textAlign="right">
                  <Link>forgot password?</Link>
                </FormHelperText>
              </FormControl>
              <Button
                borderRadius={0}
                // type="submit"
                variant="solid"
                colorScheme="teal"
                width="full"
                onClick={login}
              >
                Login
              </Button>
              {/* <Button
                borderRadius={0}
                // type="submit"
                variant="solid"
                colorScheme="teal"
                width="full"
                onClick={loginWithGoogle}
              >
                Login with Google
              </Button> */}
            </Stack>
          </form>
        </Box>
      </Stack>
      <Box>
        New to us?{" "}
        <Link color="teal.500" href="#">
          Sign Up
        </Link>
      </Box>
    </Flex>
  );
}

export default Login;