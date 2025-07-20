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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border rounded-lg overflow-hidden shadow-sm bg-white animate-pulse">
            <div className="h-24 w-full bg-gray-200"></div>
            <div className="p-2">
              <div className="h-3 bg-gray-200 rounded mb-1"></div>
              <div className="h-2 bg-gray-200 rounded mb-1"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          </div>
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
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {suggestedAds.map((ad) => (
          <div 
            key={ad.id}
            className="border rounded-lg overflow-hidden shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => handleAdClick(ad)}
          >
            <div className="relative">
              <img 
                src={ad.images?.[0] || "https://images.unsplash.com/photo-1549924231-f129b911e442?w=300&h=200&fit=crop"}
                alt={ad.title}
                className="h-24 w-full object-cover"
              />
              
              {/* شارات الإعلان */}
              <div className="absolute top-1 right-1 flex flex-col gap-0.5">
                {ad.is_featured && (
                  <span className="bg-amber-500 text-white text-[6px] px-1 py-0.5 rounded">
                    مميز
                  </span>
                )}
                {ad.is_premium && (
                  <span className="bg-purple-500 text-white text-[6px] px-1 py-0.5 rounded">
                    بريميوم
                  </span>
                )}
              </div>

              {/* عداد المشاهدات */}
              <div className="absolute bottom-1 left-1">
                <div className="flex items-center gap-0.5 text-white text-[6px] bg-black/60 px-1 py-0.5 rounded">
                  <Eye className="w-2 h-2" />
                  {ad.views_count}
                </div>
              </div>
            </div>

            <div className="p-2 text-right">
              <h4 className="text-sm font-semibold truncate text-gray-800">
                {ad.title}
              </h4>
              <p className="text-xs text-green-600 font-semibold">
                {formatPrice(ad.price)}م.ج
              </p>
              <p className="text-xs text-gray-500">{ad.city}</p>
            </div>
          </div>
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