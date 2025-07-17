
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Calendar, Gauge, Phone, Star, Eye, Heart, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { useMessages } from '@/hooks/useMessages';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Ad = Database['public']['Tables']['ads']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
  whatsapp?: string;
};

const AdDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { credits, deductCredit, refreshCredits } = useCredits();
  const { sendMessage, isSending } = useMessages();
  const { profile, isPremium } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);

  // إخفاء التفاصيل عند مغادرة الصفحة
  useEffect(() => {
    const handleBeforeUnload = () => {
      setShowContactInfo(false);
      setShowMessageBox(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowContactInfo(false);
        setShowMessageBox(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // إخفاء التفاصيل عند إلغاء تحميل المكون
      setShowContactInfo(false);
      setShowMessageBox(false);
    };
  }, []);

  useEffect(() => {
    fetchAd();
    if (user && id) {
      checkIfContactRevealed();
    }
  }, [id, user]);

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

  const handleSendMessage = async () => {
    if (!user || !ad) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    if (!messageContent.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى كتابة رسالة",
        variant: "destructive",
      });
      return;
    }

    // المستخدمون المميزون لا يحتاجون لكريديت
    if (!isPremium && credits < 1) {
      toast({
        title: "رصيد غير كافي",
        description: "ليس لديك كريديت كافي لإرسال رسالة",
        variant: "destructive",
      });
      return;
    }

    try {
      // خصم الكريديت فقط للمستخدمين غير المميزين
      if (!isPremium) {
        const creditDeducted = await deductCredit();
        
        if (!creditDeducted) {
          throw new Error('فشل في خصم الكريديت');
        }
      }

      // إرسال الرسالة
      sendMessage({
        receiverId: ad.user_id,
        content: messageContent,
        adId: ad.id
      });

      setMessageContent('');
      setShowMessageBox(false);
      toast({
        title: "تم بنجاح",
        description: "تم إرسال الرسالة",
      });

    } catch (error) {
      console.error('Error sending message:', error);
      if (!isPremium) {
        await refreshCredits(); // إعادة تحديث الكريديت في حالة الخطأ
      }
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const openWhatsApp = () => {
    if (ad?.whatsapp) {
      const whatsappUrl = `https://wa.me/${ad.whatsapp.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`مرحبا، أنا مهتم بإعلانك: ${ad.title}`)}`;
      window.open(whatsappUrl, '_blank');
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
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 text-green-800 mb-2">
                            <Phone className="w-4 h-4" />
                            <span className="font-medium text-lg" dir="ltr">{ad.phone}</span>
                          </div>
                          {ad.whatsapp && (
                            <button
                              onClick={openWhatsApp}
                              className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <MessageCircle className="w-4 h-4" />
                              محادثة واتساب
                            </button>
                          )}
                          <p className="text-sm text-green-600 mt-2">
                            يمكنك الآن الاتصال بالبائع
                          </p>
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

                    {/* صندوق الرسائل */}
                    <div className="space-y-3">
                      {!showMessageBox ? (
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-sm text-purple-800 mb-2">
                            {isPremium ? 'أرسل رسالة للبائع (مجاناً للمستخدمين المميزين)' : 'أرسل رسالة للبائع (يتطلب 1 كريديت)'}
                          </p>
                          {!isPremium && (
                            <p className="text-sm text-purple-600 mb-3">
                              رصيدك الحالي: {credits} كريديت
                            </p>
                          )}
                          <Button 
                            onClick={() => setShowMessageBox(true)}
                            disabled={!isPremium && credits < 1}
                            variant="outline"
                            className="w-full border-purple-300 text-purple-700 hover:bg-purple-100"
                          >
                            <Send className="w-4 h-4 ml-2" />
                            {isPremium ? 'إرسال رسالة (مجاناً)' : 'إرسال رسالة (1 كريديت)'}
                          </Button>
                        </div>
                      ) : (
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <h4 className="font-medium text-purple-800 mb-3">إرسال رسالة للبائع</h4>
                          <Textarea
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            placeholder="اكتب رسالتك هنا..."
                            className="mb-3"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSendMessage}
                              disabled={isSending || !messageContent.trim() || (!isPremium && credits < 1)}
                              className="flex-1"
                            >
                              <Send className="w-4 h-4 ml-2" />
                              {isSending ? 'جاري الإرسال...' : 
                               isPremium ? 'إرسال (مجاناً)' : 'إرسال (1 كريديت)'}
                            </Button>
                            <Button
                              onClick={() => {
                                setShowMessageBox(false);
                                setMessageContent('');
                              }}
                              variant="outline"
                            >
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
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
                        <MessageCircle className="w-4 h-4" />
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdDetails;
