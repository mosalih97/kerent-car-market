import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdPlacements = () => {
  return useQuery({
    queryKey: ['ad-placements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_placements')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
};

export const getAdPlacementByName = (placements: any[], name: string) => {
  return placements?.find(placement => placement.name === name);
};