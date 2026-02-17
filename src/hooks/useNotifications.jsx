import { useState, useCallback } from 'react';

export const useNotifications = () => {
  const [toasts, setToasts] = useState([]);

  const showNotification = useCallback(({ type = 'info', title, message, duration = 3000 }) => {
    const id = Date.now();
    const newToast = {
      id,
      type,
      title,
      message,
      show: true,
      duration
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return { toasts, showNotification, removeToast };
};

export default useNotifications;