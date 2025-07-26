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

    // Check every 30 seconds when close to expiry (more frequent but non-blocking)
    const interval = setInterval(checkSessionWarning, 30000);
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

  // Show as non-blocking toast notification instead of modal
  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      <div className="bg-orange-50 border border-orange-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-orange-800 mb-1">
              Session Expiring
            </div>
            <div className="text-sm text-orange-700 mb-3">
              <div className="flex items-center gap-2 font-mono font-bold mb-1">
                <Clock size={16} />
                {formatTime(timeRemaining)}
              </div>
              Auto-logout when timer reaches zero
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={handleExtendSession}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Stay Logged In
              </Button>
              <Button 
                size="sm"
                variant="outline" 
                onClick={handleLogoutNow}
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;
