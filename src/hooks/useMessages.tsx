
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useMessages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching messages for user:', user.id);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name),
          receiver:profiles!messages_receiver_id_fkey(id, full_name),
          ad:ads(id, title)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }
      
      console.log('Fetched messages:', data);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['messages-unread', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      
      if (error) {
        console.error('Error fetching unread count:', error);
        throw error;
      }
      
      console.log('Unread messages count:', count);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, content, adId }: { receiverId: string; content: string; adId?: string }) => {
      console.log('Sending message:', { receiverId, content, adId });
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user!.id,
          receiver_id: receiverId,
          content,
          ad_id: adId
        })
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name),
          receiver:profiles!messages_receiver_id_fkey(id, full_name),
          ad:ads(id, title)
        `)
        .single();
      
      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
      
      console.log('Message sent successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messages-unread'] });
      toast({
        title: "تم إرسال الرسالة",
        description: "تم إرسال رسالتك بنجاح",
      });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال الرسالة",
        variant: "destructive",
      });
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      console.log('Marking message as read:', messageId);
      
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);
      
      if (error) {
        console.error('Error marking message as read:', error);
        throw error;
      }
      
      console.log('Message marked as read successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messages-unread'] });
    }
  });

  // Listen for real-time updates
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time listener for messages');

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`
        },
        (payload) => {
          console.log('Real-time message update:', payload);
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['messages-unread'] });
          
          // Show toast for new messages with sender info
          if (payload.eventType === 'INSERT' && payload.new.receiver_id === user.id) {
            const message = payload.new;
            
            // Fetch sender info for notification
            supabase
              .from('profiles')
              .select('full_name')
              .eq('id', message.sender_id)
              .single()
              .then(({ data }) => {
                const senderName = data?.full_name || 'مستخدم';
                toast({
                  title: `رسالة جديدة من ${senderName}`,
                  description: message.content.length > 50 
                    ? message.content.substring(0, 50) + '...' 
                    : message.content,
                  duration: 5000,
                });
              });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time listener');
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient, toast]);

  return {
    messages: messages || [],
    unreadCount: unreadCount || 0,
    isLoading,
    sendMessage: sendMessageMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
    isSending: sendMessageMutation.isPending
  };
};
