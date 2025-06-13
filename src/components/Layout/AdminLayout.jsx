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
import AdminSidebar from '../UI/admin/AdminSidebar.jsx'
import axios from "axios"
import logo from '../../assets/logo.jpg'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const expires_in = params.get('expires_in');
    const token_type = params.get('token_type');
    const scope = params.get('scope');
    if (access_token && refresh_token && expires_in && token_type && scope) {
      const tokenData = {
        access_token,
        refresh_token,
        expires_in,
        token_type,
        scope: decodeURIComponent(scope)
      };
      localStorage.setItem('admin_token', JSON.stringify(tokenData));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Mock user data - would come from authentication context
  const user = {
    name: 'Admin User',
    email: 'admin@company.com',
    avatar: null
  }
    // Navigation data needed for mobile page title
  const navigation = [    { name: 'Dashboard', href: '/admin' },
    { name: 'Jobs', href: '/admin/jobs' },
    { name: 'Clients', href: '/admin/clients' },
    { name: 'Schedule', href: '/admin/schedule' },
    { name: 'Team', href: '/admin/team' },
    { name: 'Settings', href: '/admin/settings' }
  ]
  const handleLogout = () => {
    // Clear authentication tokens and admin-related data
    localStorage.removeItem('admin_token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('user_data')
    
    // Clear any cached admin data
    sessionStorage.clear()
    
    // Navigate to login page and replace current history entry
    // This prevents using browser back button to return to admin area
    navigate('/login', { replace: true })
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar Component */}
      <AdminSidebar sidebarOpen={sidebarOpen} />
      
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
          
          {/* Logo - hidden on small screens */}
          <div className="hidden lg:flex items-center">
            <img src={logo} alt="Job Portal Logo" className="h-8 w-auto" />
          </div>
          
          {/* Page title - mobile responsive */}
          <div className="lg:hidden">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                              (item.href !== '/admin' && location.pathname.startsWith(item.href))
              
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
  )
}

export default AdminLayout