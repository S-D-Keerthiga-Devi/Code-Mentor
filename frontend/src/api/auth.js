import axios from "../utlis/axiosInstance.js"

export const loginUser = async(data) => {
    const res = await axios.post('/api/auth/login', data)
    return res.data
}

export const signupUser = async(data) => {
    const res = await axios.post('/api/auth/register', data)
    return res.data
}

export const logoutUser = async(data) => {
    const res = await axios.post('/api/auth/logout', data)
    return res.data
}

export const emailVerify = async(data) => {
    const res = await axios.post('/api/auth/verify-account', data)
    return res.data
}

export const getEmailVerifyOtp = async(data) => {
    const res = await axios.post('/api/auth/send-verify-otp', data)
    return res.data
}

export const getPasswordResetOtp = async(data) => {
    const res = await axios.post('/api/auth/send-reset-otp', data)
    return res.data
}

export const resetPassword = async(data) => {
    const res = await axios.post('/api/auth/reset-password', data)
    return res.data
}