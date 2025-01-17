"use client"
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";
import { FaCheck } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { useDispatch} from "react-redux";
import { login,logout } from "./redux/slices/userSlice";
import Link from 'next/link';
import {getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from "./google-config/firebaseConfig";
import Image from 'next/image'

const SITE_KEY=process.env.NEXT_PUBLIC_SITE_KEY

export default function Home() {
  const [signUp, setSignUp] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailerror,setEmailError]=useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [verifyText,setVerifyText] = useState('Check');
  const [disableStatus, setDisableStatus]= useState(false);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });
   const [ loginForm, setLoginForm ] = useState({
    email: "",
    password: "",
   });
 
   const [emailData,setEmaildata]=useState({
    email: "",
    otp: "",
   });
  const dispatch = useDispatch();
  const [recaptchaValue,setRecaptchaValue]=useState('')
  const recaptchaRef = useRef(null); // Create a ref for reCAPTCHA
  const router = useRouter();

  const auth = getAuth(app)
  const provider = new GoogleAuthProvider();

  const validateForm = () => {
    const newErrors = {};
    if(formData.name){
      if (!formData.name.trim()) newErrors.name = 'Please enter your name';
    }else{
      newErrors.name = 'Please enter your name';
    }


    const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;
    if (!passwordPattern.test(formData.password)) newErrors.password ='Minimum 8 Characters password, Atleast 1 Capital letter, 1 special character, 1 digit'


    setErrors(newErrors);

    console.log(newErrors);

    return Object.keys(newErrors).length === 0;

  }

  const emailValidate=(e)=>{

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailData.email)) {
      const newEmailError = 'Invalid Email ID';
      setEmailError(newEmailError);
      setIsEmailValid(false);
      return false;
    }
    setEmailError('');
    setIsEmailValid(true);
    return true;

  }
    
  
  const handlRegisterData=(e)=>{
      e.preventDefault();
      
      const ifValid = validateForm();

      if(!ifValid) return setTimeout(()=>{setErrors({})},4000);
      
      if (verifyText==='Check') {
          toast.error("Kindly verify your email")
      } 
      else{
        axios.post(`${process.env.NEXT_PUBLIC_URL}/user-credential/user/user-register`,{...formData,email:emailData.email})
        .then((response)=>{
            console.log(response.data)
          
            toast.success(`Successfully Registered`);
            setFormData({ name: "", password: "" });
            setEmaildata({email:"",otp:""})
            setSignUp(false)
            
        })
        .catch((error)=>{
          console.log(error)
          if (error.response && error.response.status === 403) {
            toast.error("Email already exists, please use a different one.");
          } else {
            toast.error("Registration failed. Please try again.");
          }
        })
      }
  
      // const data={
      //   name:e.target.name.value,
      //   email:e.target.email.value,
      //   password:e.target.password.value
      // }
      
      
   }
  const changeCaptcha=(value)=>{
     setRecaptchaValue(value)
  }

  const handleLoginData = async (e) => {
    e.preventDefault();
  
    axios.post(`${process.env.NEXT_PUBLIC_URL}/user-credential/user/user-login`, { ...loginForm, recaptchaValue })
      .then((response) => {
        // Dispatch login to Redux after successful login
        dispatch(login(response.data)); // This will update Redux and localStorage
  
        setLoginForm({ email: "", password: "" });
        router.push('/home');
      })
      .catch((error) => {
        console.log(error);
        if (error.response) {
          const { status } = error.response;
  
          if (status === 403) {
            toast.error("Email ID does not exist. Please try again.");
          } else if (status === 401) {
            toast.error("Invalid password. Please try again.");
          } else {
            toast.error("An error occurred. Please try again later.");
          }
        } else {
          toast.error("Unable to connect to the server. Please check your network.");
        }
  
        if (recaptchaRef?.current) {
          recaptchaRef.current.reset();
        }
      });
  };
  
   useEffect(() => {
    const ifLogins = () => {
      if (typeof window !== "undefined") { 
        const userData = localStorage.getItem('user-data');
        if (userData) {
          try {
            const { auth } = JSON.parse(userData);
            if (auth) {
              router.push('/home');
            }
          } catch (error) {
            console.error('Failed to parse user data:', error);
          }
        }
      }
    };

    ifLogins();
  }, [router]);
  
  
  const handleOtp=(e)=>{
      e.preventDefault()
      const ifValid = emailValidate();
      if(!ifValid) return setTimeout(()=>{setEmailError('')},4000);
      
      axios.post(`${process.env.NEXT_PUBLIC_URL}/user-credential/user/generate-otp`, { email: emailData.email })
          .then((response) => {
                 console.log(response.data);
                 toast.success("OTP has been sent successfully");
               
          })
          .catch((error) => {
                console.log(error);
                if (error.response) {
                    const { status } = error.response;
                    if (status === 500) {
                      toast.error("Something went wromg !");
                        }    
                }else{
                    toast.error("Unable to connect to the server. Please check your network.");
                }
          });
  }

  const handlerEmail=(e)=>{
    e.preventDefault()
    axios.post(`${process.env.NEXT_PUBLIC_URL}/user-credential/user/verify-email`, emailData)
          .then((response) => {
            console.log(response)
            setIsEmailValid(false)
            setDisableStatus(true)
            setVerifyText(<FaCheck  size={10} color="green"/> )
            toast.success(`Successfully Email Verified`);
               
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

  const googleLogin=()=>{
    
      
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        
        if (!token) {
          // Token is not available, log the user out
          dispatch(logout());
          toast.error("Failed to authenticate. Please try again.");
          return; // Early return to prevent further processing
        }
        
        // The signed-in user info.
        const user = result.user;
        // console.log('token',token)
        // console.log(user)

        // IdP data available using getAdditionalUserInfo(result)
        if (!token) {
          dispatch(logout());
          toast.error("Failed to authenticate. Please try again.");
          return;
        } 

        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          token: token // Add the token to userData
      };
      
      axios.post(`${process.env.NEXT_PUBLIC_URL}/user-credential/user/check-email`, {email:userData.email})
      .then((response) => {
        // User exists
          if (response.status === 200 && response.data.data) {
              dispatch(login(response.data));
              router.push('/home');
          }
        }) 
        .catch((error) => {
          if (error.response && error.response.status === 404) {
              // User does not exist, register them
              axios.post(`${process.env.NEXT_PUBLIC_URL}/user-credential/user/google-user-register`, {
                  name: userData.displayName,
                  email: userData.email
              })
              .then((registerResponse) => {
                  dispatch(login(registerResponse.data));                 
                  router.push('/home');
              })
              .catch((registerError) => {
                  console.error(registerError);
                  toast.error("Registration failed. Please try again.");
              });
          } else {
              console.error(error);
          }
        });
       })

      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }


  return (
    <>
     
       {
         signUp ? ( 
          
          <div className="w-[350px] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] border p-3">
          
              <h2 className="text-[#272B3F] font-semibold text-[18px] text-center">Signup</h2>

              <form method="post" onSubmit={handlRegisterData}>

                <input type="text" name="name"  placeholder="Name" onChange={(e) => { setFormData({ ...formData, name: e.target.value }) }} value={formData.name} className='w-full bg-[#fff] p-[7px_10px] border-[1px] border-[solid] border-[#DDE6F0] mt-3 rounded-[3px] outline-none' />
                {errors.name && (<span className="text-[red] text-[11px]">{errors.name}</span>)}

                <div className='flex item-center'>
                  <input type="email" name="email"  placeholder="Email"  onChange={(e)=>{setEmaildata({...emailData,email:e.target.value})}} value={emailData.email} className='p-[7px_10px] border-[1px] border-[solid] border-[#DDE6F0] mt-3 rounded-[3px_0_0_3px] bg-[#fff] outline-none' style={{width:(disableStatus)?"90%":"80%", borderRight:(disableStatus)?0:"1px solid #DDE6F0"}} />

                  <button 
                        type="button" 
                        className='mt-[12px] text-[14px] rounded-[0_3px_3px_0] outline-none' 
                        onClick={handleOtp}
                        style={{
                          backgroundColor:(disableStatus)?"#fff":"#e9e8e8", 
                          width:(disableStatus)?"10%":"20%",
                          border:"1px solid #DDE6F0",
                          borderLeft:0
                        }}
                        disabled={disableStatus}
                        
                  >
                         {verifyText}
                  </button>

                </div>
                {emailerror && (
                        <span className="text-[red] text-[11px]">{emailerror}</span>
                )}

                {isEmailValid && (
                    <>
                      <input 
                            type="text" 
                            placeholder="OTP" 
                            name="otp"
                            className="w-full p-[5px_10px] border-[1px] border-[solid] border-[#DDE6F0] mt-3 rounded-[3px] outline-none"
                            onChange={(e)=>{setEmaildata({...emailData,otp:e.target.value})}} 
                            value={emailData.otp} 
                      />
                      <button type="button" className='outline-none mt-2 p-2 text-[11px] bg-[#e9e9e9]' onClick={handlerEmail}>
                           OTP Submit
                      </button>
                    </>
                )}

                <input type="password" name="password"  placeholder="Create password" onChange={(e) => { setFormData({ ...formData, password: e.target.value }) }} value={formData.password} className='w-full p-[7px_10px] border-[1px] border-[solid] border-[#DDE6F0] mt-3 rounded-[3px] bg-[#fff] outline-none' />
                {errors.password && (<span className="text-[red] text-[11px]">{errors.password}</span>)}

                <button type="submit" className="bg-[#0171D3] text-[14px] text-[#fff] w-full rounded-[3px] py-2 mt-4">Submit</button>

                <p className="text-center text-[#272B3F] text-[14px] mt-[15px]">Already have an account? <span className="text-[#0171D3] cursor-pointer" onClick={()=>setSignUp(false)}>Login</span></p>

                <p className="line mt-[18px] text-[#DDE6F0] text-center">or</p>

              </form>
              <button type="submit" onClick={googleLogin} className="border-[1px] border-[solid] border-[#DDE6F0] text-[14px] text-[#929191] w-full rounded-[3px] py-2 mt-[30px] font-semibold flex items-center ">
                  <Image src="/Logo-google-icon-PNG.png" width="18" height="18" className="ms-[10px] " alt="" />
                  <span className="ms-[80px]">Login with Google</span>
              </button>

              


          </div>
           
         )
          
         : (
         
            
            <div className="w-[350px] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] border p-3">
          
              <h2 className="text-[#272B3F] font-semibold text-[18px] text-center">Login</h2>
              <form onSubmit={handleLoginData}>
                  <input type="text" name="email"  placeholder="Email" onChange={(e) => { setLoginForm ({ ...loginForm, email: e.target.value }) }} value={loginForm.email} className='w-full bg-[#fff] p-[7px_10px] border-[1px] border-[solid] border-[#DDE6F0] mt-3 rounded-[3px] outline-none'  />

                  <input type="password" name="Password"  placeholder="Password" onChange={(e) => { setLoginForm({ ...loginForm, password: e.target.value }) }} value={loginForm.password} className='w-full p-[7px_10px] border-[1px] border-[solid] border-[#DDE6F0] mt-3 rounded-[3px] bg-[#fff] outline-none' />
                  <div className='mt-2'>
                    <ReCAPTCHA
                       sitekey={SITE_KEY}
                      ref={recaptchaRef}
                       onChange={changeCaptcha}
                     />
                  </div> 
                  <button type="submit" className="bg-[#0171D3] text-[14px] text-[#fff] w-full rounded-[3px] py-2 mt-4">Submit</button>
                  <p className="text-center text-[#272B3F] text-[14px] mt-[15px]">Don&apos;t have an account? <span className="text-[#0171D3] cursor-pointer" onClick={()=>setSignUp(true)}>Signup</span></p>

                  <Link href='/forgot-password'>
                    <p className="text-center text-[#0171D3] text-[14px] mt-[15px]">Forgot Password </p>
                  </Link>

                  <p className="line mt-[18px] text-[#DDE6F0] text-center">or</p>
                  <Link href='/otplogin'>
                    <button type="submit" className="border-[1px] border-[solid] border-[#DDE6F0] text-[14px] text-[#929191] w-full rounded-[3px] py-2 mt-[20px] font-semibold">
                    
                      Login with OTP

                    </button>
                  </Link>

              </form>
              <button type="button" onClick={googleLogin}  className="border-[1px] border-[solid] border-[#DDE6F0] text-[14px] text-[#929191] w-full rounded-[3px] py-2 mt-[30px] font-semibold flex items-center ">
                  <Image src="/Logo-google-icon-PNG.png" width="18" height="18" className="ms-[10px] " alt="" />
                  <span className="ms-[80px]">Login with Google</span>
              </button> 
                 
              
              
            </div>

            
         )
       }
       <ToastContainer position="top-right" />
    </>

  )
}
