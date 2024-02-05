'use client'
import React, {useEffect} from 'react';
import { initializeApp } from "firebase/app";
import Home from '@/Pages/Home/Home'
import { Container } from '@ui/Container/Container';
// import { redirect } from 'next/navigation'
import { useRouter } from 'next/navigation';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_APPID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENTID
};

// Initialize Firebase
initializeApp(firebaseConfig);

export default function Page() {
  const router = useRouter();

  useEffect(()=>{
    let userInfo = null
    if (typeof window !== 'undefined'){
      userInfo = localStorage.getItem('userAuthInfo')
    }
    if(!userInfo){
      // return redirect('/login')
      router.push('/login')
    }
  },[])

  return (
    <Home />
  )
}
