import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Puzzle, 
  Settings,
  Bell,
  ChevronDown,
  ArrowUpDown,
  FileText,
  Tags,
  UserCheck
} from 'lucide-react';

const AdminSidebar = ({ sidebarOpen }) => {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);    const navigation = [
    { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Clients Management', href: '/admin/clients', icon: <Users className="h-5 w-5" /> },
    { name: 'Client Name Manager', href: '/admin/client-names', icon: <UserCheck className="h-5 w-5" /> },
    { name: 'Jobs Management', href: '/admin/jobs', icon: <Briefcase className="h-5 w-5" /> },
    { name: 'Categories Management', href: '/admin/categories', icon: <Tags className="h-5 w-5" /> },
    { name: 'Quotes Management', href: '/admin/quotes', icon: <FileText className="h-5 w-5" /> },
    { name: 'API Plugin', href: '/admin/api-plugin', icon: <Puzzle className="h-5 w-5" /> }
  ];

  const settingsNavigation = [
    { name: 'Notifications Settings', href: '/admin/settings/notifications', icon: <Bell className="h-5 w-5" /> }
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

        {/* Settings dropdown */}
        <div className="mt-2">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-2 rounded-md text-sm font-medium transition-colors",
              location.pathname.startsWith('/admin/settings')
                ? "bg-primary text-primary-foreground"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <div className="flex items-center">
              <Settings className="h-5 w-5" />
              <span className="ml-3">Settings</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                settingsOpen ? "transform rotate-180" : ""
              )}
            />
          </button>

          {/* Settings submenu */}
          {settingsOpen && (
            <div className="pl-4 mt-1 space-y-1">
              {settingsNavigation.map((item) => {
                const isActive = location.pathname === item.href;
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
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;