
import { Navigate } from 'react-router-dom';
import { Users, FileText, AlertTriangle, TrendingUp, Eye, Ban, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/useAuth';
import { 
  useIsAdmin, 
  useAdminStats, 
  useAdminUsers, 
  useAdminAds, 
  useAdminReports,
  useUpdateAdStatus,
  useUpdateReportStatus
} from '@/hooks/useAdmin';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: ads, isLoading: adsLoading } = useAdminAds();
  const { data: reports, isLoading: reportsLoading } = useAdminReports();
  const updateAdStatus = useUpdateAdStatus();
  const updateReportStatus = useUpdateReportStatus();

  // التحقق من التحميل والصلاحيات
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // إعادة توجيه إذا لم يكن مستخدم أو ليس إداري
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SD');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SD').format(price);
  };

  const handleAdStatusUpdate = (adId: string, status: string) => {
    updateAdStatus.mutate({ adId, status });
  };

  const handleReportStatusUpdate = (reportId: string, status: string) => {
    updateReportStatus.mutate({ reportId, status });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4" dir="rtl">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة التحكم الإدارية</h1>
          <p className="text-gray-600">مرحباً بك في لوحة التحكم الإدارية</p>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats?.totalUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الإعلانات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats?.totalAds || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeAds || 0} نشط
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">التقارير المعلقة</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {statsLoading ? '...' : stats?.pendingReports || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                من أصل {stats?.totalReports || 0} تقرير
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل النشاط</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statsLoading ? '...' : Math.round(((stats?.activeAds || 0) / (stats?.totalAds || 1)) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                نسبة الإعلانات النشطة
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="ads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ads">إدارة الإعلانات</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
          </TabsList>

          <TabsContent value="ads">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الإعلانات</CardTitle>
              </CardHeader>
              <CardContent>
                {adsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>العنوان</TableHead>
                        <TableHead>المالك</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>المشاهدات</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>تاريخ النشر</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ads?.map((ad) => (
                        <TableRow key={ad.id}>
                          <TableCell className="font-medium">{ad.title}</TableCell>
                          <TableCell>{ad.profiles?.full_name}</TableCell>
                          <TableCell>{formatPrice(ad.price)} جنيه</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {ad.views_count}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={ad.is_active ? 'default' : 'secondary'}>
                              {ad.is_active ? 'نشط' : 'غير نشط'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(ad.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {ad.is_active ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleAdStatusUpdate(ad.id, 'inactive')}
                                  disabled={updateAdStatus.isPending}
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleAdStatusUpdate(ad.id, 'active')}
                                  disabled={updateAdStatus.isPending}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>إدارة التقارير</CardTitle>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الإعلان</TableHead>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>السبب</TableHead>
                        <TableHead>الوصف</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>تاريخ التقرير</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports?.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.ads?.title}</TableCell>
                          <TableCell>{report.profiles?.full_name}</TableCell>
                          <TableCell>{report.reason}</TableCell>
                          <TableCell>{report.description || 'لا يوجد'}</TableCell>
                          <TableCell>
                            <Badge variant={
                              report.status === 'pending' ? 'destructive' : 
                              report.status === 'approved' ? 'default' : 'secondary'
                            }>
                              {report.status === 'pending' ? 'معلق' : 
                               report.status === 'approved' ? 'موافق عليه' : 'مرفوض'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(report.created_at)}</TableCell>
                          <TableCell>
                            {report.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleReportStatusUpdate(report.id, 'approved')}
                                  disabled={updateReportStatus.isPending}
                                >
                                  موافقة
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReportStatusUpdate(report.id, 'rejected')}
                                  disabled={updateReportStatus.isPending}
                                >
                                  رفض
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>إدارة المستخدمين</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>الهاتف</TableHead>
                        <TableHead>المدينة</TableHead>
                        <TableHead>الكريديت</TableHead>
                        <TableHead>عدد الإعلانات</TableHead>
                        <TableHead>نوع الحساب</TableHead>
                        <TableHead>تاريخ التسجيل</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.full_name}</TableCell>
                          <TableCell>{user.phone || 'غير محدد'}</TableCell>
                          <TableCell>{user.city || 'غير محدد'}</TableCell>
                          <TableCell>{user.credits}</TableCell>
                          <TableCell>{user.ads_count}</TableCell>
                          <TableCell>
                            <Badge variant={user.user_type === 'premium' ? 'default' : 'secondary'}>
                              {user.user_type === 'premium' ? 'مميز' : 'مجاني'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
