
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type Ad = Tables<'ads'>;
export type AdInsert = TablesInsert<'ads'>;

export const useAds = () => {
  return useQuery({
    queryKey: ['ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          profiles:user_id (
            full_name,
            is_premium,
            is_featured
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ads:', error);
        throw error;
      }

      return data;
    }
  });
};

export const useCreateAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adData: Omit<AdInsert, 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      const { data, error } = await supabase
        .from('ads')
        .insert([{ ...adData, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error creating ad:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      toast.success('تم إنشاء الإعلان بنجاح');
    },
    onError: (error: any) => {
      console.error('Create ad error:', error);
      toast.error(error.message || 'حدث خطأ في إنشاء الإعلان');
    }
  });
};

export const useSearchAds = (filters: {
  city?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
}) => {
  return useQuery({
    queryKey: ['ads', 'search', filters],
    queryFn: async () => {
      let query = supabase
        .from('ads')
        .select(`
          *,
          profiles:user_id (
            full_name,
            is_premium,
            is_featured
          )
        `)
        .eq('is_active', true);

      if (filters.city) {
        query = query.eq('city', filters.city);
      }

      if (filters.brand) {
        query = query.eq('brand', filters.brand);
      }

      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching ads:', error);
        throw error;
      }

      return data;
    },
    enabled: Object.values(filters).some(value => value !== undefined && value !== '')
  });
};
