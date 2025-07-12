
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, MapPin, Calendar, Gauge, Phone, Star, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/integrations/supabase/types';

type Ad = Database['public']['Tables']['ads']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
};

const AdDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [userCredits, setUserCredits] = useState<number>(0);

  useEffect(() => {
    fetchAd();
    if (user) {
      fetchUserCredits();
    }
  }, [id, user]);

  const fetchAd = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('ads')
      .select(`
        *,
        profiles!inner(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching ad:', error);
    } else {
      setAd(data as Ad);
      await trackView();
    }
    setLoading(false);
  };

  const fetchUserCredits = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching credits:', error);
    } else {
      setUserCredits(data.credits);
    }
  };

  const trackView = async () => {
    if (!id) return;

    const { error } = await supabase
      .from('ad_views')
      .insert({
        ad_id: id,
        viewer_id: user?.id || null
      });

    if (error && !error.message.includes('duplicate')) {
      console.error('Error tracking view:', error);
    }
  };

  const revealContact = async () => {
    if (!user || !ad) return;

    if (userCredits < 1) {
      alert('ليس لديك كريديت كافي لعرض معلومات الاتصال');
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('contact_reveals')
        .insert({
          ad_id: ad.id,
          user_id: user.id
        });

      if (insertError && !insertError.message.includes('duplicate')) {
        throw insertError;
      }

      // استخدام edge function لخصم الكريديت
      const { error: functionError } = await supabase.functions.invoke('deduct-credit', {
        body: { user_id: user.id }
      });

      if (functionError) {
        throw functionError;
      }

      setShowContactInfo(true);
      setUserCredits(prev => prev - 1);
    } catch (error) {
      console.error('Error revealing contact:', error);
      alert('حدث خطأ في عرض معلومات الاتصال');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SD').format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SD');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4" dir="rtl">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4" dir="rtl">
        <div className="container mx-auto max-w-4xl text-center py-20">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">الإعلان غير موجود</h1>
          <Link to="/">
            <Button>العودة للرئيسية</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4" dir="rtl">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للرئيسية
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* معرض الصور */}
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={ad.images?.[currentImageIndex] || "https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&h=600&fit=crop"}
                alt={ad.title}
                className="w-full h-96 object-cover rounded-lg"
              />
              {ad.is_featured && (
                <Badge className="absolute top-4 right-4 bg-yellow-500 text-white">
                  مميز
                </Badge>
              )}
            </div>
            
            {ad.images && ad.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {ad.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${ad.title} ${index + 1}`}
                    className={`w-20 h-20 object-cover rounded cursor-pointer flex-shrink-0 ${
                      currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* تفاصيل الإعلان */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{ad.title}</h1>
              <p className="text-4xl font-bold text-green-600 mb-4">
                {formatPrice(ad.price)} جنيه
              </p>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {ad.city}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(ad.created_at)}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {ad.views_count}
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">تفاصيل السيارة</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">الماركة:</span>
                    <span className="font-medium mr-2">{ad.brand}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">الموديل:</span>
                    <span className="font-medium mr-2">{ad.model}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">السنة:</span>
                    <span className="font-medium mr-2">{ad.year}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">الحالة:</span>
                    <span className="font-medium mr-2">
                      {ad.condition === 'new' ? 'جديد' : 
                       ad.condition === 'excellent' ? 'ممتاز' :
                       ad.condition === 'good' ? 'جيد' :
                       ad.condition === 'fair' ? 'مقبول' : 'مستعمل'}
                    </span>
                  </div>
                  {ad.mileage && (
                    <div className="col-span-2">
                      <span className="text-gray-600">المسافة المقطوعة:</span>
                      <span className="font-medium mr-2 flex items-center">
                        <Gauge className="w-4 h-4 ml-1" />
                        {new Intl.NumberFormat('ar-SD').format(ad.mileage)} كم
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {ad.description && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">الوصف</h3>
                  <p className="text-gray-700 leading-relaxed">{ad.description}</p>
                </CardContent>
              </Card>
            )}

            {/* معلومات البائع */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">معلومات البائع</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {ad.profiles.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{ad.profiles.full_name}</p>
                    {ad.profiles.is_featured && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="w-3 h-3 ml-1" />
                        بائع مميز
                      </Badge>
                    )}
                  </div>
                </div>

                {user && user.id !== ad.user_id ? (
                  <div className="space-y-3">
                    {showContactInfo ? (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800">
                          <Phone className="w-4 h-4" />
                          <span className="font-medium">{ad.phone}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          اضغط لإظهار رقم الهاتف (يتطلب 1 كريديت)
                        </p>
                        <p className="text-sm text-blue-600">
                          رصيدك الحالي: {userCredits} كريديت
                        </p>
                        <Button 
                          onClick={revealContact}
                          disabled={userCredits < 1}
                          className="w-full"
                        >
                          <Phone className="w-4 h-4 ml-2" />
                          إظهار رقم الهاتف (1 كريديت)
                        </Button>
                      </div>
                    )}
                  </div>
                ) : user && user.id === ad.user_id ? (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800">هذا إعلانك</p>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">يجب تسجيل الدخول لعرض معلومات الاتصال</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdDetails;
