import React from 'react'
import { Outlet } from 'react-router-dom'
import { CollaborationProvider } from './context/CollaborationContext'

const Layout = () => {
  return (
    <CollaborationProvider>
      <div>
        <Outlet />
      </div>
    </CollaborationProvider>
  )
}

export default Layout
