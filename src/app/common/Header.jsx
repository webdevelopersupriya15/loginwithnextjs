"use client";

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { FaRegUserCircle } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/userSlice';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Header = ({ className, iconColor }) => {

  const [popupMenu, setPopupMenu] = useState(false);
  const [userName, setUserName] = useState("Guest");

  const user = useSelector((state) => state.user.value);

  const dispatch = useDispatch();
  const router = useRouter();
  const menuRef = useRef(null);

  const handleLogout = (e) => {
    e.preventDefault();
      
    dispatch(logout());
    router.push('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setPopupMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // useEffect(() => {
  //     if(user){
  //       try {
          
  //         const parsedUserData = user ? user : null;
  //         if (parsedUserData && parsedUserData.name) {
  //           setUserName(parsedUserData.name);
  //         }
  //       } catch (error) {
  //         console.error('Error accessing or parsing user data from localStorage:', error);
  //       }
  //   }
  // }, []);

  useEffect(() => {
    if (user && user.data && user.data.name) {
      setUserName(user.data.name); // Set user name from Redux state
    }
  }, [user]);

  return (
    <div className={`shadow-lg sticky top-0 z-[9] bg-white w-full ${className}`}>
      <div className='max-w-[1320px] mx-auto flex justify-between lg:pt-3 lg:pb-3 p-2 items-center'>
        <h1>
          <Link href='/home'>
            <Image src='/logo1.jpg' width={80} height={50} alt="Logo" />
          </Link>
        </h1>
        <span className='cursor-pointer relative' ref={menuRef}>
          {
            user && user.data && user.data.thumbnail
              ? 
                <div className='w-10 h-10 rounded-full overflow-hidden' onClick={() => setPopupMenu(!popupMenu)}>
                  <Image src={user.path + user.data.thumbnail} width={100} height={100} className='w-full h-full rounded-full' alt="User Thumbnail" />
                </div>
              :
                <FaRegUserCircle size={30} className={`${iconColor}`} onClick={() => setPopupMenu(!popupMenu)} />
          }
        
          <ul className='absolute popup-menu top-[55px] right-0 bg-red-500 text-white w-[130px] origin-center transition-transform duration-500' style={{ transform: popupMenu ? 'scale(1)' : 'scale(0)' }}>
            <li>
              <h3 className='p-2 text-center font-bold'>{userName}</h3>
            </li>
            <li>
              <span className='p-1 mb-1 block hover:bg-red-600 rounded'>
                <Link href='/profile'>Profile</Link>
              </span>
            </li>
            <li>
              <span className='p-1 block hover:bg-red-600 rounded cursor-pointer' onClick={handleLogout}>Logout</span>
            </li>
          </ul>
        </span>
      </div>
    </div>
  );
}

export default Header;
