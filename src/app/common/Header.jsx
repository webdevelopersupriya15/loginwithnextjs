import Link from 'next/link';
import React, { useState,useEffect,useRef } from 'react'
import { FaRegUserCircle } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/userSlice';
import { useRouter } from 'next/navigation';

const Header = ({ className, iconColor }) => {

  const [popupMneu, setPopUPMenu] = useState(false)
  const user = useSelector((state)=>(state.user.value));
  const dispatch = useDispatch();
  const nav=useRouter()
  const menuRef = useRef(null);

  const handleLogout=(e)=>{
    e.preventDefault()
    localStorage.removeItem('user-data')
    dispatch(logout())
    nav.push('/')
  }
  useEffect(() => {
    const ifLogins = () => {
        const cookieData = localStorage.getItem('user-data');
        if (!cookieData) nav.push('/');
    };
    ifLogins();
}, [nav]);

 useEffect(() => {
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setPopUPMenu(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [menuRef]);

 let userName = "Guest";
 if (user) {
   if (user.data && user.data.name) {
     userName = user.data.name; // If user data available
   } 
 }
  return (
    <>
      <div className={`shadow-lg sticky top-0 z-[9] bg-[white] w-[full] ${className}`}>
          <div className='max-w-[1320px] mx-auto flex justify-between lg:pt-3 lg:pb-3 p-2 items-center'>
              <h1><Link href='/home'><img src='logo1.jpg' width={80} height={50} alt="userpic" /></Link></h1>
              <span className='cursor-pointer relative' ref={menuRef}>
                {
                  user && user.data.thumbnail 
                    ? 
                      <div className='w-[40px] h-[40px] rounded-[50%]' onClick={()=>setPopUPMenu(!popupMneu) }>
                        <img src={user.path + user.data.thumbnail} className='w-[40px] h-[40px] rounded-[50%]'  />
                      </div>
                    :
                      <FaRegUserCircle size={30} className={`${iconColor}`} onClick={()=>setPopUPMenu(!popupMneu) }/>
                }
              
                  <ul className='absolute popup-menu top-[55px] right-0 bg-[#ff6347] text-[#fff]  w-[130px] origin-center transition-[0.5s]' style={{scale: popupMneu ? '1' : '0'}}>
                    <li><h3 className='p-2 text-center font-bold'>{userName}</h3></li>
                    <li><span className='p-2 mb-2'><Link href='/profile'>Profile</Link></span></li>
                    <li><span className='p-2' onClick={handleLogout}>Logout</span></li>
                  </ul>
              </span>
          </div>
      
      </div>
    </>
  )
}

export default Header
