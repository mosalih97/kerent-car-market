
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
        setCredits(data.credits);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const deductCredit = async (): Promise<boolean> => {
    if (!user || credits < 1) return false;

    try {
      const { error } = await supabase.functions.invoke('deduct-credit', {
        body: { user_id: user.id }
      });

      if (error) {
        console.error('Error deducting credit:', error);
        return false;
      }

      setCredits(prev => prev - 1);
      return true;
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
