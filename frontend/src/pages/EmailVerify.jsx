import React, {useState} from 'react'
import { useSelector,useDispatch } from "react-redux";
import { emailVerify, getEmailVerifyOtp } from '../api/auth.js';
import { updateUser } from '../store/authSlice.js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function EmailVerify () {

  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [verifyEmail, setverifyEmail] = useState(false)
  const {userData} = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSentOtp = async() => {
    try {
      let res
      res = await getEmailVerifyOtp({userData})

      if(res?.success){
        toast.success(res.message || "OTP sent to your email")
        setOtpSent(true)        
      } else {
        toast.success(res.message || "Something went wrong")  
      }
      
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const handleVerifyEmail = async(otpValue) => {
      try {
        let res
        if(!verifyEmail){
          res = await emailVerify({...userData, otp: otpValue})
        }
        if(res?.success){
          const userRes = await userDetails();
          if(userRes?.success){
            dispatch(updateUser({userData: res.user}))
          }
          toast.success(res.message || "Email verified successfully")
          navigate('/dashboard')
        } else {
          toast.success(res.message || "Something went wrong")  
        }

      } catch (error) {
        toast.error(error.response?.data?.message || error.message)
      }
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          Email Verification
        </h1>

        {/* Step 1: Send OTP */}
        {!otpSent ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Click below to send an OTP to your registered email:{" "}
              <span className="font-semibold">{userData?.email}</span>
            </p>
            <button
              onClick={handleSentOtp}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Send OTP
            </button>
          </div>
        ) : (
          <>
            {/* Step 2: Enter OTP */}
            <div className="mb-4">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the 6-digit OTP"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Step 3: Verify */}
            <button
              onClick={() => handleVerifyEmail(otp)}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Verify Email
            </button>
          </>
        )}
      </div>
    </div>
  );
}


