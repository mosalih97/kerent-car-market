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

      // استبعاد الإعلان الحالي
      if (currentAdId) {
        query = query.neq('id', currentAdId);
      }

      // البحث عن الإعلانات المميزة والمروجة
      const { data: premiumAds, error: premiumError } = await query
        .eq('is_premium', true)
        .order('created_at', { ascending: false })
        .limit(Math.ceil(limit / 2));

      if (premiumError) {
        console.error('Error fetching premium ads:', premiumError);
      }

      const { data: featuredAds, error: featuredError } = await query
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(Math.ceil(limit / 2));

      if (featuredError) {
        console.error('Error fetching featured ads:', featuredError);
      }

      // البحث عن إعلانات من مستخدمين مميزين
      const { data: premiumUserAds, error: premiumUserError } = await supabase
        .from('ads')
        .select(`
          *,
          profiles!inner(*)
        `)
        .eq('is_active', true)
        .eq('profiles.is_premium', true)
        .neq('id', currentAdId || '')
        .order('created_at', { ascending: false })
        .limit(Math.ceil(limit / 2));

      if (premiumUserError) {
        console.error('Error fetching premium user ads:', premiumUserError);
      }

      // دمج جميع النتائج وإزالة التكرارات
      const allAds = [
        ...(premiumAds || []),
        ...(featuredAds || []),
        ...(premiumUserAds || [])
      ];

      // إزالة التكرارات
      const uniqueAds = allAds.filter((ad, index, self) => 
        index === self.findIndex(a => a.id === ad.id)
      );

      // فلترة حسب الماركة والمدينة إذا توفرت
      let filteredAds = uniqueAds;
      
      if (brand || city) {
        const matchingAds = uniqueAds.filter(ad => 
          (!brand || ad.brand === brand) && 
          (!city || ad.city === city)
        );
        
        if (matchingAds.length >= limit) {
          filteredAds = matchingAds;
        } else {
          // إضافة المزيد من الإعلانات بدون فلاتر إذا لم تكن كافية
          filteredAds = [
            ...matchingAds,
            ...uniqueAds.filter(ad => 
              !matchingAds.some(ma => ma.id === ad.id)
            ).slice(0, limit - matchingAds.length)
          ];
        }
      }

      // ترتيب النتائج حسب الأولوية
      const sortedAds = filteredAds.sort((a, b) => {
        // أولوية للإعلانات المميزة
        if (a.is_premium && !b.is_premium) return -1;
        if (!a.is_premium && b.is_premium) return 1;
        
        // ثم الإعلانات المروجة
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        
        // ثم إعلانات المستخدمين المميزين
        if (a.profiles?.is_premium && !b.profiles?.is_premium) return -1;
        if (!a.profiles?.is_premium && b.profiles?.is_premium) return 1;
        
        // أخيراً حسب التاريخ
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      const finalAds = sortedAds.slice(0, limit);
      console.log('Suggested ads fetched successfully:', finalAds.length);
      
      return finalAds as Ad[] || [];
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};