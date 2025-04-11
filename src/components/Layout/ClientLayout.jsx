import React from 'react'
import ClientSidebar from '../UI/client/ClientSidebar.jsx'
import { Outlet } from 'react-router-dom'

const ClientLayout = () => {
    return (
        <div className="flex h-screen text-amber-50">
            <ClientSidebar />
            <main className="flex-1 p-6 overflow-y-auto bg-purple-500">
                <Outlet />
            </main>
        </div>
    )
}

export default ClientLayout