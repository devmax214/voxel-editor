'use client'
import React from 'react';
import { useAuthContext } from '@/contexts/authContext';
import { useRouter } from 'next/navigation';
import Home from '@/Pages/Home/Home'

export default function Page() {
  return (
    <Home />
  )
}
