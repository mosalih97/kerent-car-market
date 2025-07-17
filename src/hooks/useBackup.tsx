import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface BackupData {
  ads: any[];
  profile: any;
  messages: any[];
  notifications: any[];
  premium_subscriptions: any[];
  contact_reveals: any[];
  user_ad_limits: any[];
}

export interface ProjectBackup {
  id: string;
  backup_name: string;
  backup_size: number;
  created_at: string;
  updated_at: string;
}

export const useBackup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [backups, setBackups] = useState<ProjectBackup[]>([]);
  const { user } = useAuth();

  // إنشاء نسخة احتياطية
  const createBackup = async (backupName: string) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    setIsLoading(true);
    try {
      // جمع جميع بيانات المستخدم
      const [adsResult, profileResult, messagesResult, notificationsResult, 
             subscriptionsResult, revealsResult, limitsResult] = await Promise.all([
        supabase.from('ads').select('*').eq('user_id', user.id),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('messages').select('*').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
        supabase.from('notifications').select('*').eq('user_id', user.id),
        supabase.from('premium_subscriptions').select('*').eq('user_id', user.id),
        supabase.from('contact_reveals').select('*').eq('user_id', user.id),
        supabase.from('user_ad_limits').select('*').eq('user_id', user.id)
      ]);

      const backupData: BackupData = {
        ads: adsResult.data || [],
        profile: profileResult.data,
        messages: messagesResult.data || [],
        notifications: notificationsResult.data || [],
        premium_subscriptions: subscriptionsResult.data || [],
        contact_reveals: revealsResult.data || [],
        user_ad_limits: limitsResult.data || []
      };

      const backupSize = JSON.stringify(backupData).length;

      // حفظ النسخة الاحتياطية
      const { error } = await supabase
        .from('project_backups')
        .insert({
          user_id: user.id,
          backup_name: backupName,
          backup_data: backupData as any,
          backup_size: backupSize
        });

      if (error) throw error;

      toast.success('تم إنشاء النسخة الاحتياطية بنجاح');
      await fetchBackups();
    } catch (error) {
      console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
      toast.error('فشل في إنشاء النسخة الاحتياطية');
    } finally {
      setIsLoading(false);
    }
  };

  // جلب النسخ الاحتياطية
  const fetchBackups = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('project_backups')
        .select('id, backup_name, backup_size, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBackups(data || []);
    } catch (error) {
      console.error('خطأ في جلب النسخ الاحتياطية:', error);
    }
  };

  // تحميل نسخة احتياطية
  const downloadBackup = async (backupId: string, backupName: string) => {
    try {
      const { data, error } = await supabase
        .from('project_backups')
        .select('backup_data')
        .eq('id', backupId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      // إنشاء ملف للتحميل
      const blob = new Blob([JSON.stringify(data.backup_data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${backupName}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('تم تحميل النسخة الاحتياطية');
    } catch (error) {
      console.error('خطأ في تحميل النسخة الاحتياطية:', error);
      toast.error('فشل في تحميل النسخة الاحتياطية');
    }
  };

  // استعادة نسخة احتياطية
  const restoreBackup = async (backupData: BackupData) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    setIsLoading(true);
    try {
      // حذف البيانات الحالية (اختياري - يمكن تعديل هذا السلوك)
      await Promise.all([
        supabase.from('ads').delete().eq('user_id', user.id),
        supabase.from('messages').delete().or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`),
        supabase.from('notifications').delete().eq('user_id', user.id),
        supabase.from('contact_reveals').delete().eq('user_id', user.id)
      ]);

      // استعادة البيانات
      const promises = [];

      if (backupData.ads?.length > 0) {
        promises.push(supabase.from('ads').insert(backupData.ads));
      }

      if (backupData.profile) {
        promises.push(supabase.from('profiles').upsert(backupData.profile));
      }

      if (backupData.messages?.length > 0) {
        promises.push(supabase.from('messages').insert(backupData.messages));
      }

      if (backupData.notifications?.length > 0) {
        promises.push(supabase.from('notifications').insert(backupData.notifications));
      }

      if (backupData.premium_subscriptions?.length > 0) {
        promises.push(supabase.from('premium_subscriptions').insert(backupData.premium_subscriptions));
      }

      if (backupData.contact_reveals?.length > 0) {
        promises.push(supabase.from('contact_reveals').insert(backupData.contact_reveals));
      }

      if (backupData.user_ad_limits?.length > 0) {
        promises.push(supabase.from('user_ad_limits').upsert(backupData.user_ad_limits));
      }

      await Promise.all(promises);

      toast.success('تم استعادة النسخة الاحتياطية بنجاح');
    } catch (error) {
      console.error('خطأ في استعادة النسخة الاحتياطية:', error);
      toast.error('فشل في استعادة النسخة الاحتياطية');
    } finally {
      setIsLoading(false);
    }
  };

  // رفع واستعادة من ملف
  const uploadAndRestore = async (file: File) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);
      await restoreBackup(backupData);
    } catch (error) {
      console.error('خطأ في رفع واستعادة الملف:', error);
      toast.error('فشل في قراءة الملف أو استعادة البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  // حذف نسخة احتياطية
  const deleteBackup = async (backupId: string) => {
    try {
      const { error } = await supabase
        .from('project_backups')
        .delete()
        .eq('id', backupId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success('تم حذف النسخة الاحتياطية');
      await fetchBackups();
    } catch (error) {
      console.error('خطأ في حذف النسخة الاحتياطية:', error);
      toast.error('فشل في حذف النسخة الاحتياطية');
    }
  };

  return {
    isLoading,
    backups,
    createBackup,
    fetchBackups,
    downloadBackup,
    restoreBackup,
    uploadAndRestore,
    deleteBackup
  };
};