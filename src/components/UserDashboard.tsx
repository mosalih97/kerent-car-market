
import { useState } from 'react';
import { User, Settings, MessageSquare, Bell, Plus, LogOut, Edit, Trash2, Eye, Coins, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useMyAds, useDeleteAd } from '@/hooks/useAds';
import { useProfile } from '@/hooks/useProfile';
import CreateAdModal from './CreateAdModal';
import PremiumCard from './PremiumCard';

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const { data: myAds, isLoading } = useMyAds();
  const { profile, isLoading: profileLoading } = useProfile();
  const deleteAdMutation = useDeleteAd();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SD').format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SD');
  };

  const handleDeleteAd = async (adId: string) => {
    if (window.confirm('هل تريد حذف هذا الإعلان؟')) {
      deleteAdMutation.mutate(adId);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4" dir="rtl">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة التحكم</h1>
              <p className="text-gray-600">مرحباً {profile?.full_name || user?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                <Coins className="w-4 h-4" />
                <span className="font-medium">
                  {profile?.credits || 0} كريديت
                </span>
              </div>
              {profile?.is_premium && (
                <div className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 px-3 py-1 rounded-full">
                  <Crown className="w-4 h-4" />
                  <span className="font-medium">عضو مميز</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Premium Card - Only show to free users */}
        {!profile?.is_premium && (
          <div className="mb-8">
            <PremiumCard variant="dashboard" />
          </div>
        )}

        <Tabs defaultValue="ads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-max">
            <TabsTrigger value="ads" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              إعلاناتي
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              الرسائل
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              الإشعارات
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              حسابي
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ads" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">إعلاناتي</h2>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة إعلان جديد
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : myAds && myAds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myAds.map((ad) => (
                  <Card key={ad.id} className="group hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img 
                        src={ad.images?.[0] || "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop"}
                        alt={ad.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {ad.is_featured && (
                          <Badge className="bg-yellow-500 text-white">مميز</Badge>
                        )}
                        {!ad.is_active && (
                          <Badge variant="secondary">غير نشط</Badge>
                        )}
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="secondary" className="bg-white/90">
                          <Eye className="w-3 h-3 ml-1" />
                          {ad.views_count}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {ad.title}
                      </h3>
                      <p className="text-2xl font-bold text-green-600 mb-2">
                        {formatPrice(ad.price)} جنيه
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        تم النشر في {formatDate(ad.created_at)}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="w-4 h-4 ml-2" />
                          تعديل
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDeleteAd(ad.id)}
                          disabled={deleteAdMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 ml-2" />
                          حذف
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد إعلانات</h3>
                  <p className="text-gray-500 mb-4">لم تقم بنشر أي إعلانات بعد</p>
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700"
                  >
                    أضف إعلانك الأول
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  الرسائل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد رسائل</h3>
                  <p className="text-gray-500">ستظهر رسائلك هنا</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  الإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد إشعارات</h3>
                  <p className="text-gray-500">ستظهر إشعاراتك هنا</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    معلومات الحساب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">الاسم</label>
                    <p className="text-lg">{profile?.full_name || 'غير محدد'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">البريد الإلكتروني</label>
                    <p className="text-lg">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">نوع الحساب</label>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={profile?.is_premium ? "default" : "secondary"}
                        className={profile?.is_premium ? "bg-gradient-to-r from-amber-500 to-amber-600" : ""}
                      >
                        {profile?.is_premium && <Crown className="w-3 h-3 mr-1" />}
                        {profile?.is_premium ? 'مميز' : 'مجاني'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">الكريديت المتاح</label>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-600" />
                      <span className="text-lg font-bold text-yellow-600">
                        {profile?.credits || 0} كريديت
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      يستخدم الكريديت لعرض أرقام الهواتف في الإعلانات
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={signOut}
                      variant="destructive" 
                      className="w-full"
                    >
                      <LogOut className="w-4 h-4 ml-2" />
                      تسجيل الخروج
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    إعدادات الحساب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل المعلومات الشخصية
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="w-4 h-4 ml-2" />
                    إعدادات الإشعارات
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 ml-2" />
                    إعدادات الخصوصية
                  </Button>
                  <div className="pt-4 border-t">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">كيفية الحصول على كريديت إضافي</h4>
                      <p className="text-sm text-blue-600">
                        • يتم إعادة تعيين الكريديت شهرياً إلى 20 كريديت
                        <br />
                        • ترقية الحساب للحصول على كريديت إضافي
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CreateAdModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  );
};

export default UserDashboard;
