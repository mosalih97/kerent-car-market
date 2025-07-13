
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface Notification {
  id: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  isRead: boolean;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for now - replace with actual API calls
  useEffect(() => {
    if (user) {
      setNotifications([
        {
          id: '1',
          title: 'تم نشر إعلانك بنجاح',
          message: 'إعلان "تويوتا كامري 2020" تم نشره وهو متاح للعرض الآن',
          type: 'success',
          createdAt: new Date().toISOString(),
          isRead: false
        },
        {
          id: '2',
          title: 'رسالة جديدة',
          message: 'لديك رسالة جديدة من مشتري محتمل',
          type: 'info',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          isRead: false
        },
        {
          id: '3',
          title: 'تذكير: تجديد الإعلان',
          message: 'إعلانك سينتهي خلال 3 أيام',
          type: 'warning',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          isRead: true
        }
      ]);
    }
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading
  };
};
