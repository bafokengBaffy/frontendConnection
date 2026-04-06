/* eslint-disable prettier/prettier */
import { createContext, useState, useContext, useCallback, useEffect } from 'react';
import {
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaMoneyBillWave,
  FaUsers,
  FaCalendarAlt,
} from 'react-icons/fa';

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

  useEffect(() => {
    const savedNotifications = localStorage.getItem('careerconnect_notifications');
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }

    if (!savedNotifications) {
      const sampleNotifications = [
        {
          id: '1',
          type: 'success',
          title: 'Welcome to CareerConnect!',
          message: 'Your account has been successfully created.',
          time: 'Just now',
          read: false,
          icon: <FaCheckCircle />,
          link: '/welcome',
        },
        {
          id: '2',
          type: 'info',
          title: 'New Mentorship Opportunity',
          message: 'Connect with experienced entrepreneurs in your field.',
          time: '2 hours ago',
          read: false,
          icon: <FaUsers />,
          link: '/mentorship',
        },
        {
          id: '3',
          type: 'warning',
          title: 'Funding Deadline Approaching',
          message: 'Apply for youth entrepreneurship grant before Friday.',
          time: '1 day ago',
          read: true,
          icon: <FaMoneyBillWave />,
          link: '/funding',
        },
      ];

      setNotifications(sampleNotifications);
      localStorage.setItem('careerconnect_notifications', JSON.stringify(sampleNotifications));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('careerconnect_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const addNotification = useCallback(
    (notification) => {
      const id = Date.now().toString();
      const icons = {
        success: <FaCheckCircle />,
        warning: <FaExclamationTriangle />,
        info: <FaInfoCircle />,
        funding: <FaMoneyBillWave />,
        mentorship: <FaUsers />,
        deadline: <FaCalendarAlt />,
        default: <FaBell />,
      };

      const newNotification = {
        id,
        type: notification.type || 'info',
        title: notification.title,
        message: notification.message,
        time: 'Just now',
        read: false,
        icon: icons[notification.type] || icons.default,
        link: notification.link,
        duration: notification.duration || 5000,
        priority: notification.priority || 'normal',
        ...notification,
      };

      setNotifications((prev) => [newNotification, ...prev]);

      if (newNotification.duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);
      }

      if (notification.playSound !== false) {
        try {
          const audio = new Audio('/notification.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch (error) {
          console.log('Notification sound error:', error);
        }
      }

      return id;
    },
    [removeNotification]
  );

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('careerconnect_notifications');
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter((notification) => !notification.read).length;
  }, [notifications]);

  const getNotificationsByType = useCallback(
    (type) => {
      return notifications.filter((notification) => notification.type === type);
    },
    [notifications]
  );

  const addSuccessNotification = useCallback(
    (title, message, options = {}) =>
      addNotification({
        type: 'success',
        title,
        message,
        ...options,
      }),
    [addNotification]
  );

  const addErrorNotification = useCallback(
    (title, message, options = {}) =>
      addNotification({
        type: 'danger',
        title,
        message,
        ...options,
      }),
    [addNotification]
  );

  const addWarningNotification = useCallback(
    (title, message, options = {}) =>
      addNotification({
        type: 'warning',
        title,
        message,
        ...options,
      }),
    [addNotification]
  );

  const value = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    getUnreadCount,
    getNotificationsByType,
    addSuccessNotification,
    addErrorNotification,
    addWarningNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export default NotificationContext;
