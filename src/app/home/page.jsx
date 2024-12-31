"use client"

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

import Header from '../common/Header';

const Page = () => {

  
  const nav=useRouter()

 
  const ifLogins=()=>{
    const cookieData=localStorage.getItem('user-data')
    if(!cookieData) nav.push('/')
 }

 useEffect(()=>{
   ifLogins()
 },[])
  return (
    <div className='w-full background-img'>
           <Header className="bg-transparent" iconColor="icon-color" />
            
          
    </div>
  )
}

export default Page
