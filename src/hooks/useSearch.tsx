
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { useAuth } from './useAuth';

type Ad = Database['public']['Tables']['ads']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'];
};

type CarCondition = Database['public']['Enums']['car_condition'];

interface SearchFilters {
  city: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  condition: string;
}

export const useSearch = () => {
  const { user } = useAuth();
  const [hasSearched, setHasSearched] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    city: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    condition: ''
  });

  const searchQuery = useQuery({
    queryKey: ['searchAds', searchFilters],
    queryFn: async () => {
      console.log('Searching with filters:', searchFilters);
      
      let query = supabase
        .from('ads')
        .select(`
          *,
          profiles(*)
        `)
        .eq('is_active', true);

      if (searchFilters.city) {
        query = query.eq('city', searchFilters.city);
      }
      
      if (searchFilters.brand) {
        query = query.ilike('brand', `%${searchFilters.brand}%`);
      }
      
      if (searchFilters.condition) {
        // Type assertion to ensure the condition matches the enum
        query = query.eq('condition', searchFilters.condition as CarCondition);
      }
      
      if (searchFilters.minPrice) {
        const minPrice = parseInt(searchFilters.minPrice);
        if (!isNaN(minPrice)) {
          query = query.gte('price', minPrice);
        }
      }
      
      if (searchFilters.maxPrice) {
        const maxPrice = parseInt(searchFilters.maxPrice);
        if (!isNaN(maxPrice)) {
          query = query.lte('price', maxPrice);
        }
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      console.log('Search results:', data);
      
      // تحديث سلوك المستخدم مع فلاتر البحث
      if (user) {
        try {
          await supabase.rpc('update_user_behavior', {
            _user_id: user.id,
            _search_filters: JSON.parse(JSON.stringify(searchFilters))
          });
        } catch (behaviorError) {
          console.error('Error updating user behavior:', behaviorError);
        }
      }
      
      return data as Ad[];
    },
    enabled: false // Only run when explicitly called
  });

  const searchAds = (filters: SearchFilters) => {
    console.log('Starting search with filters:', filters);
    setSearchFilters(filters);
    setHasSearched(true);
    searchQuery.refetch();
  };

  const clearSearch = () => {
    console.log('Clearing search');
    setHasSearched(false);
    setSearchFilters({
      city: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      condition: ''
    });
  };

  return {
    searchAds,
    clearSearch,
    isSearching: searchQuery.isLoading,
    searchResults: searchQuery.data || [],
    hasSearched,
    searchError: searchQuery.error
  };
};
