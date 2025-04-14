import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  Briefcase,
  Users,
  CalendarDays,
  UserPlus,
  Settings,
  ArrowUpDown
} from 'lucide-react';

const AdminSidebar = ({ sidebarOpen }) => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Jobs', href: '/admin/jobs', icon: <Briefcase className="h-5 w-5" /> },
    { name: 'Clients', href: '/admin/clients', icon: <Users className="h-5 w-5" /> },
    { name: 'Schedule', href: '/admin/schedule', icon: <CalendarDays className="h-5 w-5" /> },
    { name: 'Team', href: '/admin/team', icon: <UserPlus className="h-5 w-5" /> },
    { name: 'Settings', href: '/admin/settings', icon: <Settings className="h-5 w-5" /> }
  ];

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform lg:translate-x-0 lg:static lg:z-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Sidebar header */}
      <div className="h-16 flex items-center justify-center border-b px-4">
        <Link to="/admin" className="flex items-center">
          <ArrowUpDown className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-bold">ServiceM8 Portal</span>
        </Link>
      </div>
      
      {/* Sidebar navigation */}
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== '/admin' && location.pathname.startsWith(item.href));
                          
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

export default AdminSidebar;