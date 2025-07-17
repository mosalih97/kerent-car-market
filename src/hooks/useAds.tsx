
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';

type Ad = Database['public']['Tables']['ads']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
};

type AdInsert = Database['public']['Tables']['ads']['Insert'];

export const useAds = () => {
  const queryClient = useQueryClient();

  // إعداد التحديث في الوقت الحقيقي
  useEffect(() => {
    const channel = supabase
      .channel('ads-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ads'
        },
        (payload) => {
          console.log('Real-time ads update:', payload);
          // تحديث البيانات في الكاش
          queryClient.setQueryData(['ads'], (oldData: Ad[] | undefined) => {
            if (!oldData) return oldData;
            
            return oldData.map(ad => 
              ad.id === payload.new.id 
                ? { ...ad, views_count: payload.new.views_count }
                : ad
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          profiles!inner(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Ad[];
    },
  });
};

export const useMyAds = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['myAds', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCreateAd = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (adData: {
      title: string;
      description: string;
      price: number;
      brand: string;
      model: string;
      year: number;
      mileage?: number;
      condition: 'new' | 'used' | 'excellent' | 'good' | 'fair';
      city: string;
      phone: string;
      images?: string[];
    }) => {
      if (!user) throw new Error('يجب تسجيل الدخول لإنشاء إعلان');

      // فحص حدود الإعلانات قبل الإنشاء
      const { data: canCreateAd, error: limitError } = await supabase.rpc('check_ad_limit', {
        _user_id: user.id
      });

      if (limitError) throw limitError;
      if (!canCreateAd) {
        throw new Error('لقد وصلت للحد الأقصى من الإعلانات المسموحة هذا الشهر (5 إعلانات). يمكنك ترقية حسابك للحصول على إعلانات غير محدودة.');
      }

      const adInsert: AdInsert = {
        user_id: user.id,
        title: adData.title,
        description: adData.description,
        price: adData.price,
        brand: adData.brand,
        model: adData.model,
        year: adData.year,
        mileage: adData.mileage,
        condition: adData.condition as Database['public']['Enums']['car_condition'],
        city: adData.city,
        phone: adData.phone,
        images: adData.images || [],
      };

      const { data, error } = await supabase
        .from('ads')
        .insert(adInsert)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['myAds'] });
      queryClient.invalidateQueries({ queryKey: ['adLimits'] });
      queryClient.invalidateQueries({ queryKey: ['checkAdLimit'] });
    },
  });
};

export const useDeleteAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adId: string) => {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['myAds'] });
    },
  });
};
