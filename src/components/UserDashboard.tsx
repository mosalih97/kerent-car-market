import { useState } from 'react';
import { User, Settings, Plus, LogOut, Edit, Trash2, Eye, Coins, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useMyAds, useDeleteAd } from '@/hooks/useAds';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import CreateAdModal from './CreateAdModal';
import PremiumCard from './PremiumCard';
import EditAdModal from './EditAdModal';
import AccountSettingsModal from './AccountSettingsModal';
import AdCard from './AdCard';

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: myAds, isLoading } = useMyAds();
  const { profile, isLoading: profileLoading } = useProfile();
  const deleteAdMutation = useDeleteAd();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState<any>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SD').format(price / 1000000);
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

  const handleEditAd = (ad: any) => {
    setSelectedAd(ad);
    setShowEditModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
          <TabsList className="grid w-full grid-cols-2 lg:w-max">
            <TabsTrigger value="ads" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              إعلاناتي
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
                  <AdCard
                    key={ad.id}
                    ad={ad}
                    size="medium"
                    showActions={true}
                    onEdit={handleEditAd}
                    onDelete={(adToDelete) => handleDeleteAd(adToDelete.id)}
                    isDeleting={deleteAdMutation.isPending}
                  />
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
                      onClick={handleSignOut}
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
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowSettingsModal(true)}
                  >
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل المعلومات الشخصية
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
      <AccountSettingsModal open={showSettingsModal} onOpenChange={setShowSettingsModal} />
      {selectedAd && (
        <EditAdModal 
          open={showEditModal} 
          onOpenChange={setShowEditModal}
          ad={selectedAd}
        />
      )}
    </div>
  );
};

export default UserDashboard;
