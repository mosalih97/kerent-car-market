import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserBehaviorData {
  searchFilters?: any;
  viewedAdBrand?: string;
  viewedAdPrice?: number;
  viewedAdCity?: string;
  viewedAdCondition?: string;
  isPremiumAd?: boolean;
  isFeaturedAd?: boolean;
}

export const useUserBehavior = () => {
  const { user } = useAuth();

  const trackUserBehavior = async (data: UserBehaviorData) => {
    if (!user) return;
    // Using cookies for now - will implement database tracking later
    console.log('Tracking user behavior:', data);
  };

  // Cookie management
  const setCookie = (name: string, value: string, days: number = 30) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  };

  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const trackAdView = (ad: any) => {
    // Track in database
    trackUserBehavior({
      viewedAdBrand: ad.brand,
      viewedAdPrice: ad.price,
      viewedAdCity: ad.city,
      viewedAdCondition: ad.condition,
      isPremiumAd: ad.is_premium,
      isFeaturedAd: ad.is_featured
    });

    // Track in cookies for session-based recommendations
    const viewHistory = getCookie('viewHistory');
    const history = viewHistory ? JSON.parse(viewHistory) : [];
    
    // Add current view to history (keep last 10)
    history.unshift({
      brand: ad.brand,
      city: ad.city,
      price: ad.price,
      condition: ad.condition,
      timestamp: Date.now()
    });
    
    const limitedHistory = history.slice(0, 10);
    setCookie('viewHistory', JSON.stringify(limitedHistory));

    // Track preferences
    const preferences = getCookie('userPreferences');
    const prefs = preferences ? JSON.parse(preferences) : { brands: {}, cities: {}, priceRanges: {} };
    
    // Update brand preference count
    prefs.brands[ad.brand] = (prefs.brands[ad.brand] || 0) + 1;
    prefs.cities[ad.city] = (prefs.cities[ad.city] || 0) + 1;
    
    // Update price range preference
    const priceRange = ad.price < 10000000 ? 'low' : ad.price < 50000000 ? 'medium' : 'high';
    prefs.priceRanges[priceRange] = (prefs.priceRanges[priceRange] || 0) + 1;
    
    setCookie('userPreferences', JSON.stringify(prefs));
  };

  const trackSearch = (searchFilters: any) => {
    trackUserBehavior({ searchFilters });
    
    // Store search history in cookies
    const searchHistory = getCookie('searchHistory');
    const history = searchHistory ? JSON.parse(searchHistory) : [];
    
    history.unshift({
      ...searchFilters,
      timestamp: Date.now()
    });
    
    const limitedHistory = history.slice(0, 5);
    setCookie('searchHistory', JSON.stringify(limitedHistory));
  };

  const getUserPreferences = () => {
    const preferences = getCookie('userPreferences');
    const searchHistory = getCookie('searchHistory');
    const viewHistory = getCookie('viewHistory');
    
    return {
      preferences: preferences ? JSON.parse(preferences) : null,
      searchHistory: searchHistory ? JSON.parse(searchHistory) : [],
      viewHistory: viewHistory ? JSON.parse(viewHistory) : []
    };
  };

  return {
    trackAdView,
    trackSearch,
    trackUserBehavior,
    getUserPreferences,
    setCookie,
    getCookie
  };
};
