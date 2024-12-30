"use client"

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/userSlice';
import Header from '../common/Header';

const Page = () => {

  const nav=useRouter()


  useEffect(() => {
    const ifLogins = () => {
        const cookieData = localStorage.getItem('user-data');
        if (!cookieData) nav.push('/');
    };
    ifLogins();
}, []);
  return (
    <div className='w-full background-img'>
           <Header className="bg-transparent" iconColor="icon-color" />
            
          
    </div>
  )
}

export default Page
