import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Ad = Database['public']['Tables']['ads']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
};

export const useSuggestedAds = (currentAdId: string, brand?: string, city?: string, limit: number = 6) => {
  return useQuery({
    queryKey: ['suggestedAds', currentAdId, brand, city, limit],
    queryFn: async () => {
      let query = supabase
        .from('ads')
        .select(`
          *,
          profiles!inner(*)
        `)
        .eq('is_active', true)
        .neq('id', currentAdId); // استبعاد الإعلان الحالي

      // أولوية للإعلانات من نفس البراند
      if (brand) {
        const brandQuery = query.eq('brand', brand).limit(Math.ceil(limit / 2));
        const { data: brandAds, error: brandError } = await brandQuery;
        
        if (brandError) throw brandError;
        
        // إذا لم نحصل على عدد كافي من إعلانات البراند، نجلب من نفس المدينة
        if (brandAds && brandAds.length < limit) {
          const remainingLimit = limit - brandAds.length;
          let cityQuery = supabase
            .from('ads')
            .select(`
              *,
              profiles!inner(*)
            `)
            .eq('is_active', true)
            .neq('id', currentAdId)
            .neq('brand', brand); // استبعاد نفس البراند لتجنب التكرار
            
          if (city) {
            cityQuery = cityQuery.eq('city', city);
          }
          
          const { data: cityAds, error: cityError } = await cityQuery.limit(remainingLimit);
          
          if (cityError) throw cityError;
          
          return [...(brandAds || []), ...(cityAds || [])] as Ad[];
        }
        
        return brandAds as Ad[];
      }
      
      // إذا لم يكن هناك براند، ابحث بالمدينة أولاً ثم عشوائياً
      if (city) {
        query = query.eq('city', city);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Ad[];
    },
    enabled: !!currentAdId,
  });
};