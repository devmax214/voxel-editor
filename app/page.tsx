'use client'

import React from 'react';
import { useAuthContext } from '@/contexts/authContext';
import { redirect } from 'next/navigation';
import Home from '@/Pages/Home/Home'

export default function Page() {
  const { user } = useAuthContext();

  if (!user) {
    redirect('/login');
  }

  return (
    <Home />
  )
}
