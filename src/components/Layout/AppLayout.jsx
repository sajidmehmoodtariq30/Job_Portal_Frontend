import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../UI/Navbar.jsx'
import Footer from '../UI/Footer.jsx'

const AppLayout = () => {
  return (
    <div className='bg-white w-screen h-screen flex flex-col'>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}

export default AppLayout