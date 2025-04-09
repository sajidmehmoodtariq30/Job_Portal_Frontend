import React from 'react'
import ClientSidebar from '../UI/ClientSidebar.jsx'
import { Outlet } from 'react-router-dom'

const ClientLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            <ClientSidebar />
            <main className="flex-1 p-6 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    )
}

export default ClientLayout