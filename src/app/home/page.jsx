"use client"

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'
import Header from '../common/Header';

const Page = () => {

  const nav=useRouter()


  useEffect(() => {
    const ifLogins = () => {
      const cookieData = localStorage.getItem('user-data');
      if (!cookieData) nav.push('/');
    };
    ifLogins();
  }, [nav]); // Include 'nav' in the dependency array
  return (
    <div className='w-full background-img'>
           <Header className="bg-transparent" iconColor="icon-color" />
            
          
    </div>
  )
}

export default Page
