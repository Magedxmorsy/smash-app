import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import Toast from '../components/ui/Toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    variant: 'success', // 'success' | 'error'
  });

  const queueRef = useRef([]);
  const timeoutRef = useRef(null);
  const isProcessingRef = useRef(false);

  const processQueue = useCallback(() => {
    if (isProcessingRef.current || queueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    const nextToast = queueRef.current.shift();

    // Trigger haptic feedback for queued toasts
    if (nextToast.variant === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setToast({
      visible: true,
      message: nextToast.message,
      variant: nextToast.variant,
    });

    // Auto-dismiss after 3 seconds
    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, 3000);
  }, []);

  const showToast = useCallback((message, variant = 'success') => {
    // Trigger haptic feedback
    if (variant === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // If toast is already visible, queue the new one
    if (toast.visible) {
      queueRef.current.push({ message, variant });
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast({
      visible: true,
      message,
      variant,
    });

    // Auto-dismiss after 3 seconds
    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, 3000);
  }, [toast.visible]);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));

    // After animation completes (200ms), check queue
    setTimeout(() => {
      isProcessingRef.current = false;
      if (queueRef.current.length > 0) {
        processQueue();
      }
    }, 200);
  }, [processQueue]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      queueRef.current = [];
    };
  }, []);

  const value = {
    showToast,
    hideToast,
    toast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        variant={toast.variant}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
