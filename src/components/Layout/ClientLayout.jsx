import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/UI/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/UI/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/UI/dropdown-menu'
import { Menu } from 'lucide-react'
import ClientSidebar from '../UI/client/ClientSidebar'

const ClientLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const [clientId, setClientId] = useState(null)

    // Check for stored client ID on component mount
    useEffect(() => {
        const storedClientId = localStorage.getItem('client_id');
        if (storedClientId) {
            setClientId(storedClientId);
        } else {
            // If no client ID is found, redirect to login
            navigate('/login');
        }
    }, [navigate]);

    // Mock user data - would come from authentication context in a real app
    // In a production app, you'd fetch user details based on the clientId
    const user = {
        name: clientId || 'Client User',
        email: 'client@company.com',
        avatar: null
    }

    // Navigation data needed for mobile page title
    const navigation = [
        { name: 'Dashboard', href: '/client' },
        { name: 'Jobs', href: '/client/jobs' },
        { name: 'Quotes', href: '/client/quotes' },
        { name: 'Invoices', href: '/client/invoices' },
        { name: 'Support', href: '/client/support' },
        { name: 'Settings', href: '/client/settings' }
    ]

    const handleLogout = () => {
        // Clear client ID from localStorage
        localStorage.removeItem('client_id');
        // Navigate to login page
        navigate('/login');
    }

    // If not authenticated, don't render anything
    if (!clientId) return null;

    return (
        <>
            <div className="flex h-screen bg-gray-50">
                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-gray-900/50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar Component */}
                <ClientSidebar sidebarOpen={sidebarOpen} />

                {/* Main content */}
                <div className="flex flex-col flex-1 overflow-hidden">
                    {/* Top navigation */}
                    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-6">
                        {/* Mobile menu button */}
                        <button
                            type="button"
                            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu />
                        </button>

                        {/* Page title - mobile responsive */}
                        <div className="lg:hidden">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.href ||
                                    (item.href !== '/client' && location.pathname.startsWith(item.href))

                                if (isActive) {
                                    return <h1 key={item.name} className="text-lg font-medium">{item.name}</h1>
                                }
                                return null
                            })}
                        </div>

                        {/* User menu */}
                        <div className="flex items-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatar || ''} alt={user.name} />
                                            <AvatarFallback>
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout}>
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    {/* Main content area */}
                    <main className="flex-1 overflow-auto p-4 lg:p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    )
}

export default ClientLayout