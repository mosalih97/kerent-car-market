import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuggestedAds } from '@/hooks/useSuggestedAds';
import { useUpdateUserBehavior } from '@/hooks/usePremiumAds';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Eye, Star, Crown } from 'lucide-react';

interface SuggestedAdsProps {
  currentAdId: string;
  brand?: string;
  city?: string;
  className?: string;
}

const SuggestedAds: React.FC<SuggestedAdsProps> = ({ 
  currentAdId, 
  brand, 
  city, 
  className = '' 
}) => {
  const navigate = useNavigate();
  const { data: suggestedAds, isLoading } = useSuggestedAds(currentAdId, brand, city, 6);
  const updateBehavior = useUpdateUserBehavior();

  const handleAdClick = (ad: any) => {
    // تحديث سلوك المستخدم
    updateBehavior.mutate({
      viewedAdBrand: ad.brand,
      viewedAdPrice: ad.price,
      viewedAdCity: ad.city,
      viewedAdCondition: ad.condition,
      isPremiumAd: ad.is_premium,
      isFeaturedAd: ad.is_featured
    });

    navigate(`/ad/${ad.id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SD').format(price / 1000000);
  };

  if (isLoading) {
    return (
      <div className={`suggested-ads ${className}`}>
        <h3 className="text-xl font-bold text-gray-800 mb-6">إعلانات مقترحة</h3>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse border border-gray-100">
              <div className="h-16 sm:h-20 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-1.5">
                <div className="h-2 bg-gray-200 rounded mb-1"></div>
                <div className="h-2 bg-gray-200 rounded mb-1"></div>
                <div className="h-1.5 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!suggestedAds || suggestedAds.length === 0) {
    return null;
  }

  return (
    <div className={`suggested-ads ${className}`}>
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-500" />
        إعلانات مقترحة لك
      </h3>
      
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {suggestedAds.map((ad) => (
          <Card 
            key={ad.id}
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-primary/20 overflow-hidden bg-white"
            onClick={() => handleAdClick(ad)}
          >
            <div className="relative">
              <img 
                src={ad.images?.[0] || "https://images.unsplash.com/photo-1549924231-f129b911e442?w=300&h=200&fit=crop"}
                alt={ad.title}
                className="w-full h-16 sm:h-20 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* شارات الإعلان */}
              <div className="absolute top-1 right-1 flex flex-col gap-0.5">
                {ad.is_featured && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[8px] px-1 py-0.5 h-auto">
                    <Star className="w-1.5 h-1.5 ml-0.5" />
                    مميز
                  </Badge>
                )}
                {ad.is_premium && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-[8px] px-1 py-0.5 h-auto">
                    <Crown className="w-1.5 h-1.5 ml-0.5" />
                    بريميوم
                  </Badge>
                )}
              </div>

              {/* عداد المشاهدات */}
              <div className="absolute bottom-1 left-1">
                <div className="flex items-center gap-0.5 text-white text-[8px] bg-black/60 px-1 py-0.5 rounded">
                  <Eye className="w-2 h-2" />
                  {ad.views_count}
                </div>
              </div>
            </div>

            <CardContent className="p-1.5">
              <h4 className="font-semibold text-gray-800 text-[10px] sm:text-xs mb-1 line-clamp-1 leading-tight">
                {ad.title}
              </h4>
              
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-green-600">
                  {formatPrice(ad.price)}م.ج
                </p>
                
                <div className="flex items-center justify-between text-[8px] sm:text-[10px] text-gray-500">
                  <div className="flex items-center gap-0.5">
                    <MapPin className="w-2 h-2" />
                    <span className="truncate">{ad.city}</span>
                  </div>
                  <span className="font-medium text-blue-600 truncate">{ad.brand}</span>
                </div>
                
                <div className="flex items-center justify-between text-[8px] text-gray-400">
                  <span>{ad.year}</span>
                  <span className="truncate">
                    {ad.condition === 'new' ? 'جديد' : 
                     ad.condition === 'excellent' ? 'ممتاز' :
                     ad.condition === 'good' ? 'جيد' :
                     ad.condition === 'fair' ? 'مقبول' : 'مستعمل'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* رسالة توضيحية */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          الإعلانات المقترحة بناءً على اهتماماتك وتفضيلاتك
        </p>
      </div>
    </div>
  );
};

export default SuggestedAds;