// src/components/UI/client/ClientSidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  Briefcase,
  FileText,
  LifeBuoy,
  Settings,
  Building,
  MapPin
} from 'lucide-react';

const ClientSidebar = ({ sidebarOpen }) => {
  const location = useLocation();  const [clientName, setClientName] = useState('Client Portal');
    // Fetch client name on component mount
  useEffect(() => {
    const fetchClientName = () => {
      const clientData = localStorage.getItem('client_data');
      if (clientData) {
        try {
          const parsedData = JSON.parse(clientData);
          setClientName(parsedData.name || 'Client Portal');
        } catch (error) {
          console.error('Error parsing client data in sidebar:', error);
          setClientName('Client Portal');
        }
      }
    };
    
    fetchClientName();
  }, []);
  const navigation = [
    { name: 'Dashboard', href: '/client', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Jobs', href: '/client/jobs', icon: <Briefcase className="h-5 w-5" /> },
    { name: 'Sites', href: '/client/sites', icon: <MapPin className="h-5 w-5" /> },
    { name: 'Support', href: '/client/support', icon: <LifeBuoy className="h-5 w-5" /> },
    { name: 'Settings', href: '/client/settings', icon: <Settings className="h-5 w-5" /> }
  ];

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform lg:translate-x-0 lg:static lg:z-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Sidebar header */}      <div className="h-16 flex items-center justify-center border-b px-4">
        <Link to="/client" className="flex items-center">
          <Building className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-bold">Job Portal</span>
        </Link>
      </div>
      
      {/* Sidebar navigation */}
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== '/client' && location.pathname.startsWith(item.href));
                          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default ClientSidebar;