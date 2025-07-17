
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useEffect } from 'react';

export const useCredits = () => {
  const { user } = useAuth();
  const { isPremium } = useProfile();
  const queryClient = useQueryClient();

  const { data: credits = 0, isLoading: loading } = useQuery({
    queryKey: ['credits', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching credits:', error);
        return 0;
      }
      
      return data?.credits || 0;
    },
    enabled: !!user?.id,
  });

  // Listen for real-time updates to credits
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('credits-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('Credits updated:', payload);
          queryClient.setQueryData(['credits', user.id], payload.new.credits);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const deductCreditMutation = useMutation({
    mutationFn: async (amount: number = 1) => {
      if (!user?.id) throw new Error('المستخدم غير مسجل');
      
      // المستخدمون المميزون لا يتم خصم كريديت منهم
      if (isPremium) {
        console.log('Premium user - credits frozen, no deduction');
        return { credits: credits }; // إرجاع البيانات الحالية بدون خصم
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ credits: Math.max(0, credits - amount) })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits', user?.id] });
    },
  });

  const refreshCredits = () => {
    queryClient.invalidateQueries({ queryKey: ['credits', user?.id] });
  };

  const deductCredit = (amount: number = 1) => {
    // المستخدمون المميزون لا يحتاجون لخصم الكريديت
    if (isPremium) {
      return Promise.resolve({ credits: credits });
    }
    return deductCreditMutation.mutateAsync(amount);
  };

  return { 
    credits, 
    loading, 
    deductCredit, 
    refreshCredits 
  };
};
