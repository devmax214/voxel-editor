'use client'
import React, {useEffect} from 'react';
import Home from '@/Pages/Home/Home'
import { Container } from '@ui/Container/Container';
// import { redirect } from 'next/navigation'
import { useRouter } from 'next/navigation';

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
  },[router])

  return (
    <Home />
  )
}
