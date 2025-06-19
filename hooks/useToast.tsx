import { useState, useCallback } from 'react';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'warning' | 'error';
}

interface UseToastReturn {
  toast: ToastState;
  showToast: (message: string, type: 'success' | 'warning' | 'error') => void;
  hideToast: () => void;
}

export const useToast = (): UseToastReturn => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToast = useCallback((message: string, type: 'success' | 'warning' | 'error') => {
    setToast({
      visible: true,
      message,
      type,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  return { toast, showToast, hideToast };
};