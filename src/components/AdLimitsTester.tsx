
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdLimits, useCheckAdLimit } from '@/hooks/useAdLimits';
import { useProfile } from '@/hooks/useProfile';
import { useMyAds } from '@/hooks/useAds';
import { AlertCircle, Crown, Zap, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdLimitsTester = () => {
  const { data: adLimits, refetch: refetchLimits } = useAdLimits();
  const { data: canCreateAd, refetch: refetchCanCreate } = useCheckAdLimit();
  const { profile, isLoading: profileLoading } = useProfile();
  const { data: myAds } = useMyAds();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchLimits(),
      refetchCanCreate()
    ]);
    setRefreshing(false);
  };

  const getRemainingAds = () => {
    if (!adLimits) return 0;
    return Math.max(0, adLimits.max_ads - adLimits.ads_count);
  };

  const getStatusColor = () => {
    if (profile?.is_premium) return 'bg-gradient-to-r from-amber-500 to-amber-600';
    if (canCreateAd) return 'bg-green-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (profile?.is_premium) return 'مميز - إعلانات غير محدودة';
    if (canCreateAd) return `يمكن إضافة ${getRemainingAds()} إعلان`;
    return 'وصل للحد الأقصى';
  };

  if (profileLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">اختبار نظام حدود الإعلانات</h2>
        <Button 
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* حالة المستخدم */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              حالة المستخدم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">نوع الحساب:</span>
              <Badge className={getStatusColor()}>
                {profile?.is_premium && <Crown className="w-3 h-3 mr-1" />}
                {profile?.is_premium ? 'مميز' : 'مجاني'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">الحالة:</span>
              <Badge variant={canCreateAd ? "default" : "destructive"}>
                {getStatusText()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">الكريديت:</span>
              <span className="font-bold text-yellow-600">{profile?.credits || 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* إحصائيات الإعلانات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              إحصائيات الإعلانات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {adLimits?.ads_count || 0}
                </div>
                <div className="text-sm text-gray-600">إعلانات هذا الشهر</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {profile?.is_premium ? '∞' : adLimits?.max_ads || 5}
                </div>
                <div className="text-sm text-gray-600">الحد الأقصى</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {myAds?.length || 0}
              </div>
              <div className="text-sm text-gray-600">إجمالي إعلاناتي</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* تفاصيل الحدود */}
      {adLimits && (
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الحدود الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">آخر إعادة تعيين:</span>
                <p className="font-bold">{new Date(adLimits.last_reset).toLocaleDateString('ar-SA')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">تاريخ الإنشاء:</span>
                <p className="font-bold">{new Date(adLimits.created_at).toLocaleDateString('ar-SA')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">آخر تحديث:</span>
                <p className="font-bold">{new Date(adLimits.updated_at).toLocaleDateString('ar-SA')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* تحذيرات وإشعارات */}
      {!profile?.is_premium && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {canCreateAd ? (
              <span className="text-green-600">
                يمكنك إضافة {getRemainingAds()} إعلان إضافي هذا الشهر
              </span>
            ) : (
              <span className="text-red-600">
                لقد وصلت للحد الأقصى من الإعلانات هذا الشهر. ترقية الحساب للحصول على إعلانات غير محدودة.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AdLimitsTester;
