import React from 'react'
import AdminSidebar from '../UI/AdminSidebar.jsx'
import { Outlet } from 'react-router-dom'

const AdminLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />
            <main className="flex-1 p-6 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    )
}

export default AdminLayout