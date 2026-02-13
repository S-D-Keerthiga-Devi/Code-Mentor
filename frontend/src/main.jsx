import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route, Navigate } from 'react-router-dom'
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react"
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css"

import store from './store/store'
import Layout from './Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUpPage from './pages/SignUp'
import AuthCallback from './pages/AuthCallback'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import SafeSuggest from './pages/SafeSuggest'
import RoleSelection from './pages/RoleSelection'
import StudentDashboard from './pages/student/StudentDashboard'
import InstructorDashboard from './pages/instructor/InstructorDashboard'
import InstructorMaterials from './pages/instructor/InstructorMaterials'
import StudentCourseBot from './pages/student/StudentCourseBot'
import About from './pages/About'
import CollaborationRoom from './components/Collaboration/CollaborationRoom';

// Import your Clerk Publishable Key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  console.error("Missing Clerk Publishable Key");
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout />}>
      <Route path='' element={<Home />} />
      <Route path='login/*' element={<Login />} />
      <Route path='sign-up/*' element={<SignUpPage />} />
      <Route path='email-verify' element={<EmailVerify />} />
      <Route path='reset-password' element={<ResetPassword />} />
      <Route path='dashboard' element={<Dashboard />} />
      <Route path='safe-suggest' element={<SafeSuggest />} />
      <Route path='about' element={<About />} />

      {/* Auth Callback Route */}
      <Route path='auth-callback' element={
        <>
          <SignedIn><AuthCallback /></SignedIn>
          <SignedOut><RedirectToSignIn /></SignedOut>
        </>
      } />

      {/* Protected Routes */}
      <Route path='role-selection' element={
        <>
          <SignedIn><RoleSelection /></SignedIn>
          <SignedOut><RedirectToSignIn /></SignedOut>
        </>
      } />

      <Route path='student/dashboard' element={
        <>
          <SignedIn><StudentDashboard /></SignedIn>
          <SignedOut><RedirectToSignIn /></SignedOut>
        </>
      } />
      <Route path='student/course-bot' element={
        <>
          <SignedIn><StudentCourseBot /></SignedIn>
          <SignedOut><RedirectToSignIn /></SignedOut>
        </>
      } />

      <Route path='instructor/dashboard' element={
        <>
          <SignedIn><InstructorDashboard /></SignedIn>
          <SignedOut><RedirectToSignIn /></SignedOut>
        </>
      } />
      <Route path='instructor/materials' element={
        <>
          <SignedIn><InstructorMaterials /></SignedIn>
          <SignedOut><RedirectToSignIn /></SignedOut>
        </>
      } />

      {/* Real-Time Collaboration Route */}
      <Route path='collab/:roomId' element={
        <>
          <SignedIn><CollaborationRoom /></SignedIn>
          <SignedOut><RedirectToSignIn /></SignedOut>
        </>
      } />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>


    <ClerkProvider publishableKey={clerkPubKey}>
      <Provider store={store}>
        <ToastContainer theme="dark" />
        <RouterProvider router={router} />
      </Provider>
    </ClerkProvider>
  </StrictMode>,
)
