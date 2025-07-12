
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useCredits = () => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCredits();
    } else {
      setCredits(0);
      setLoading(false);
    }
  }, [user]);

  const fetchCredits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching credits:', error);
      } else {
        console.log('Credits fetched:', data.credits);
        setCredits(data.credits || 0);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const deductCredit = async (): Promise<boolean> => {
    if (!user || credits < 1) {
      console.error('Cannot deduct credit: user not found or insufficient credits');
      return false;
    }

    try {
      console.log('Attempting to deduct credit for user:', user.id);
      console.log('Current credits before deduction:', credits);
      
      const { data, error } = await supabase.functions.invoke('deduct-credit', {
        body: { user_id: user.id }
      });

      if (error) {
        console.error('Supabase function error:', error);
        return false;
      }

      console.log('Credit deduction response:', data);
      
      if (data && data.success && typeof data.new_credits === 'number') {
        console.log('Credit deducted successfully, new balance:', data.new_credits);
        setCredits(data.new_credits);
        return true;
      } else {
        console.error('Credit deduction failed. Response data:', data);
        return false;
      }
    } catch (error) {
      console.error('Error deducting credit:', error);
      return false;
    }
  };

  return {
    credits,
    loading,
    deductCredit,
    refreshCredits: fetchCredits
  };
};
