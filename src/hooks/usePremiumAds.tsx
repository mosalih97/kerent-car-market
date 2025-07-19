import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface PremiumAd {
  ad_id: string;
  title: string;
  brand: string;
  price: number;
  city: string;
  images: string[];
  priority_score: number;
  fairness_score: number;
}

export const usePremiumAds = (placement: string, limit: number = 5) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['premiumAds', placement, user?.id, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_fair_premium_ads', {
        _user_id: user?.id || null,
        _placement_type: placement,
        _limit: limit
      });

      if (error) throw error;
      return data as PremiumAd[];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useRecordImpression = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      adId: string;
      placement: string;
      sessionId?: string;
    }) => {
      const { adId, placement, sessionId } = params;
      
      // تسجيل الإحصائية
      const { error } = await supabase.rpc('record_premium_ad_impression', {
        _ad_id: adId,
        _user_id: user?.id || null,
        _placement_type: placement,
        _user_ip: null, // يمكن إضافة الـ IP لاحقاً
        _user_agent: navigator.userAgent,
        _session_id: sessionId || null
      });

      if (error) throw error;
      return true;
    },
    onSuccess: (_, variables) => {
      // تحديث البيانات المحلية
      queryClient.invalidateQueries({ 
        queryKey: ['premiumAds', variables.placement] 
      });
    }
  });
};

export const useUpdateUserBehavior = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      searchFilters?: any;
      viewedAdBrand?: string;
      viewedAdPrice?: number;
      viewedAdCity?: string;
      viewedAdCondition?: string;
      isPremiumAd?: boolean;
      isFeaturedAd?: boolean;
    }) => {
      if (!user) return false;

      const { error } = await supabase.rpc('update_user_behavior', {
        _user_id: user.id,
        _search_filters: params.searchFilters || null,
        _viewed_ad_brand: params.viewedAdBrand || null,
        _viewed_ad_price: params.viewedAdPrice || null,
        _viewed_ad_city: params.viewedAdCity || null,
        _viewed_ad_condition: params.viewedAdCondition || null,
        _is_premium_ad: params.isPremiumAd || false,
        _is_featured_ad: params.isFeaturedAd || false
      });

      if (error) throw error;
      return true;
    }
  });
};

// Hook لجلب تفضيلات المستخدم
export const useUserBehavior = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userBehavior', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_behavior')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

// Hook لجلب إحصائيات الإعلانات المميزة للمعلن
export const useAdDistributionStats = (adId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['adDistribution', adId, user?.id],
    queryFn: async () => {
      if (!adId || !user) return null;

      const { data, error } = await supabase
        .from('premium_ad_distribution')
        .select('*')
        .eq('ad_id', adId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!adId && !!user,
  });
};