import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const usePremiumStatus = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['premium-subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('premium_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  // فحص حالة الاشتراك في الوقت الفعلي
  const checkPremiumStatus = async () => {
    if (!user?.id) return false;
    
    const { data, error } = await supabase
      .rpc('check_premium_status', { _user_id: user.id });
    
    if (error) {
      console.error('خطأ في فحص حالة الاشتراك:', error);
      return false;
    }
    
    // تحديث الكاش
    queryClient.invalidateQueries({ queryKey: ['premium-subscription', user.id] });
    queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
    
    return data;
  };

  // الاستماع للتحديثات في الوقت الحقيقي
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('premium-subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'premium_subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['premium-subscription', user.id] });
          queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const isActivePremium = subscription && new Date(subscription.expires_at) > new Date();
  const shouldShowAds = !isActivePremium;

  return {
    subscription,
    isLoading,
    isActivePremium,
    shouldShowAds,
    checkPremiumStatus,
    expiresAt: subscription?.expires_at,
    subscriptionType: subscription?.subscription_type
  };
};