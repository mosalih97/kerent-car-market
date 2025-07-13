
import { useState, useEffect } from 'react';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationSystem = () => {
  const { user } = useAuth();
  const { notifications, markAsRead, markAllAsRead, deleteNotification, isLoading } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    if (diffMinutes < 1440) return `منذ ${Math.ceil(diffMinutes / 60)} ساعة`;
    return `منذ ${Math.ceil(diffMinutes / 1440)} يوم`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Card className="w-full max-w-md">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h3 className="font-semibold">الإشعارات</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={markAllAsRead}
            className="text-xs"
          >
            قراءة الكل
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-96">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm">جاري التحميل...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.message}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {formatTime(notification.createdAt)}
                      </span>
                      <div className="flex gap-1">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 px-2 text-xs"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-6 px-2 text-xs text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default NotificationSystem;
