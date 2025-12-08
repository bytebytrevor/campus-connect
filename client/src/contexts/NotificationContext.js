import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { userProfile } = useAuth();

  const addNotification = useCallback((message, type = 'info', duration = 5000, action = null) => {
    // Check if notifications are enabled (default to true if not set)
    if (userProfile && userProfile.notificationsEnabled === false) {
      return null; // Don't show notification
    }
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration,
      action, // { label: string, onClick: function }
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, [userProfile]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};