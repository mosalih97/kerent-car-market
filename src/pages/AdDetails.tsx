
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Calendar, Gauge, Phone, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import AdComponent from '@/components/AdComponent';
import SuggestedAds from '@/components/SuggestedAds';
import { useUserBehavior } from '@/hooks/useUserBehavior';

type Ad = Database['public']['Tables']['ads']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
  whatsapp?: string;
};

const AdDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { credits, deductCredit, refreshCredits } = useCredits();
  const { profile, isPremium } = useProfile();
  const { toast } = useToast();
  const { trackAdView } = useUserBehavior();
  const navigate = useNavigate();
  
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  // إخفاء التفاصيل عند مغادرة الصفحة
  useEffect(() => {
    const handleBeforeUnload = () => {
      setShowContactInfo(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowContactInfo(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // إخفاء التفاصيل عند إلغاء تحميل المكون
      setShowContactInfo(false);
    };
  }, []);

  useEffect(() => {
    fetchAd();
    if (user && id) {
      checkIfContactRevealed();
    }
  }, [id, user]);

  // التحديث في الوقت الحقيقي لعداد المشاهدات
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel('ad-views-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ads',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('Real-time ad update:', payload);
          if (payload.new && ad) {
            setAd(prev => prev ? { ...prev, views_count: payload.new.views_count } : null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, ad]);

  const fetchAd = async () => {
    if (!id) return;

    try {
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
        toast({
          title: "خطأ",
          description: "حدث خطأ في تحميل الإعلان",
          variant: "destructive",
        });
      } else {
        console.log('Ad fetched successfully:', data);
        setAd(data as Ad);
        await trackView();
        // Track user behavior
        if (data) {
          trackAdView(data);
        }
      }
    } catch (error) {
      console.error('Error in fetchAd:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل الإعلان",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIfContactRevealed = async () => {
    if (!user || !id) return;

    // المستخدمون المميزون يمكنهم رؤية المعلومات فوراً
    if (isPremium) {
      setShowContactInfo(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('contact_reveals')
        .select('id')
        .eq('ad_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking contact reveal:', error);
        return;
      }

      if (data) {
        console.log('Contact already revealed for this user');
        setShowContactInfo(true);
      }
    } catch (error) {
      console.error('Error in checkIfContactRevealed:', error);
    }
  };

  const trackView = async () => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from('ad_views')
        .insert({
          ad_id: id,
          viewer_id: user?.id || null
        });

      if (error && !error.message.includes('duplicate')) {
        console.error('Error tracking view:', error);
      }
    } catch (error) {
      console.error('Error in trackView:', error);
    }
  };

  const revealContact = async () => {
    if (!user || !ad) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    // المستخدمون المميزون لا يحتاجون لكريديت
    if (isPremium) {
      setShowContactInfo(true);
      toast({
        title: "تم بنجاح",
        description: "معلومات الاتصال متاحة للمستخدمين المميزين",
      });
      return;
    }

    if (credits < 1) {
      toast({
        title: "رصيد غير كافي",
        description: "ليس لديك كريديت كافي لعرض معلومات الاتصال",
        variant: "destructive",
      });
      return;
    }

    setIsRevealing(true);
    console.log('Starting contact reveal process for user:', user.id, 'ad:', ad.id);

    try {
      // أولاً نتحقق من عدم وجود كشف سابق
      const { data: existingReveal, error: checkError } = await supabase
        .from('contact_reveals')
        .select('id')
        .eq('ad_id', ad.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing reveal:', checkError);
        throw new Error('فشل في التحقق من الكشف السابق');
      }

      if (existingReveal) {
        console.log('Contact already revealed, showing contact info');
        setShowContactInfo(true);
        toast({
          title: "تم بنجاح",
          description: "معلومات الاتصال متاحة بالفعل",
        });
        return;
      }

      // خصم الكريديت أولاً
      console.log('Attempting to deduct credit...');
      const creditDeducted = await deductCredit();
      
      if (!creditDeducted) {
        console.error('Failed to deduct credit');
        throw new Error('فشل في خصم الكريديت');
      }

      console.log('Credit deducted successfully, now recording contact reveal');

      // سجل كشف معلومات الاتصال
      const { error: insertError } = await supabase
        .from('contact_reveals')
        .insert({
          ad_id: ad.id,
          user_id: user.id
        });

      if (insertError) {
        console.error('Error inserting contact reveal:', insertError);
        // في حالة فشل تسجيل الكشف، نحاول إعادة الكريديت
        await refreshCredits();
        throw new Error('فشل في تسجيل كشف معلومات الاتصال');
      }

      console.log('Contact reveal recorded successfully');
      setShowContactInfo(true);
      toast({
        title: "تم بنجاح",
        description: "تم عرض معلومات الاتصال",
      });

    } catch (error) {
      console.error('Error in revealContact:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRevealing(false);
    }
  };


  const openWhatsApp = () => {
    if (ad?.phone) {
      const whatsappUrl = `https://wa.me/${ad.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`أنا مهتم بهذا العرض: ${ad.title}`)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const makePhoneCall = () => {
    if (ad?.phone) {
      window.location.href = `tel:${ad.phone}`;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SD').format(price / 1000000);
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

        {/* إعلان في أعلى صفحة التفاصيل */}
        <AdComponent placement="ad_details_top" size="large" className="mb-8" />

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
                {formatPrice(ad.price)} مليون جنيه
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
                     {ad.profiles.is_premium && (
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
                      <div className="space-y-3">
                        {/* جدول رقم الهاتف */}
                        <button
                          onClick={makePhoneCall}
                          className="w-full p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-center gap-2 text-green-800">
                            <Phone className="w-4 h-4" />
                            <span className="font-medium">اضغط للإتصال بالبائع</span>
                          </div>
                          <span className="font-medium text-lg text-green-700" dir="ltr">{ad.phone}</span>
                        </button>

                        {/* جدول واتساب */}
                        <div className="space-y-2">
                          <div className="text-center">
                            <span className="text-sm text-gray-600">اضغط للمراسلة عبر واتساب</span>
                          </div>
                          <button
                            onClick={openWhatsApp}
                            className="w-full p-4 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded-lg transition-colors cursor-pointer border-2 border-yellow-500"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span className="font-medium">جهة واتساب</span>
                            </div>
                            <span className="font-medium text-lg" dir="ltr">{ad.phone}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800 mb-2">
                            {isPremium ? 'اضغط لإظهار معلومات الاتصال (مجاناً للمستخدمين المميزين)' : 'اضغط لإظهار معلومات الاتصال (يتطلب 1 كريديت)'}
                          </p>
                          {!isPremium && (
                            <p className="text-sm text-blue-600">
                              رصيدك الحالي: {credits} كريديت
                            </p>
                          )}
                        </div>
                        <Button 
                          onClick={revealContact}
                          disabled={!isPremium && (credits < 1 || isRevealing)}
                          className="w-full"
                        >
                          <Phone className="w-4 h-4 ml-2" />
                          {isRevealing ? 'جاري الإظهار...' : 
                           isPremium ? 'إظهار معلومات الاتصال (مجاناً)' : 'إظهار معلومات الاتصال (1 كريديت)'}
                        </Button>
                      </div>
                    )}

                  </div>
                ) : user && user.id === ad.user_id ? (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800">هذا إعلانك</p>
                    <div className="flex items-center gap-2 text-blue-600 mt-2">
                      <Phone className="w-4 h-4" />
                      <span className="font-medium" dir="ltr">{ad.phone}</span>
                    </div>
                    {ad.whatsapp && (
                      <div className="flex items-center gap-2 text-blue-600 mt-1">
                        <span className="font-medium" dir="ltr">{ad.whatsapp}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">يجب تسجيل الدخول لعرض معلومات الاتصال</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* السيارات المقترحة أسفل معلومات البائع */}
            <div className="mt-6">
              <SuggestedAds 
                currentAdId={ad.id}
                brand={ad.brand}
                city={ad.city}
                limit={6}
                title="سيارات مقترحة"
                className=""
              />
            </div>
          </div>
        </div>
        
        {/* إعلان في أسفل صفحة التفاصيل */}
        <AdComponent placement="ad_details_bottom" size="large" className="mt-8" />

      </div>
    </div>
  );
};

export default AdDetails;
