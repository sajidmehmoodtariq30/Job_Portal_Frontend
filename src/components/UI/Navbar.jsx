import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-purple-600/60 text-white py-4 px-3">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Job_Portal</h1>
        <div className="space-x-6">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/login" className="bg-[#1c1c1c81] p-2.5 rounded-lg hover:bg-[#1c1c1cd9] cursor-pointer">Get Started</Link>
          <Link to="/admin" className="bg-[#1c1c1c81] p-2.5 rounded-lg hover:bg-[#1c1c1cd9] cursor-pointer">Get Started</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar