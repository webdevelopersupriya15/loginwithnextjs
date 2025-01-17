"use client"
import React, { useEffect, useRef, useState } from 'react'
import Header from '../common/Header'
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from 'next/navigation';
import { login,logout } from '../redux/slices/userSlice';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import Image from 'next/image'

const Page = () => {
    const fileInputRef = useRef(null);
    const user = useSelector((state)=>(state.user.value));
    const dispatch = useDispatch();
    const [imgPre, setImgPre] = useState('');
    const [filepath, setFilepath] = useState('');
   
    const [errors, setErrors] = useState({});
    const [passError,setPassError]=useState('')
    const [isDisplay,setIsDisplay]=useState(true)

    
    
    const [otpState, setOtpState] = useState({
        timeLeft: null,
        isLoading: false,
        show: false,
        changeText: "Get OTP",
        otpReceived: false, // New state to track when OTP is received
    });
    

    const [profileData,setProfileData]=useState({
        name:"",
        email:"", 
        phone:"",
        address:"",
        thumbnail:"",
    })
    const [passData,setPassData]=useState({
        otpData:"",
        oldPassword:"",
        newPassword:""
    })
    // const reqId = user && user.data ? user.data._id : null; // Safely retrieve reqId
    const reqEmail = user && user.data ? user.data.email : ''; // Safely retrieve reqEmail
    const nav=useRouter()
    
    // useEffect(() => {
    //     let existingUser
        
    //     existingUser = localStorage.getItem('user-data');
        
    //     const loginStatus = existingUser ? JSON.parse(existingUser) : '';
    //     const keyArray=(loginStatus && loginStatus.data && typeof loginStatus.data === 'object')?(Object.keys(loginStatus.data)): [];

    // //console.log(keyArray[3])
    //     if (keyArray[3]!== 'password') {
    //        setIsDisplay(false); // Set it to false when we want to hide it
    //     }
    // }, []);

    useEffect(() => {
        let existingUser
        if (typeof window !== "undefined") {
            existingUser = localStorage.getItem("user-data");
        }
        const loginStatus = existingUser ? JSON.parse(existingUser) : null;
    
        // Sync localStorage data with Redux state
        if (loginStatus) {
          dispatch(login(loginStatus));
        }
    
        if (loginStatus && loginStatus.data) {
          const keyArray = Object.keys(loginStatus.data);
          if (!keyArray.includes("password")) {
            setIsDisplay(false);
          }
        }
      }, [dispatch]);

    const validateForm = () => {
        const newErrors = {};
        if(profileData.name){
            if (!profileData.name.trim()) newErrors.name = 'Please enter your name';
            }else{
                newErrors.name = 'Please enter your name';
        }

        const mobile=profileData.phone.trim()
        const mobileNoValid = parsePhoneNumberFromString(mobile,'IN');
        if (!mobileNoValid || !mobileNoValid.isValid()) newErrors.mobile='Invalid mobile number'
        
        setErrors(newErrors);
        console.log(newErrors)

        return Object.keys(newErrors).length === 0;

    }
    const validPassword =()=>{
        
        const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;

        if (!passwordPattern.test(passData.newPassword))
        {
            const newPassError='Minimum 8 Characters password, Atleast 1 Capital letter, 1 special character, 1 digit'
            setPassError(newPassError)
            return false
        }
        setPassError('')
        return true
        
    }
    // useEffect(()=>{
    //     if (!reqId) {
    //        // toast.error("You need to be logged in.");
    //         nav.push('/'); // or wherever your login page is
    //         return; // Prevent further execution
    //     }
    //     axios.get(`${process.env.NEXT_PUBLIC_URL}/user-credential/user/user-viewdata/${reqId}`)
    //     .then((response) => {
    //         console.log(response.data);
    //         const data = response.data.data || {};
            
    //         setFilepath(response.data.file_path )
    //         setProfileData({
    //             name: data.name || "",
    //             email: data.email || "",
    //             phone: data.phone || "",
    //             address: data.address || "",
    //             thumbnail:data.thumbnail || "",

    //          });
    //          setPassData({
    //             otpData: "",
    //             oldPassword:"",
    //             newPassword:""
    //          })
    //         })
    //         .catch((error) => {
    //             console.log(error);
    //          });
        
    // },[reqId,nav])


    useEffect(() => {
        if (!user || (user && !user.auth)) {
          nav.push("/");
        } else {
          const reqId = user.data?._id;
    
          if (reqId) {
            axios
              .get(
                `${process.env.NEXT_PUBLIC_URL}/user-credential/user/user-viewdata/${reqId}`
              )
              .then((response) => {
                const data = response.data.data || {};
                setFilepath(response.data.file_path);
                setProfileData({
                  name: data.name || "",
                  email: data.email || "",
                  phone: data.phone || "",
                  address: data.address || "",
                  thumbnail: data.thumbnail || "",
                });
              })
              .catch((error) => {
                console.error("Failed to fetch user data:", error);
              });
          }
        }
      }, [user, nav]);
   
    const handleImagePre=(e)=>{
        //console.log(e.target.name)
        const file = e.target.files[0];
        if(file){
            const reader = new FileReader(); // blob

            reader.readAsDataURL(file);
            console.log(reader);

            reader.onload = () =>{
                setImgPre(reader.result);

                console.log(reader.result);
            }
       }
    }
    const handleOtp = () => {
        const ifValid = validPassword();
        if(!ifValid) return setTimeout(()=>{setPassError('')},4000);

        setOtpState((prev) => ({
            ...prev,
            isLoading: true,
            show: true,
            changeText: "OTP Sending...",
        }))
        axios.post(`${process.env.NEXT_PUBLIC_URL}/user-credential/user/generate-otp`, { email: reqEmail })
            .then((response) => {
                console.log(response.data);
                setOtpState((prev) => ({
                    ...prev,
                    isLoading: false,
                    changeText: "OTP Sent",
                    otpReceived: true, // Set the flag to true when OTP is received
                    timeLeft: 60 // Start the timer for 1 minute
                }));
               
            })
            .catch((error) => {
                console.log(error);
                setOtpState(prev => ({
                    ...prev,
                    isLoading: false,
                    changeText: "Get OTP"
                }));
            });
    };

    
    useEffect(() => {
            let timer;
            if (otpState.timeLeft > 0 && otpState.otpReceived) { // Start the timer only if OTP is received
             timer = setTimeout(() => {
                    setOtpState((prev) => ({
                        ...prev,
                        timeLeft: prev.timeLeft - 1,
                    }));
                    }, 1000);
            } else if (otpState.timeLeft === 0 && otpState.otpReceived) {
                setOtpState((prev) => ({
                    ...prev,
                    timeLeft: null,
                    isLoading: false,
                    show: false,
                    changeText: "GET OTP",
                    otpReceived: false // Reset the OTP received state
                }));
         }
        return () => clearTimeout(timer);
     }, [otpState.timeLeft, otpState.otpReceived]); // Add 'otpReceived' to the dependency array
 
      const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
      };
      const handleProfileUpdate=(e)=>{
        e.preventDefault()
        const form = new FormData(e.target);
        const ifValid = validateForm();
        if(!ifValid) return setTimeout(()=>{setErrors({})},4000);

        const reqId = user.data?._id;

        axios.put(`${process.env.NEXT_PUBLIC_URL}/user-credential/user/update-profile/${reqId}`,form)
        .then((response) => {
           // console.log("server:",response.data);
            const newData = response.data.data;
            const updatedUser = {
                ...user,
                data: newData,
            };

            dispatch(login(updatedUser));
            if (typeof window !== "undefined") {
                 localStorage.setItem("user-data", JSON.stringify(updatedUser));
            }
            toast.success(`Profile Successfully Updated`);
        })
        .catch((error) => {
            console.log(error);
            const status = error.response.status;
            if (status === 422) {
                toast.error("Invalid type format, allowed only .jpeg or .jpg");
            }else if (status === 413) {
                    toast.error("File size should be less than 2 MB"); 
            }else{
                toast.error("Updatation failed. Please try again.");
            }

           
        });
      }
    const handlePasswordUpdate=(e)=>{
        e.preventDefault()
        const reqId = user.data?._id;
        const data={
            oldPassword:e.target.oldPassword.value,
            newPassword:e.target.newPassword.value,
            otpData:e.target.otpData.value,
            reqEmail
        }
        
        console.log(data)
        axios.put(`${process.env.NEXT_PUBLIC_URL}/user-credential/user/update-password/${reqId}`,data)
        .then((response) => {
            console.log(response.data);
            setOtpState({
                timeLeft: null,
                isLoading: false,
                show: false,
                changeText: "GET OTP",
            });
            
             // Use functional form to update `profileData`
             setPassData((prevState) => ({
                ...prevState,
                otpData: "",
            }));
            if (typeof window !== "undefined") {
                localStorage.removeItem('user-data')
            }
            dispatch(logout())

            nav.push('/')
         })
        .catch((error) => {

            console.log(error);
            // Check if the error response is present
            if (error.response) {
                // Capture the status code and message from the response
                const status = error.response.status;
                const message = error.response.data.message || "An unexpected error occurred"; // Default message if no message is present
        
                if (status === 401) {
                    if (message.includes("valid OTP")) {
                        toast.error("Please send valid OTP");
                    } else if (message.includes("valid Password")) {
                        toast.error(message); // Show the specific invalid password message from backend
                    } else {
                        toast.error(message); // Fallback for any unexpected 401 messages
                    }
                } else if (status === 400) {
                    toast.error("Please fill OTP");
                } else {
                    toast.error("Updatation failed. Please try again.");
                }
            } else {
                toast.error("Network error, please try again.");
            }

        });
    }
     
  return (
    <>
        <Header /> 
        <div className='bg-slate-200 lg:h-[100vh] flex flex-col justify-center items-center w-full'>
            <form method="post"  className='profile  bg-white border lg:w-[80%] w-[100%] p-[20px_10px] text-[14px]' onSubmit={handleProfileUpdate}>
                <div className='flex items-center'>
                        <div className='w-[75px] h-[75px] rounded-[50%] me-[10px]'>
                            <Image src={imgPre || (filepath && profileData.thumbnail ? filepath + profileData.thumbnail : "/user.png")}
                              
                              width={75}
                              height={75}
                              className='w-full h-full rounded-[50%]'
                             alt="" /> 
                         </div>
                        <span
                                onClick={() => fileInputRef.current.click()}
                                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 cursor-pointer"
                        >
                            Change Photo
                        </span>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            name="thumbnail"
                            onChange={handleImagePre}
                        />

                </div>
                <div className='flex gap-3 lg:flex-row flex-col'>
                    <div className='basis-[48%]'>
                        <div>
                            <p>Name</p>
                            <input type="text" placeholder="Name" name="name" value={profileData.name} onChange={(e) => { setProfileData({ ...profileData, name: e.target.value }) }} />
                            {errors.name && (<span className="text-[red] text-[11px] font-bold">{errors.name}</span>)}
                        </div>
                        <div>
                            <p>Email</p>
                            <input type="email" placeholder="Email" name="email" value={profileData.email} onChange={(e) => { setProfileData({ ...profileData, email: e.target.value }) }} disabled/>
                        </div>
                        
                    </div> 
                    <div className='basis-[48%]'>
                        <div>
                            <p>Phone</p>
                            <input type="text" placeholder="Phone" name="phone" value={profileData.phone} onChange={(e) => { setProfileData({ ...profileData, phone: e.target.value }) }}/>
                            {errors.mobile && (<span className="text-[red] text-[11px] font-bold">{errors.mobile}</span>)}
                        </div>
                        <div>
                            <p>Address</p>
                            <textarea name="address" placeholder="Address" value={profileData.address} onChange={(e) => { setProfileData({ ...profileData, address: e.target.value }) }}/>
                        </div>
                       
                    </div>
                </div>
                <button type="submit" className='bg-[#ff6347] mt-[10px] p-[10px_7px] text-[white] w-[150px]' >Update</button>
                
            </form>
            <div className='profile bg-white  lg:w-[80%] w-[100%] lg:p-[20px_10px] p-[0px_10px] text-[14px]' style={{display:(isDisplay)? '':'none'}}>
                <form method="post" onSubmit={handlePasswordUpdate}>
                    <p>Password</p> 
                    <div className='flex  gap-3 lg:flex-row flex-col'>
                        <div className='basis-[48%]'>
                        <input type="password" placeholder="Old Password" name="oldPassword" value={passData.oldPassword} onChange={(e) => { setPassData({ ...passData, oldPassword: e.target.value }) }} />
                        </div>
                        <div className='basis-[48%]'>
                            <input type="password" placeholder="New Password" name="newPassword" value={passData.newPassword} onChange={(e) => { setPassData({ ...passData, newPassword: e.target.value }) }} />
                            {passError && (<span className="text-[red] text-[11px] font-bold">{passError}</span>)}
                        </div>
                    </div>

                   <div className='flex'>
                    <button type="button" className='bg-[#ff6347] mt-[10px] p-[10px_7px] text-[white] w-[150px]' onClick={handleOtp} disabled={otpState.show}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {otpState.isLoading && (
                            <div className="spinner" style={{ display: 'inline-block', marginRight: '10px', fontSize:"20px" }}>
                                <FaSpinner />
                            </div>
                        )}
                        {otpState.changeText}
                        </div>
                         
                    </button> 
                    <span className='flex' style={{display:(otpState.show)? '':'none'}}>
                        <input type="text" placeholder='OTP' name='otpData'  value={passData.otpData} className='ms-2' onChange={(e) => { setPassData({ ...passData, otpData: e.target.value }) }} />
                        <button type="submit" className='bg-[#1e8d75] mt-[10px] ms-2 p-[7px] text-[white] w-[150px]'  >Update</button>
                
                    </span>
                </div> 
                 {/* Timer display */}
                   {otpState.timeLeft !== null && (
                    <p style={{ marginTop: "5px", fontSize: "12px", color:"#1e8d75", fontWeight:"bold" }}>
                    Time left: {formatTime(otpState.timeLeft)}
                    </p>
                  )} 
                </form>  
            </div> 
                
             

        </div>
        <ToastContainer position="top-right" />
    </>
  )
}   

export default Page
