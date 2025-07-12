
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useIsAdmin = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase.rpc('is_admin', {
        _user_id: user.id
      });
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return data || false;
    },
    enabled: !!user,
  });
};

export const useAdminStats = () => {
  const { data: isAdmin } = useIsAdmin();
  
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      // إحصائيات المستخدمين
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // إحصائيات الإعلانات
      const { count: totalAds } = await supabase
        .from('ads')
        .select('*', { count: 'exact', head: true });

      const { count: activeAds } = await supabase
        .from('ads')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // إحصائيات التقارير
      const { count: pendingReports } = await supabase
        .from('ad_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: totalReports } = await supabase
        .from('ad_reports')
        .select('*', { count: 'exact', head: true });

      return {
        totalUsers: totalUsers || 0,
        totalAds: totalAds || 0,
        activeAds: activeAds || 0,
        pendingReports: pendingReports || 0,
        totalReports: totalReports || 0,
      };
    },
    enabled: !!isAdmin,
  });
};

export const useAdminUsers = () => {
  const { data: isAdmin } = useIsAdmin();
  
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!isAdmin,
  });
};

export const useAdminAds = () => {
  const { data: isAdmin } = useIsAdmin();
  
  return useQuery({
    queryKey: ['adminAds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          profiles!inner(full_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!isAdmin,
  });
};

export const useAdminReports = () => {
  const { data: isAdmin } = useIsAdmin();
  
  return useQuery({
    queryKey: ['adminReports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_reports')
        .select(`
          *,
          ads!inner(title, id),
          profiles!inner(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!isAdmin,
  });
};

export const useUpdateAdStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ adId, status }: { adId: string; status: string }) => {
      const { error } = await supabase
        .from('ads')
        .update({ status, is_active: status === 'active' })
        .eq('id', adId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAds'] });
      toast.success('تم تحديث حالة الإعلان بنجاح');
    },
    onError: (error) => {
      console.error('Error updating ad status:', error);
      toast.error('فشل في تحديث حالة الإعلان');
    },
  });
};

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: string }) => {
      const { error } = await supabase
        .from('ad_reports')
        .update({ 
          status, 
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      toast.success('تم تحديث حالة التقرير بنجاح');
    },
    onError: (error) => {
      console.error('Error updating report status:', error);
      toast.error('فشل في تحديث حالة التقرير');
    },
  });
};
