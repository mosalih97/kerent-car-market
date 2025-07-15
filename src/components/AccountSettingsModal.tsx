
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { User, Settings, Bell, Shield, Save } from 'lucide-react';

interface AccountSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AccountSettingsModal = ({ open, onOpenChange }: AccountSettingsModalProps) => {
  const { toast } = useToast();
  const { user, updatePassword } = useAuth();
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  
  const [personalInfo, setPersonalInfo] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    city: profile?.city || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    adStatusUpdates: true,
    messageNotifications: true
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone,
          city: data.city,
          updated_at: new Date().toISOString()
        })
        .eq('id', user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تحديث معلوماتك الشخصية بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث المعلومات",
        variant: "destructive",
      });
    }
  });

  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(personalInfo);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمات المرور غير متطابقة",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    try {
      await updatePassword(passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({
        title: "تم التحديث",
        description: "تم تحديث كلمة المرور بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث كلمة المرور",
        variant: "destructive",
      });
    }
  };

  const cities = [
    'الخرطوم', 'الخرطوم بحري', 'أم درمان', 'مدني', 'الأبيض', 'نيالا', 'الفاشر', 'كسلا', 'بورتسودان', 'الدمازين'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            إعدادات الحساب
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              المعلومات الشخصية
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              الأمان
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              الإشعارات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الشخصية</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">الاسم الكامل</Label>
                    <Input
                      id="full_name"
                      value={personalInfo.full_name}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="اكتب اسمك الكامل"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">لا يمكن تغيير البريد الإلكتروني</p>
                  </div>

                  <div>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="مثال: 0912345678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">المدينة</Label>
                    <Select value={personalInfo.city} onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, city: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المدينة" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map(city => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" disabled={updateProfileMutation.isPending} className="w-full">
                    <Save className="w-4 h-4 ml-2" />
                    {updateProfileMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>تغيير كلمة المرور</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="اكتب كلمة المرور الجديدة"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="أعد كتابة كلمة المرور"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Shield className="w-4 h-4 ml-2" />
                    تحديث كلمة المرور
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الإشعارات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>إشعارات البريد الإلكتروني</Label>
                    <p className="text-sm text-gray-500">تلقي الإشعارات عبر البريد الإلكتروني</p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>إشعارات الرسائل النصية</Label>
                    <p className="text-sm text-gray-500">تلقي الإشعارات عبر الرسائل النصية</p>
                  </div>
                  <Switch
                    checked={notifications.smsNotifications}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, smsNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>إشعارات حالة الإعلان</Label>
                    <p className="text-sm text-gray-500">تلقي إشعارات عند تغيير حالة إعلاناتك</p>
                  </div>
                  <Switch
                    checked={notifications.adStatusUpdates}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, adStatusUpdates: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>إشعارات الرسائل</Label>
                    <p className="text-sm text-gray-500">تلقي إشعارات عند وصول رسائل جديدة</p>
                  </div>
                  <Switch
                    checked={notifications.messageNotifications}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, messageNotifications: checked }))}
                  />
                </div>

                <Button className="w-full">
                  <Save className="w-4 h-4 ml-2" />
                  حفظ إعدادات الإشعارات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AccountSettingsModal;
