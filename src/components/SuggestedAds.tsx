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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-3">
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
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
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {suggestedAds.map((ad) => (
          <Card 
            key={ad.id}
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md overflow-hidden bg-white"
            onClick={() => handleAdClick(ad)}
          >
            <div className="relative">
              <img 
                src={ad.images?.[0] || "https://images.unsplash.com/photo-1549924231-f129b911e442?w=300&h=200&fit=crop"}
                alt={ad.title}
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* شارات الإعلان */}
              <div className="absolute top-2 right-2 flex gap-1">
                {ad.is_featured && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs px-1.5 py-0.5">
                    <Star className="w-2.5 h-2.5 ml-1" />
                    مميز
                  </Badge>
                )}
                {ad.is_premium && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-1.5 py-0.5">
                    <Crown className="w-2.5 h-2.5 ml-1" />
                    بريميوم
                  </Badge>
                )}
              </div>

              {/* عداد المشاهدات */}
              <div className="absolute bottom-2 left-2">
                <div className="flex items-center gap-1 text-white text-xs bg-black/50 px-2 py-1 rounded">
                  <Eye className="w-3 h-3" />
                  {ad.views_count}
                </div>
              </div>
            </div>

            <CardContent className="p-3">
              <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 leading-tight">
                {ad.title}
              </h4>
              
              <div className="space-y-2">
                <p className="text-lg font-bold text-green-600">
                  {formatPrice(ad.price)} مليون جنيه
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{ad.city}</span>
                  </div>
                  <span className="font-medium text-blue-600">{ad.brand}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">السنة: {ad.year}</span>
                  <span className="text-gray-500">
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