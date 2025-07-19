import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendNotificationParams {
  userId: string;
  type: string;
  title: string;
  content: string;
  adId?: string;
}

export const useNotificationSender = () => {
  const { toast } = useToast();

  const sendNotificationMutation = useMutation({
    mutationFn: async ({ userId, type, title, content, adId }: SendNotificationParams) => {
      const { data, error } = await supabase.rpc('create_notification', {
        _user_id: userId,
        _type: type,
        _title: title,
        _content: content,
        _ad_id: adId || null
      });

      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error('Failed to send notification:', error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال الإشعار",
        variant: "destructive",
      });
    }
  });

  // Helper functions for common notification types
  const sendMessageNotification = (receiverId: string, senderName: string, messageContent: string) => {
    return sendNotificationMutation.mutateAsync({
      userId: receiverId,
      type: 'message',
      title: `رسالة جديدة من ${senderName}`,
      content: messageContent.length > 100 ? messageContent.substring(0, 100) + '...' : messageContent,
    });
  };

  const sendAdStatusNotification = (userId: string, adTitle: string, status: string, adId?: string) => {
    const statusText = {
      'approved': 'تم قبول',
      'rejected': 'تم رفض',
      'featured': 'تم تمييز',
      'expired': 'انتهت صلاحية'
    }[status] || 'تم تحديث';

    return sendNotificationMutation.mutateAsync({
      userId,
      type: 'ad_status',
      title: `${statusText} إعلانك`,
      content: `${statusText} إعلان "${adTitle}"`,
      adId,
    });
  };

  const sendWelcomeNotification = (userId: string, userName: string) => {
    return sendNotificationMutation.mutateAsync({
      userId,
      type: 'system',
      title: `مرحباً ${userName}!`,
      content: 'مرحباً بك في منصة الكرين. يمكنك الآن إضافة إعلاناتك وتصفح السيارات المتاحة.',
    });
  };

  const sendPremiumNotification = (userId: string, type: 'activated' | 'expired') => {
    const title = type === 'activated' ? 'تم تفعيل الاشتراك المميز' : 'انتهى الاشتراك المميز';
    const content = type === 'activated' 
      ? 'تم تفعيل اشتراكك المميز بنجاح. استمتع بالمزايا الحصرية!'
      : 'انتهت صلاحية اشتراكك المميز. قم بتجديده للاستمرار في الاستفادة من المزايا الحصرية.';

    return sendNotificationMutation.mutateAsync({
      userId,
      type: 'system',
      title,
      content,
    });
  };

  return {
    sendNotification: sendNotificationMutation.mutateAsync,
    sendMessageNotification,
    sendAdStatusNotification,
    sendWelcomeNotification,
    sendPremiumNotification,
    isSending: sendNotificationMutation.isPending,
  };
};