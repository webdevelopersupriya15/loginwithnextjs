"use client"

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useDispatch,useSelector } from 'react-redux';
import { logout } from '../redux/slices/userSlice';
import Header from '../common/Header';

const Page = () => {
  const router = useRouter();
  const user = useSelector((state)=>(state.user.value));
 

  useEffect(() => {
    // Redirect to home page if user is not authenticated
    if (!user || !user.auth) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className='w-full background-img'>
      <Header className="bg-transparent" iconColor="icon-color" />
      {/* Add your page content here */}
    </div>
  );
}

export default Page;
