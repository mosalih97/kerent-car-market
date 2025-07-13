import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useAdminUpdateUserType = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ targetUserId, userType }: { targetUserId: string, userType: 'free' | 'premium' }) => {
      if (!user) throw new Error('يجب تسجيل الدخول');

      const { data, error } = await supabase.rpc('admin_update_user_type', {
        _admin_id: user.id,
        _target_user_id: targetUserId,
        _user_type: userType
      });

      if (error) throw error;
      if (!data) throw new Error('فشل في تحديث نوع المستخدم');
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('تم تحديث نوع المستخدم بنجاح');
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    }
  });
};

export const useAdminToggleAdStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ adId, isActive }: { adId: string, isActive: boolean }) => {
      if (!user) throw new Error('يجب تسجيل الدخول');

      const { data, error } = await supabase.rpc('admin_toggle_ad_status', {
        _admin_id: user.id,
        _ad_id: adId,
        _is_active: isActive
      });

      if (error) throw error;
      if (!data) throw new Error('فشل في تحديث حالة الإعلان');
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminAds'] });
      toast.success('تم تحديث حالة الإعلان بنجاح');
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    }
  });
};

export const useAdminUpdateReportStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string, status: string }) => {
      if (!user) throw new Error('يجب تسجيل الدخول');

      const { data, error } = await supabase.rpc('admin_update_report_status', {
        _admin_id: user.id,
        _report_id: reportId,
        _status: status
      });

      if (error) throw error;
      if (!data) throw new Error('فشل في تحديث حالة البلاغ');
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      toast.success('تم تحديث حالة البلاغ بنجاح');
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    }
  });
};