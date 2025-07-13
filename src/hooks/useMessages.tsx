
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participantName: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
}

export const useMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for now - replace with actual API calls
  useEffect(() => {
    if (user) {
      setMessages([
        {
          id: '1',
          participantName: 'أحمد محمد',
          lastMessage: 'مرحباً، أريد الاستفسار عن السيارة',
          updatedAt: new Date().toISOString(),
          unreadCount: 1
        },
        {
          id: '2',
          participantName: 'فاطمة علي',
          lastMessage: 'هل السيارة ما زالت متاحة؟',
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          unreadCount: 0
        }
      ]);
    }
  }, [user]);

  const sendMessage = async (messageData: { content: string; conversationId: string }) => {
    setIsLoading(true);
    try {
      // Mock implementation - replace with actual API call
      console.log('Sending message:', messageData);
      // Add message to local state for demo
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      setMessages(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return {
    messages,
    sendMessage,
    markAsRead,
    isLoading
  };
};
