import React from 'react';
import { Button } from "@/components/UI/button";
import { LogOut } from "lucide-react";
import { useSession } from '@/context/SessionContext';

const LogoutButton = ({ variant = "outline", size = "sm", className = "" }) => {
  const { handleAdminLogout, handleUserLogout, isAdmin, isUser } = useSession();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      if (isAdmin()) {
        handleAdminLogout('User initiated logout');
      } else if (isUser()) {
        handleUserLogout('User initiated logout');
      }
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleLogout}
      className={`flex items-center gap-2 ${className}`}
    >
      <LogOut size={16} />
      Logout
    </Button>
  );
};

export default LogoutButton;
