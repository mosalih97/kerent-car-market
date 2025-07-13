import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Car, 
  AlertTriangle, 
  BarChart3, 
  Eye,
  TrendingUp,
  RefreshCw,
  Key
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAds: 0,
    totalReports: 0,
    totalViews: 0
  });

  // تحقق مبسط من الصلاحيات
  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        if (!user) {
          navigate('/auth');
          return;
        }

        console.log('Checking admin status for user:', user.id);

        // التحقق من كون المستخدم مدير
        const { data: isAdminResult, error } = await supabase.rpc('is_admin', {
          _user_id: user.id
        });

        console.log('Admin check result:', isAdminResult, 'Error:', error);

        if (error) {
          console.error('Error checking admin status:', error);
          toast.error('خطأ في التحقق من الصلاحيات');
          navigate('/');
          return;
        }

        if (!isAdminResult) {
          toast.error('ليس لديك صلاحية للوصول إلى لوحة التحكم');
          navigate('/');
          return;
        }

        // إذا كان المستخدم مدير، اعرض المصادقة الثنائية
        setShowTwoFactor(true);
        setIsLoading(false);

      } catch (error) {
        console.error('Error in authorization check:', error);
        toast.error('خطأ في التحقق من الصلاحيات');
        navigate('/');
      }
    };

    checkAuthorization();
  }, [user, navigate]);

  // التعامل مع المصادقة الثنائية
  const handleTwoFactorSubmit = () => {
    const correctCodes = ['123456', '000000', 'admin']; 
    
    if (correctCodes.includes(twoFactorCode.toLowerCase())) {
      setIsAuthorized(true);
      setShowTwoFactor(false);
      loadDashboardData();
      toast.success('تم التحقق بنجاح');
    } else {
      toast.error('رمز التحقق غير صحيح. جرب: 123456 أو 000000 أو admin');
    }
  };

  // تحميل بيانات لوحة التحكم
  const loadDashboardData = async () => {
    try {
      const [usersResult, adsResult, reportsResult, viewsResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('ads').select('*', { count: 'exact', head: true }),
        supabase.from('ad_reports').select('*', { count: 'exact', head: true }),
        supabase.from('ad_views').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalAds: adsResult.count || 0,
        totalReports: reportsResult.count || 0,
        totalViews: viewsResult.count || 0
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('خطأ في تحميل البيانات');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // شاشة التحميل
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">جارٍ التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // شاشة المصادقة الثنائية
  if (showTwoFactor && !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">المصادقة الثنائية</CardTitle>
            <p className="text-gray-600">أدخل أحد أكواد التحقق: 123456 أو 000000 أو admin</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twoFactorCode">رمز التحقق</Label>
              <Input
                id="twoFactorCode"
                type="text"
                placeholder="123456 أو 000000 أو admin"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="text-center text-lg tracking-widest"
                maxLength={10}
              />
            </div>
            <Button 
              onClick={handleTwoFactorSubmit} 
              className="w-full"
              disabled={twoFactorCode.length < 3}
            >
              <Key className="w-4 h-4 ml-2" />
              تحقق
            </Button>
            <div className="text-center">
              <Button variant="link" onClick={() => navigate('/')}>
                العودة إلى الرئيسية
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // لوحة التحكم الرئيسية
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">غير مصرح</h2>
          <p className="text-gray-600 mb-4">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
          <Button onClick={() => navigate('/')}>العودة إلى الرئيسية</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">لوحة تحكم المدير</h1>
                <p className="text-sm text-gray-600">إدارة المنصة</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                مرحباً، {user?.user_metadata?.full_name || user?.email}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                المسجلين في المنصة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الإعلانات</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAds}</div>
              <p className="text-xs text-muted-foreground">
                منشورة حالياً
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">البلاغات</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReports}</div>
              <p className="text-xs text-muted-foreground">
                تحتاج مراجعة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المشاهدات</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">
                إجمالي المشاهدات
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
            <TabsTrigger value="ads">الإعلانات</TabsTrigger>
            <TabsTrigger value="reports">البلاغات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    الإحصائيات السريعة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>المستخدمين النشطين</span>
                    <Badge variant="secondary">{stats.totalUsers}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>الإعلانات النشطة</span>
                    <Badge variant="secondary">{stats.totalAds}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>البلاغات المعلقة</span>
                    <Badge variant="destructive">{stats.totalReports}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    الأنشطة الحديثة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>تم إضافة مستخدم جديد</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>تم نشر إعلان جديد</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>تم تقديم بلاغ جديد</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>إدارة المستخدمين</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600 py-8">
                  ستتم إضافة وظائف إدارة المستخدمين قريباً
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ads">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الإعلانات</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600 py-8">
                  ستتم إضافة وظائف إدارة الإعلانات قريباً
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>إدارة البلاغات</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600 py-8">
                  ستتم إضافة وظائف إدارة البلاغات قريباً
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;