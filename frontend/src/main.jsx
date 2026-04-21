import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RouterProvider, createBrowserRouter, createRoutesFromElements} from 'react-router-dom'
import { Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import Layout from './Layout'
import store from './store/store'
import { Provider } from 'react-redux'
import { ToastContainer, toast } from 'react-toastify'
import Dashboard from './pages/Dashboard'
import SafeSuggest from './pages/SafeSuggest'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout />}>
      <Route path='' element={
        <>
          <SignedIn><Navigate to="/auth-callback" replace /></SignedIn>
          <SignedOut><Home /></SignedOut>
        </>
      } />
      <Route path='login/*' element={<Login />} />
      <Route path='sign-up/*' element={<SignUpPage />} />
      <Route path='email-verify' element={<EmailVerify />} />
      <Route path='reset-password' element={<ResetPassword />} />
      <Route path='dashboard' element={<Dashboard />} />
      <Route path='safe-suggest' element={<SafeSuggest />} />
      <Route path='about' element={<About />} />

      {/* Auth Callback Route */}
      <Route path='auth-callback*' element={
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

      {/* Visual Debugger Route */}
      <Route path='visual-debugger' element={
        <>
          <SignedIn><VisualDebuggerLayout /></SignedIn>
          <SignedOut><RedirectToSignIn /></SignedOut>
        </>
      } />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ToastContainer />
      <RouterProvider router={router}/>
    </Provider>
  </StrictMode>,
)
