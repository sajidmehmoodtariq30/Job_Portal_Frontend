import { useState, useCallback } from 'react';

// Simple toast notification system
let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = 'default', duration = 3000 }) => {
    const id = ++toastId;
    const newToast = {
      id,
      title,
      description,
      variant,
      duration
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss toast after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toast,
    dismiss,
    dismissAll,
    toasts
  };
};
