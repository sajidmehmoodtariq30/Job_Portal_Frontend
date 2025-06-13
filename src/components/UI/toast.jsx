import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './alert';

export const Toast = ({ toast, onDismiss }) => {
  const getVariantClass = (variant) => {
    switch (variant) {
      case 'destructive':
        return 'border-red-500 bg-red-50 text-red-900';
      case 'success':
        return 'border-green-500 bg-green-50 text-green-900';
      default:
        return 'border-blue-500 bg-blue-50 text-blue-900';
    }
  };

  return (
    <div 
      className={`fixed top-4 right-4 z-50 w-96 p-4 border rounded-lg shadow-lg transition-all duration-300 ${getVariantClass(toast.variant)}`}
      onClick={() => onDismiss(toast.id)}
      style={{ cursor: 'pointer' }}
    >
      {toast.title && (
        <div className="font-semibold mb-1">{toast.title}</div>
      )}
      {toast.description && (
        <div className="text-sm opacity-90">{toast.description}</div>
      )}
    </div>
  );
};

export const ToastContainer = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ 
            transform: `translateY(${index * 80}px)`,
            zIndex: 50 - index
          }}
        >
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};
