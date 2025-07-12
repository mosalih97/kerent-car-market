
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SearchFilters {
  city: string;
  brand: string;
  condition: string;
  minPrice: string;
  maxPrice: string;
}

interface Ad {
  id: string;
  title: string;
  description: string | null;
  price: number;
  brand: string;
  model: string;
  year: number;
  mileage: number | null;
  condition: string;
  city: string;
  phone: string;
  images: string[] | null;
  is_featured: boolean;
  is_premium: boolean;
  views_count: number;
  created_at: string;
  profiles: {
    full_name: string;
    is_premium: boolean;
  };
}

export const useSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Ad[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const searchAds = async (filters: SearchFilters) => {
    setIsSearching(true);
    setHasSearched(true);

    try {
      let query = supabase
        .from('ads')
        .select(`
          *,
          profiles!inner(*)
        `)
        .eq('is_active', true);

      if (filters.city) {
        query = query.eq('city', filters.city);
      }
      
      if (filters.brand) {
        query = query.ilike('brand', `%${filters.brand}%`);
      }
      
      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }
      
      if (filters.minPrice) {
        const minPrice = parseInt(filters.minPrice);
        if (!isNaN(minPrice)) {
          query = query.gte('price', minPrice);
        }
      }
      
      if (filters.maxPrice) {
        const maxPrice = parseInt(filters.maxPrice);
        if (!isNaN(maxPrice)) {
          query = query.lte('price', maxPrice);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        return;
      }

      setSearchResults(data as Ad[]);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setHasSearched(false);
  };

  return {
    searchAds,
    clearSearch,
    isSearching,
    searchResults,
    hasSearched
  };
};
