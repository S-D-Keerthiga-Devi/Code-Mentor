import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { loginUser, signupUser } from '../api/auth'
import { login as authLogin } from '../store/authSlice'
import { toast } from 'react-toastify'
import { ArrowLeft } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true)
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const { register, handleSubmit, reset } = useForm()

    // Get redirect information from navigation state
    const redirectTo = location.state?.redirectTo || '/dashboard'
    const message = location.state?.message

    const onSubmit = async (data) => {

        try {
            let res;
            if (isLogin) {
                res = await loginUser({ email: data.email, password: data.password })
            } else {
                res = await signupUser({ name: data.name, email: data.email, password: data.password })
            }

            if (res?.success) {
                dispatch(authLogin({ userData: res.user }))
                localStorage.setItem("token", res.token)
                localStorage.setItem("userData", JSON.stringify(res.user))
                toast.success(res.message || (isLogin ? "Login Successful" : "Signup Successful"))
                navigate(redirectTo)
            } else {
                toast.error(res?.message || "Something went wrong")
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }

    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
            {/* ✅ Back Arrow */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 text-gray-600 hover:text-indigo-600 transition flex items-center space-x-1"
            >
                <ArrowLeft size={22} />
                <span className="text-sm font-medium">Back</span>
            </button>
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
                    {isLogin ? "Login to CodeMentor" : "Sign Up for CodeMentor"}
                </h2>
                
                {message && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-sm text-center">{message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {!isLogin && (
                        <div>
                            <label htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input type="text"
                                id="name"
                                placeholder="John Doe"
                                {...register("name", { required: !isLogin })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input type="email"
                            id="email"
                            placeholder="email@example.com"
                            {...register("email", { required: true })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>

                    <div>
                        <label htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input type="password"
                            id="password"
                            placeholder="**********"
                            {...register("password", { required: true })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>

                    {isLogin && (
                        <div className="text-left">
                            <button
                                type="button"
                                className="text-sm text-indigo-600 hover:underline"
                                onClick={() => navigate('/reset-password')}>
                                Forgot password?
                            </button>
                        </div>
                    )}

                    <button
                        type='submit'
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
                        {isLogin ? "Login" : "Sign up"}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-indigo-600 font-medium hover:underline">
                        {isLogin ? "Sign up" : "Login"}
                    </button>
                </p>
            </div>
        </div>
    )
}

export default Login
