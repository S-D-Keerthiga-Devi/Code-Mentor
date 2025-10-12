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
    <Route path='/' element={<Layout/>}>
      <Route path='' element={<Home/>}/>
      <Route path='login' element={<Login/>}/>
      <Route path='email-verify' element={<EmailVerify/>}/>
      <Route path='reset-password' element={<ResetPassword/>}/>
      <Route path='dashboard' element={<Dashboard/>}/>
      <Route path='safe-suggest' element={<SafeSuggest/>}/>
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
