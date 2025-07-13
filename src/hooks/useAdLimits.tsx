import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';

type AdLimits = Database['public']['Tables']['user_ad_limits']['Row'];

export const useAdLimits = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['adLimits', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_ad_limits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      // إذا لم يوجد سجل، إنشاء واحد جديد
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('user_ad_limits')
          .insert({
            user_id: user.id,
            ads_count: 0,
            max_ads: 5,
            last_reset: new Date().toISOString().split('T')[0]
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
        return newData as AdLimits;
      }
      
      return data as AdLimits;
    },
    enabled: !!user,
  });
};

export const useCheckAdLimit = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['checkAdLimit', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase.rpc('check_ad_limit', {
        _user_id: user.id
      });
      
      if (error) throw error;
      return data as boolean;
    },
    enabled: !!user,
  });
};