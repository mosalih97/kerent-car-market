import { useEffect, useState } from 'react';
import { Bell, X, MessageCircle, Car, AlertTriangle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';


interface LiveNotification {
  id: string;
  type: string;
  title: string;
  content: string;
  created_at: string;
  ad_id?: string;
}

const LiveNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    // Listen for new notifications in real-time
    const channel = supabase
      .channel('live-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as LiveNotification;
          
          // Add to live notifications
          setNotifications(prev => [...prev, newNotification]);
          
          // Auto-remove after 5 seconds
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
          }, 5000);
        }
      )
      .subscribe();

    // Also listen for new messages
    const messagesChannel = supabase
      .channel('live-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // Fetch sender info
          const { data: senderData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', newMessage.sender_id)
            .single();
          
          const senderName = senderData?.full_name || 'مستخدم';
          
          const messageNotification: LiveNotification = {
            id: `msg-${newMessage.id}`,
            type: 'message',
            title: `رسالة جديدة من ${senderName}`,
            content: newMessage.content.length > 60 
              ? newMessage.content.substring(0, 60) + '...' 
              : newMessage.content,
            created_at: newMessage.created_at,
            ad_id: newMessage.ad_id
          };
          
          setNotifications(prev => [...prev, messageNotification]);
          
          // Auto-remove after 6 seconds for messages
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== messageNotification.id));
          }, 6000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user?.id]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'ad_status':
        return <Car className="w-5 h-5 text-green-500" />;
      case 'ad_featured':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'report':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'border-l-blue-500 bg-blue-50/90';
      case 'ad_status':
        return 'border-l-green-500 bg-green-50/90';
      case 'ad_featured':
        return 'border-l-yellow-500 bg-yellow-50/90';
      case 'report':
        return 'border-l-red-500 bg-red-50/90';
      default:
        return 'border-l-gray-500 bg-gray-50/90';
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 z-50 space-y-2 max-w-sm" dir="rtl">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="animate-fade-in"
          >
            <Card 
              className={`p-4 border-l-4 shadow-lg backdrop-blur-sm ${getNotificationColor(notification.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-sm leading-tight">
                      {notification.title}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-black/10"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 leading-tight">
                    {notification.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(notification.type)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      الآن
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
    </div>
  );
};

function getTypeLabel(type: string): string {
  switch (type) {
    case 'message':
      return 'رسالة';
    case 'ad_status':
      return 'إعلان';
    case 'ad_featured':
      return 'مميز';
    case 'report':
      return 'بلاغ';
    case 'system':
      return 'نظام';
    default:
      return 'إشعار';
  }
}

export default LiveNotifications;