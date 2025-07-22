import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useSavedAds = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get saved ads for current user
  const { data: savedAds, isLoading } = useQuery({
    queryKey: ['savedAds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching saved ads for user:', user.id);
      
      const { data, error } = await supabase
        .from('saved_ads')
        .select(`
          id,
          created_at,
          ad_id
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved ads:', error);
        return [];
      }

      console.log('Saved ads data:', data);

      if (!data || data.length === 0) {
        console.log('No saved ads found');
        return [];
      }

      // Get the ads details separately
      const adIds = data.map(item => item.ad_id);
      console.log('Fetching ads details for IDs:', adIds);
      
      const { data: adsData, error: adsError } = await supabase
        .from('ads')
        .select(`
          id,
          title,
          brand,
          price,
          city,
          images,
          created_at,
          condition,
          year,
          mileage,
          views_count
        `)
        .in('id', adIds);

      if (adsError) {
        console.error('Error fetching ads details:', adsError);
        return [];
      }

      console.log('Ads details data:', adsData);

      // Combine saved ads with ads details
      const result = data.map(savedAd => {
        const adDetails = adsData?.find(ad => ad.id === savedAd.ad_id);
        return {
          ...adDetails,
          saved_at: savedAd.created_at
        };
      }).filter(Boolean);
      
      console.log('Final combined result:', result);
      return result;
    },
    enabled: !!user?.id,
  });

  // Check if ad is saved
  const { data: isSaved = false } = useQuery({
    queryKey: ['isSaved', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data } = await supabase
        .from('saved_ads')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      return !!data;
    },
    enabled: !!user?.id,
  });

  // Save ad mutation
  const saveAdMutation = useMutation({
    mutationFn: async (adId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('saved_ads')
        .insert({
          user_id: user.id,
          ad_id: adId
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedAds'] });
      queryClient.invalidateQueries({ queryKey: ['isSaved'] });
      toast({
        title: "تم حفظ الإعلان",
        description: "تم إضافة الإعلان إلى قائمة المحفوظات",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحفظ",
        description: "لا يمكن حفظ الإعلان. حاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  // Unsave ad mutation
  const unsaveAdMutation = useMutation({
    mutationFn: async (adId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('saved_ads')
        .delete()
        .eq('user_id', user.id)
        .eq('ad_id', adId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedAds'] });
      queryClient.invalidateQueries({ queryKey: ['isSaved'] });
      toast({
        title: "تم إلغاء الحفظ",
        description: "تم إزالة الإعلان من قائمة المحفوظات",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الإزالة",
        description: "لا يمكن إزالة الإعلان. حاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const saveAd = (adId: string) => saveAdMutation.mutate(adId);
  const unsaveAd = (adId: string) => unsaveAdMutation.mutate(adId);

  return {
    savedAds,
    isLoading,
    isSaved,
    saveAd,
    unsaveAd,
    isSaving: saveAdMutation.isPending,
    isUnsaving: unsaveAdMutation.isPending,
  };
};

export const useAdSaveStatus = (adId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['adSaveStatus', adId, user?.id],
    queryFn: async () => {
      if (!user?.id || !adId) return false;
      
      const { data } = await supabase
        .from('saved_ads')
        .select('id')
        .eq('user_id', user.id)
        .eq('ad_id', adId)
        .maybeSingle();

      return !!data;
    },
    enabled: !!user?.id && !!adId,
  });
};