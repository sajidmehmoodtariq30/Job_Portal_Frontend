import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">ShareTribe</h1>
        <div className="space-x-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/login" className="hover:underline">Login</Link>
          <Link to="/admin" className="hover:underline">Admin Dashboard</Link>
          <Link to="/client" className="hover:underline">Client Dashboard</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar