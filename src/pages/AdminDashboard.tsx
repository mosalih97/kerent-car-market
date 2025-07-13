import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useAdminUpdateUserType, useAdminToggleAdStatus, useAdminUpdateReportStatus } from '@/hooks/useAdminActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Users, 
  Car, 
  AlertTriangle, 
  BarChart3, 
  Crown, 
  Star,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Zap
} from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Ad = Tables<'ads'>;
type Report = Tables<'ad_reports'>;

export default function AdminDashboard() {
  const { user } = useAuth();
  const updateUserTypeMutation = useAdminUpdateUserType();
  const toggleAdStatusMutation = useAdminToggleAdStatus();
  const updateReportStatusMutation = useAdminUpdateReportStatus();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAds: 0,
    pendingReports: 0,
    premiumUsers: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Use the new secure admin verification function
      const { data, error } = await supabase
        .rpc('verify_admin_access', { _user_id: user.id });

      if (error) {
        console.error('Admin verification error:', error);
        throw error;
      }
      
      setIsAdmin(data || false);
      if (data) {
        await loadDashboardData();
        toast.success('مرحباً بك في لوحة التحكم');
      } else {
        toast.error('ليس لديك صلاحية الوصول لهذه الصفحة');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      toast.error('خطأ في التحقق من صلاحيات المدير');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Load ads
      const { data: adsData } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      // Load reports
      const { data: reportsData } = await supabase
        .from('ad_reports')
        .select('*')
        .order('created_at', { ascending: false });

      setProfiles(profilesData || []);
      setAds(adsData || []);
      setReports(reportsData || []);

      // Calculate stats
      setStats({
        totalUsers: profilesData?.length || 0,
        totalAds: adsData?.length || 0,
        pendingReports: reportsData?.filter(r => r.status === 'pending').length || 0,
        premiumUsers: profilesData?.filter(p => p.user_type === 'premium').length || 0
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('خطأ في تحميل بيانات لوحة التحكم');
    }
  };

  const updateUserType = async (userId: string, userType: 'free' | 'premium') => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('admin_update_user_type', {
          _admin_id: user.id,
          _target_user_id: userId,
          _user_type: userType
        });

      if (error) throw error;

      if (data) {
        toast.success(`تم تحديث نوع العضوية إلى ${userType === 'premium' ? 'مميزة' : 'مجانية'}`);
        await loadDashboardData();
      } else {
        toast.error('فشل في تحديث نوع العضوية');
      }
    } catch (error: any) {
      console.error('Error updating user type:', error);
      if (error.message?.includes('Access denied')) {
        toast.error('ليس لديك صلاحية لتنفيذ هذا الإجراء');
      } else {
        toast.error('خطأ في تحديث نوع العضوية');
      }
    }
  };

  const toggleAdStatus = async (adId: string, isActive: boolean) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('admin_toggle_ad_status', {
          _admin_id: user.id,
          _ad_id: adId,
          _is_active: !isActive
        });

      if (error) throw error;

      if (data) {
        toast.success(`تم ${!isActive ? 'تفعيل' : 'إلغاء تفعيل'} الإعلان`);
        await loadDashboardData();
      } else {
        toast.error('فشل في تغيير حالة الإعلان');
      }
    } catch (error: any) {
      console.error('Error toggling ad status:', error);
      if (error.message?.includes('Access denied')) {
        toast.error('ليس لديك صلاحية لتنفيذ هذا الإجراء');
      } else {
        toast.error('خطأ في تغيير حالة الإعلان');
      }
    }
  };

  const updateReportStatus = async (reportId: string, status: 'approved' | 'rejected') => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('admin_update_report_status', {
          _admin_id: user.id,
          _report_id: reportId,
          _status: status
        });

      if (error) throw error;

      if (data) {
        toast.success(`تم ${status === 'approved' ? 'قبول' : 'رفض'} البلاغ`);
        await loadDashboardData();
      } else {
        toast.error('فشل في تحديث حالة البلاغ');
      }
    } catch (error: any) {
      console.error('Error updating report status:', error);
      if (error.message?.includes('Access denied')) {
        toast.error('ليس لديك صلاحية لتنفيذ هذا الإجراء');
      } else {
        toast.error('خطأ في تحديث حالة البلاغ');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-4">مطلوب تسجيل الدخول</h2>
            <p className="text-gray-600">يجب تسجيل الدخول للوصول لهذه الصفحة</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Ban className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-4">غير مصرح</h2>
            <p className="text-gray-600">ليس لديك صلاحية للوصول لهذه الصفحة</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (profile.phone && profile.phone.includes(searchTerm));
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'premium') return matchesSearch && profile.user_type === 'premium';
    if (filterType === 'free') return matchesSearch && profile.user_type === 'free';
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4" dir="rtl">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة تحكم المدير</h1>
          <p className="text-gray-600">إدارة شاملة للمنصة والمستخدمين</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الإعلانات</p>
                  <p className="text-2xl font-bold">{stats.totalAds}</p>
                </div>
                <Car className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">البلاغات المعلقة</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingReports}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الأعضاء المميزون</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.premiumUsers}</p>
                </div>
                <Crown className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">إدارة المستخدمين</TabsTrigger>
            <TabsTrigger value="ads">إدارة الإعلانات</TabsTrigger>
            <TabsTrigger value="reports">إدارة البلاغات</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة المستخدمين</CardTitle>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="البحث بالاسم أو رقم الهاتف..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المستخدمين</SelectItem>
                      <SelectItem value="premium">أعضاء مميزون</SelectItem>
                      <SelectItem value="free">أعضاء مجانيون</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProfiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-medium">{profile.full_name}</h3>
                          <p className="text-sm text-gray-600">{profile.phone || 'لا يوجد رقم هاتف'}</p>
                          <p className="text-sm text-gray-500">
                            {profile.ads_count} إعلان | {profile.credits} كريديت
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={profile.user_type === 'premium' ? 'default' : 'secondary'}>
                          {profile.user_type === 'premium' ? (
                            <Crown className="w-3 h-3 mr-1" />
                          ) : null}
                          {profile.user_type === 'premium' ? 'مميز' : 'مجاني'}
                        </Badge>
                        <Button
                          size="sm"
                          variant={profile.user_type === 'premium' ? 'outline' : 'default'}
                          onClick={() => updateUserTypeMutation.mutate({
                            targetUserId: profile.id, 
                            userType: profile.user_type === 'premium' ? 'free' : 'premium'
                          })}
                          disabled={updateUserTypeMutation.isPending}
                          className={profile.user_type === 'premium' ? '' : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'}
                        >
                          <Zap className="w-3 h-3 ml-1" />
                          {profile.user_type === 'premium' ? 'تحويل لمجاني' : 'ترقية لمميز'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الإعلانات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ads.slice(0, 20).map((ad) => (
                    <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{ad.title}</h3>
                        <p className="text-sm text-gray-600">{ad.brand} {ad.model} - {ad.year}</p>
                        <p className="text-sm text-gray-500">
                          {ad.price.toLocaleString()} ريال | {ad.views_count} مشاهدة
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={ad.is_active ? 'default' : 'destructive'}>
                          {ad.is_active ? 'نشط' : 'غير نشط'}
                        </Badge>
                        {ad.is_premium && (
                          <Badge variant="outline">
                            <Crown className="w-3 h-3 mr-1" />
                            مميز
                          </Badge>
                        )}
                        {ad.is_featured && (
                          <Badge variant="outline">
                            <Star className="w-3 h-3 mr-1" />
                            مميز
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant={ad.is_active ? 'destructive' : 'default'}
                          onClick={() => toggleAdStatusMutation.mutate({
                            adId: ad.id, 
                            isActive: !ad.is_active
                          })}
                          disabled={toggleAdStatusMutation.isPending}
                        >
                          {ad.is_active ? (
                            <XCircle className="w-4 h-4 mr-1" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          )}
                          {ad.is_active ? 'إلغاء تفعيل' : 'تفعيل'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة البلاغات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{report.reason}</h3>
                          <p className="text-sm text-gray-600">{report.description}</p>
                          <p className="text-sm text-gray-500">
                            تاريخ البلاغ: {new Date(report.created_at!).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            report.status === 'pending' ? 'secondary' :
                            report.status === 'approved' ? 'destructive' : 'default'
                          }
                        >
                          {report.status === 'pending' ? 'معلق' :
                           report.status === 'approved' ? 'مقبول' : 'مرفوض'}
                        </Badge>
                      </div>
                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateReportStatusMutation.mutate({
                              reportId: report.id, 
                              status: 'approved'
                            })}
                            disabled={updateReportStatusMutation.isPending}
                          >
                            قبول البلاغ
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateReportStatusMutation.mutate({
                              reportId: report.id, 
                              status: 'rejected'
                            })}
                            disabled={updateReportStatusMutation.isPending}
                          >
                            رفض البلاغ
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}