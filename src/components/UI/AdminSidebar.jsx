import React from 'react'
import { Link } from 'react-router-dom'

const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-purple-500/60 p-4">
      <h2 className='text-2xl font-bold mb-6'>
      <Link to='/' >Home</Link>
      </h2>
      <nav className="flex flex-col gap-4">
        <Link to="/admin" className="hover:underline">Dashboard</Link>
        <Link to="/admin/users" className="hover:underline">Users</Link>
        <Link to="/admin/settings" className="hover:underline">Settings</Link>
      </nav>
    </aside>
  )
}

export default AdminSidebar