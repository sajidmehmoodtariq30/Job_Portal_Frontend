import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './alert';

export const Toast = ({ toast, onDismiss }) => {
  const [isVisible, setIsVisible] = React.useState(true);

  // Auto-dismiss after 5 seconds for non-critical toasts
  React.useEffect(() => {
    if (toast.variant !== 'destructive') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(toast.id), 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.variant, onDismiss]);

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
      className={`w-80 p-3 border rounded-lg shadow-md transition-all duration-300 ${getVariantClass(toast.variant)} ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
      onClick={() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(toast.id), 300);
      }}
      style={{ cursor: 'pointer' }}
    >
      {toast.title && (
        <div className="font-medium text-sm mb-1">{toast.title}</div>
      )}
      {toast.description && (
        <div className="text-xs opacity-90">{toast.description}</div>
      )}
    </div>
  );
};

export const ToastContainer = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-40 space-y-2 max-w-sm">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ 
            transform: `translateY(${index * -90}px)`,
            zIndex: 40 - index
          }}
        >
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};
