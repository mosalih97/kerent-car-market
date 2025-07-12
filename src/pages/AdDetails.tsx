
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, Calendar, Eye, Share2, Heart, Car, Fuel, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAds } from "@/hooks/useAds";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Ad = Database['public']['Tables']['ads']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
};

const AdDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchAdDetails(id);
      incrementViewCount(id);
    }
  }, [id]);

  const fetchAdDetails = async (adId: string) => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          profiles!inner(*)
        `)
        .eq('id', adId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setAd(data as Ad);
    } catch (error) {
      console.error('Error fetching ad details:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async (adId: string) => {
    try {
      // Increment view count
      await supabase
        .from('ads')
        .update({ views_count: supabase.raw('views_count + 1') })
        .eq('id', adId);

      // Track the view
      await supabase
        .from('ad_views')
        .insert({ ad_id: adId });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SD').format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'منذ يوم واحد';
    if (diffDays <= 7) return `منذ ${diffDays} أيام`;
    if (diffDays <= 30) return `منذ ${Math.ceil(diffDays / 7)} أسابيع`;
    return `منذ ${Math.ceil(diffDays / 30)} شهر`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل الإعلان...</p>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">الإعلان غير موجود</h2>
          <p className="text-gray-600 mb-4">لم يتم العثور على الإعلان المطلوب</p>
          <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  const images = ad.images && ad.images.length > 0 ? ad.images : ["https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&h=600&fit=crop"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              العودة
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images Section */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden mb-6">
              <div className="relative">
                <img 
                  src={images[currentImageIndex]}
                  alt={ad.title}
                  className="w-full h-96 lg:h-[500px] object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  {ad.is_featured && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                      مميز
                    </Badge>
                  )}
                  {ad.is_premium && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                      بريميوم
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-gray-700">
                    <Eye className="w-3 h-3 ml-1" />
                    {ad.views_count}
                  </Badge>
                </div>
              </div>
              
              {/* Image thumbnails */}
              {images.length > 1 && (
                <div className="p-4 border-t">
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img 
                          src={image} 
                          alt={`صورة ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">تفاصيل الإعلان</h3>
                <p className="text-gray-600 leading-relaxed">
                  {ad.description || 'لا توجد تفاصيل إضافية لهذا الإعلان.'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Price & Title */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">{ad.title}</h1>
                  <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">
                    {formatPrice(ad.price)} <span className="text-lg text-gray-500">جنيه سوداني</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{ad.city}</span>
                    <span>•</span>
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(ad.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Car Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  مواصفات السيارة
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-500 text-sm mb-1">الماركة</p>
                    <p className="font-semibold text-gray-800 capitalize">{ad.brand}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-500 text-sm mb-1">الموديل</p>
                    <p className="font-semibold text-gray-800">{ad.model}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-500 text-sm mb-1">السنة</p>
                    <p className="font-semibold text-gray-800">{ad.year}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-500 text-sm mb-1">المسافة</p>
                    <p className="font-semibold text-gray-800">
                      {ad.mileage ? `${formatPrice(ad.mileage)} كم` : 'غير محدد'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                    <p className="text-gray-500 text-sm mb-1">الحالة</p>
                    <p className="font-semibold text-gray-800">
                      {ad.condition === 'new' ? 'جديدة' :
                       ad.condition === 'excellent' ? 'ممتازة' :
                       ad.condition === 'good' ? 'جيدة' :
                       ad.condition === 'fair' ? 'مقبولة' : 'مستعملة'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-blue-600">
                      {(ad.profiles as any)?.full_name?.charAt(0) || 'م'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                      {(ad.profiles as any)?.full_name || 'مستخدم'}
                    </h4>
                    {(ad.profiles as any)?.is_premium && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        موثق ✓
                      </p>
                    )}
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  onClick={() => window.location.href = `tel:${ad.phone}`}
                >
                  اتصل الآن: {ad.phone}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdDetails;
