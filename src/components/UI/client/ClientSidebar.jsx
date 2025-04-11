import React from 'react'
import { Link } from 'react-router-dom'

const ClientSidebar = () => {
  return (
    <aside className="w-64 bg-purple-500/60 p-4">
      <h2 className='text-2xl font-bold mb-6'>
        <Link to='/' >Home</Link>
      </h2>
      <nav className="flex flex-col gap-4">
        <Link to="/client" className="hover:underline line">Dashboard</Link>
        <Link to="/client/progress" className="hover:underline">Progress</Link>
        <Link to="/client/settings" className="hover:underline">Settings</Link>
      </nav>
    </aside>
  )
}

export default ClientSidebar