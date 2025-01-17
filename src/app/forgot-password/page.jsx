"use client"
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import { FaSpinner } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';

function Page() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [otp, setOtp] = useState(['', '', '', '']);
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const [formData, setFormData] = useState({
        email: "",
    });
    const [passFormData, setPassFormData] = useState({
        password: "",
        cpassword:""
    });
    const [errors, setErrors] = useState({});
    const [passErrors, setPassErrors] = useState({});
    const [otpState, setOtpState] = useState({
            timeLeft: null,
            isLoading: false,
            show: false,
            changeText: "Get OTP",
            otpReceived: false, // New state to track when OTP is received
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e, index) => {
        const { value } = e.target;

        if (/^[0-9]$/.test(value) || value === '') {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Move to the next input
            if (value && index < inputRefs.length - 1) {
                inputRefs[index + 1].current.focus();
            }
            // Move to previous input if backspace
            if (!value && index > 0) {
                inputRefs[index - 1].current.focus();
            }
        }
    };

    const handlePaste = (e) => {
        const pastedData = e.clipboardData.getData('text');
        if (/^\d{4}$/.test(pastedData)) {
            setOtp(pastedData.split(''));
            inputRefs[3].current.focus();
           
        }
    };

    const validateForm = () => {
        const newErrors = {};
      
        const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

        if (!emailPattern.test(formData.email)) newErrors.email = 'please provide a valid email';

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0;
    }
    const passValidateForm=()=>{
        const newErrors = {};
        const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;
        if (!passwordPattern.test(passFormData.password)) newErrors.password ='Password must be 8-16 characters long, with at least 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character'

        if (passFormData.password!==passFormData.cpassword){
            newErrors.cpassword ='Confirm password must match the password'
        }

        setPassErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }
    const handleOtp=(e)=>{
        e.preventDefault()
       
        const ifValid = validateForm();

        if(!ifValid) return setTimeout(()=>{setErrors({})},4000);

        setOtpState((prev) => ({
            ...prev,
            isLoading: true,
            show: true,
            changeText: "OTP Sending...",
        }))

        axios.post(`${process.env.NEXT_PUBLIC_URL}/user-credential/user/generate-otp`,{email: formData.email} )
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
        
    }
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

    const handlerEmail=(e)=>{
        e.preventDefault()
        const inputOtp=otp.join('')
        axios.post(`${process.env.NEXT_PUBLIC_URL}/user-credential/user/verify-email`, {...formData,otp:inputOtp} )
              .then((response) => {
                console.log(response)
               
                setShowPassword(true)
                
                   
              })
              .catch((error) => {
                    console.log(error);
                    const { status } = error.response;
                    if (status === 401) {
                      toast.error("Invalid OTP. Please try again.");
                    }else {
                      toast.error("Unable to connect to the server. Please check your network.");
                    }
              });
        
    }
    const handleUpdatePassword=(e)=>{
        e.preventDefault()
         
        const ifValid = passValidateForm();

        if(!ifValid) return setTimeout(()=>{setPassErrors({})},4000);

        const {cpassword,...formDataWithoutCpassword}=passFormData
        

        const requestData = {
            email: formData.email, // Spread email first
            ...formDataWithoutCpassword        // Then spread other properties of passFormData
        };
       
        axios.put(`${process.env.NEXT_PUBLIC_URL}/user-credential/user/forgot-password`,requestData)
        .then((response) => {
            console.log(response)
            if (response.status === 200) {
                
                toast.success(`Successfully Password Updated`);
               
                setTimeout(() => {
                    router.push('/');
                }, 4000);
            }
           
        })
        .catch((error) => {
            console.log(error);
            toast.error("Updation failed. Please try again.");
        })

    }
  return (
    <div className='w-[100%] p-2'>
        <div className="lg:max-w-[440px] w-[90%] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] border p-3">
                    <h2 className="text-[#272B3F] font-semibold text-[18px] text-center">Forgot Password</h2>
                    {
                        showPassword ?(

                            <form method="post" onSubmit={handleUpdatePassword}>
                                <input type="password" name="password"  placeholder="New password" onChange={(e) => { setPassFormData({ ...passFormData, password: e.target.value }) }} value={passFormData.password} className='w-full p-[7px_10px] border-[1px] border-[solid] border-[#DDE6F0] mt-3 rounded-[3px] bg-[#fff] outline-none' />
                                {passErrors.password && (<span className="text-[red] text-[11px]">{passErrors.password}</span>)}

                                <input type="password" name="cpassword"  placeholder="Confirm password" onChange={(e) => {setPassFormData({ ...passFormData, cpassword: e.target.value }) }} value={passFormData.cpassword} className='w-full p-[7px_10px] border-[1px] border-[solid] border-[#DDE6F0] mt-3 rounded-[3px] bg-[#fff] outline-none' />
                                {passErrors.cpassword && (<span className="text-[red] text-[11px]">{passErrors.cpassword}</span>)}

                                <button type="submit" className="bg-[#0171D3] text-[14px] text-[#fff] w-full rounded-[3px] py-2 mt-4">Submit</button>
                               
                                    <p className="text-center text-[#272B3F] text-[14px] mt-[15px]">Do you already remember your password?  
                                        <Link href='/'>
                                            <span className="text-[#0171D3] cursor-pointer">Login</span>
                                        </Link>
                                    </p>
                                
                            </form>
                            
                        ):(
                            <form  method='post' onSubmit={handlerEmail}>
                        
                                <div className='flex item-center'>
                                    <input 
                                        type='text' 
                                        placeholder='Email' 
                                        name='email'
                                        className='w-[70%] bg-[#fff] p-[7px_10px] border-[1px] border-[solid] border-[#DDE6F0] mt-3 rounded-[3px] outline-none'
                                        onChange={(e)=>{setFormData({...formData,email:e.target.value})}} 
                                        value={formData.email} 
                                    />
                                    <button 
                                        type="button" 
                                        className='ms-3 mt-[10px] lg:p-[0px_20px] p-[0px_10px] w-[30%] text-[12px] text-[black]' 
                                        style={{backgroundColor:"#0171D3", color:"white"}}
                                        onClick={handleOtp}
                                        disabled={otpState.show}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {otpState.isLoading && (
                                                <div className="spinner" style={{ display: 'inline-block', marginRight: '10px', fontSize:"16px" }}>
                                                    <FaSpinner />
                                                </div>
                                            )}
                                            {otpState.changeText}
                                        </div>
                                        
                                    </button> 
                                </div>
                                {errors.email && (
                                        <span className="text-[red] text-[11px]">{errors.email}</span>
                                )}
                        
                                <div style={{display:(otpState.show)? '':'none'}}>
                                    <div style={{ display:'flex', alignItems:"center", gap: '10px',marginTop:"15px" }}>
                                        {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    type="text"
                                                    value={digit}
                                                    onChange={(e) => handleChange(e, index)}
                                                    onFocus={(e) => e.target.select()}
                                                    ref={inputRefs[index]}
                                                    maxLength={1}
                                                    style={{ border:'1px solid #ededed',width: '40px', height: '40px', fontSize: '20px', textAlign: 'center' }}
                                                    onPaste={handlePaste}
                                                />
                                            ))}
                                            <button
                                            type='submit'
                                            style={{ padding: '10px', backgroundColor:"orangered", color:"white" }}
                                            >
                                            Submit OTP
                                            </button>
                                    </div>
                                </div>
                                {/* Timer display */}
                                {otpState.timeLeft !== null && (
                                            <p style={{ marginTop: "5px", fontSize: "12px", color:"#1e8d75", fontWeight:"bold" }}>
                                            Time left: {formatTime(otpState.timeLeft)}
                                            </p>
                                )} 
                        
                            </form>
                        )
                    }
                    
                    
                   
                 </div>
                 <ToastContainer position="top-right" />  
    </div>
  )
}

export default Page