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
import { getClientNameByUuid } from '@/utils/clientUtils'
import logo from '../../assets/logo.jpg'

const ClientLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const [clientId, setClientId] = useState(null)
    const [clientName, setClientName] = useState('Client User')

    // Check for stored client ID on component mount and fetch client name
    useEffect(() => {
        const storedClientId = localStorage.getItem('client_id');
        if (storedClientId) {
            setClientId(storedClientId);
            
            // Fetch client name
            const fetchClientName = async () => {
                try {
                    const name = await getClientNameByUuid(storedClientId);
                    setClientName(name);
                } catch (error) {
                    console.error('Error fetching client name in layout:', error);
                    setClientName('Client User');
                }
            };
            
            fetchClientName();
        } else {
            // If no client ID is found, redirect to login
            navigate('/login');
        }
    }, [navigate]);

    // User data with actual client name
    const user = {
        name: clientName,
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
        <div className="flex h-screen overflow-hidden">
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
            <div className="flex-1 overflow-auto">
                {/* Top navigation */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 bg-white shadow-sm sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-3">
                        {/* Mobile menu button */}
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="lg:hidden">
                            <Menu className="h-6 w-6" />
                        </Button>
                        <img src={logo} alt="Job Portal Logo" className="h-8 w-auto hidden lg:block" />
                    </div>

                    {/* User menu */}
                    <div className="flex items-center space-x-4">
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
                </div>

                {/* Main content area */}
                <main className="flex-1 overflow-auto p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default ClientLayout