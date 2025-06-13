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
import { ClientPermissionProvider } from '@/hooks/useClientPermissions'
import EnterprisePermissionHandler from '@/components/client/EnterprisePermissionHandler'
import setupAuthInterceptor, { addClientUuidHeader, removeClientUuidHeader } from '@/utils/authInterceptor'
import logo from '../../assets/logo.jpg'

const ClientLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const [clientId, setClientId] = useState(null)
    const [clientName, setClientName] = useState('Loading...')
    const [isLoading, setIsLoading] = useState(true)// Check for stored client data or user data on component mount and set client info
    useEffect(() => {
        const storedClientData = localStorage.getItem('client_data');
        const storedUserData = localStorage.getItem('user_data');
        
        if (storedClientData) {
            try {
                const clientData = JSON.parse(storedClientData);
                setClientId(clientData.uuid);
                setClientName(clientData.name || 'Client User');
                
                // Set up auth interceptor and client UUID header
                setupAuthInterceptor(navigate);
                addClientUuidHeader();
            } catch (error) {
                console.error('Error parsing client data:', error);
                // If parsing fails, redirect to login
                navigate('/login');
            }
        } else if (storedUserData) {
            try {
                const userData = JSON.parse(storedUserData);
                setClientId(userData.uuid || userData.userUuid);
                setClientName(userData.name || userData.email || 'User');
                
                // Set up auth interceptor for user
                setupAuthInterceptor(navigate);
            } catch (error) {
                console.error('Error parsing user data:', error);
                // If parsing fails, redirect to login
                navigate('/login');
            }        } else {
            // If no client or user data is found, redirect to login
            navigate('/login');
        }
        
        // Set loading to false after checking authentication
        setIsLoading(false);
        
        // Cleanup function to remove headers when component unmounts
        return () => {
            removeClientUuidHeader();
        };
    }, [navigate]);    // User data with actual client/user name and email
    const user = {
        name: clientName,
        email: localStorage.getItem('client_email') || localStorage.getItem('user_email') || 'user@company.com',
        avatar: null
    }// Navigation data needed for mobile page title
    const navigation = [
        { name: 'Dashboard', href: '/client' },
        { name: 'Jobs', href: '/client/jobs' },
        { name: 'Quotes', href: '/client/quotes' },
        { name: 'Invoices', href: '/client/invoices' },
        { name: 'Support', href: '/client/support' },
        { name: 'Settings', href: '/client/settings' }
    ];    const handleLogout = () => {
        // Remove client UUID header before logout
        removeClientUuidHeader();
        
        // Clear both client and user data from localStorage
        localStorage.removeItem('client_data');
        localStorage.removeItem('client_email');
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_email');
        
        // Navigate to login page
        navigate('/login');
    }    // If not authenticated or still loading, don't render anything
    if (isLoading || !clientId) return null;

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
                </div>                {/* Main content area */}
                <main className="flex-1 overflow-auto p-4 lg:p-6">
                    <ClientPermissionProvider>
                        <EnterprisePermissionHandler>
                            <Outlet />
                        </EnterprisePermissionHandler>
                    </ClientPermissionProvider>
                </main>
            </div>
        </div>
    )
}

export default ClientLayout