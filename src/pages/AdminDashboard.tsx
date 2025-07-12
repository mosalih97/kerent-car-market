
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin, useAdminStats, useAdminUsers, useAdminAds, useAdminReports, useUpdateAdStatus, useUpdateReportStatus } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, AlertTriangle, TrendingUp, Eye, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import AdminNavigation from '@/components/AdminNavigation';

const AdminDashboard = () => {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: stats } = useAdminStats();
  const { data: users } = useAdminUsers();
  const { data: ads } = useAdminAds();
  const { data: reports } = useAdminReports();
  const updateAdStatus = useUpdateAdStatus();
  const updateReportStatus = useUpdateReportStatus();
  const [activeTab, setActiveTab] = useState('overview');

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">غير مخول بالوصول</h1>
          <p className="text-gray-600">ليس لديك صلاحية للوصول إلى لوحة التحكم الإدارية</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <AdminNavigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة التحكم الإدارية</h1>
          <p className="text-gray-600">إدارة النظام والمستخدمين والإعلانات</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
            <TabsTrigger value="ads">الإعلانات</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الإعلانات</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalAds || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">التقارير المعلقة</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats?.pendingReports || 0}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة المستخدمين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{user.full_name}</h3>
                        <p className="text-sm text-gray-600">إجمالي الإعلانات: {user.ads_count}</p>
                        <p className="text-sm text-gray-600">الرصيد: {user.credits}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? "نشط" : "غير نشط"}
                        </Badge>
                        {user.user_roles && user.user_roles.length > 0 && (
                          <Badge variant="outline">
                            {user.user_roles[0].role === 'admin' ? 'مدير' : 
                             user.user_roles[0].role === 'moderator' ? 'مشرف' : 'مستخدم'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الإعلانات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ads?.map((ad) => (
                    <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{ad.title}</h3>
                        <p className="text-sm text-gray-600">
                          بواسطة: {ad.profiles?.full_name || 'مستخدم غير محدد'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <Eye className="w-4 h-4 inline ml-1" />
                          {ad.views_count} مشاهدة
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={ad.is_active ? "default" : "secondary"}>
                          {ad.is_active ? "نشط" : "غير نشط"}
                        </Badge>
                        {ad.is_featured && <Badge className="bg-yellow-500">مميز</Badge>}
                        {ad.is_premium && <Badge className="bg-purple-500">بريميوم</Badge>}
                        <Button
                          size="sm"
                          variant={ad.is_active ? "destructive" : "default"}
                          onClick={() => updateAdStatus.mutate({ adId: ad.id, status: ad.is_active ? 'inactive' : 'active' })}
                          disabled={updateAdStatus.isPending}
                        >
                          {ad.is_active ? "إلغاء تفعيل" : "تفعيل"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة التقارير</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports?.map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{report.ads?.title}</h3>
                          <p className="text-sm text-gray-600">
                            مبلغ عنه بواسطة: {report.profiles?.full_name || 'مستخدم غير محدد'}
                          </p>
                          <p className="text-sm text-gray-600">السبب: {report.reason}</p>
                          {report.description && (
                            <p className="text-sm text-gray-600 mt-1">الوصف: {report.description}</p>
                          )}
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
                            onClick={() => updateReportStatus.mutate({ reportId: report.id, status: 'approved' })}
                            disabled={updateReportStatus.isPending}
                          >
                            <CheckCircle className="w-4 h-4 ml-1" />
                            قبول التقرير
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateReportStatus.mutate({ reportId: report.id, status: 'rejected' })}
                            disabled={updateReportStatus.isPending}
                          >
                            <XCircle className="w-4 h-4 ml-1" />
                            رفض التقرير
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
      </main>
    </div>
  );
};

export default AdminDashboard;
