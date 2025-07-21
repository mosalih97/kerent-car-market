import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/integrations/supabase/types';

type Ad = Database['public']['Tables']['ads']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'];
};

interface SuggestedAdsOptions {
  currentAdId?: string;
  brand?: string;
  city?: string;
  limit?: number;
}

export const useSuggestedAds = ({ currentAdId, brand, city, limit = 6 }: SuggestedAdsOptions) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['suggestedAds', currentAdId, brand, city, limit, user?.id],
    queryFn: async () => {
      console.log('Fetching suggested ads with options:', { currentAdId, brand, city, limit });
      
      let query = supabase
        .from('ads')
        .select(`
          *,
          profiles(*)
        `)
        .eq('is_active', true);

      // عرض الإعلانات المميزة فقط (is_premium أو من مستخدمين مميزين)
      query = query.or('is_premium.eq.true,profiles.is_premium.eq.true,is_featured.eq.true');

      // استبعاد الإعلان الحالي
      if (currentAdId) {
        query = query.neq('id', currentAdId);
      }

      // إعطاء أولوية للإعلانات المطابقة للعلامة التجارية والمدينة
      let primaryQuery = query;

      if (brand || city) {
        if (brand) {
          primaryQuery = primaryQuery.eq('brand', brand);
        }
        if (city) {
          primaryQuery = primaryQuery.eq('city', city);
        }
      }

      // ترتيب حسب الأولوية: مميز > مروّج، ثم حسب التاريخ
      const orderQuery = primaryQuery
        .order('is_premium', { ascending: false })
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      const { data, error } = await orderQuery;

      if (error) {
        console.error('Error fetching suggested ads:', error);
        throw error;
      }

      console.log('Premium suggested ads fetched:', data?.length);

      // إذا لم نحصل على عدد كافي من النتائج ولدينا فلاتر، جرب بدون فلاتر لكن مع الحفاظ على شرط المميز
      if (data && data.length < limit && (brand || city)) {
        const { data: fallbackData, error: fallbackError } = await query
          .order('is_premium', { ascending: false })
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(limit - data.length);

        if (!fallbackError && fallbackData) {
          // دمج النتائج وإزالة التكرارات
          const allIds = data.map(ad => ad.id);
          const newAds = fallbackData.filter(ad => !allIds.includes(ad.id));
          return [...data, ...newAds];
        }
      }

      return data as Ad[] || [];
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};