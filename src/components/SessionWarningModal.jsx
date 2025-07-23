import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { Button } from "@/components/UI/button";
import { Clock, AlertTriangle } from "lucide-react";
import { useSession } from '@/context/SessionContext';

const SessionWarningModal = () => {
  const { getSessionTimeRemaining, extendSession, handleAdminLogout, handleUserLogout, isAdmin, isUser } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const checkSessionWarning = () => {
      const remaining = getSessionTimeRemaining();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      if (remaining > 0 && remaining <= fiveMinutes && !isOpen) {
        setTimeRemaining(remaining);
        setIsOpen(true);
      } else if (remaining <= 0) {
        setIsOpen(false);
      }
    };

    // Check every 15 minutes when close to expiry
    const interval = setInterval(checkSessionWarning, 900000);
    checkSessionWarning(); // Check immediately

    return () => clearInterval(interval);
  }, [getSessionTimeRemaining, isOpen]);

  // Update countdown every second when modal is open
  useEffect(() => {
    if (isOpen) {
      const countdown = setInterval(() => {
        const remaining = getSessionTimeRemaining();
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          setIsOpen(false);
          // Session will auto-logout via SessionContext
        }
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [isOpen, getSessionTimeRemaining]);

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleExtendSession = () => {
    extendSession();
    setIsOpen(false);
  };

  const handleLogoutNow = () => {
    setIsOpen(false);
    if (isAdmin()) {
      handleAdminLogout('User chose to logout from session warning');
    } else if (isUser()) {
      handleUserLogout('User chose to logout from session warning');
    }
  };

  if (!isOpen || timeRemaining <= 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle size={20} />
            Session Expiring Soon
          </DialogTitle>
          <DialogDescription>
            Your session will expire soon due to inactivity.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6">
          <div className="flex items-center gap-2 text-2xl font-mono font-bold text-red-500 mb-2">
            <Clock size={24} />
            {formatTime(timeRemaining)}
          </div>
          <p className="text-sm text-gray-500 text-center">
            You will be automatically logged out when the timer reaches zero.
          </p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleLogoutNow}
            className="w-full sm:w-auto"
          >
            Logout Now
          </Button>
          <Button 
            onClick={handleExtendSession}
            className="w-full sm:w-auto"
          >
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionWarningModal;
