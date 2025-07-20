import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuggestedAds } from '@/hooks/useSuggestedAds';
import { useUpdateUserBehavior } from '@/hooks/usePremiumAds';
import { Eye, MapPin } from 'lucide-react';

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

  console.log('SuggestedAds component rendered:', {
    currentAdId,
    brand,
    city,
    suggestedAds: suggestedAds?.length,
    isLoading
  });

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
      <div className={`mt-6 ${className}`}>
        <h3 className="text-xl font-bold mb-4 text-right text-gray-800">إعلانات مقترحة</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-lg overflow-hidden shadow-sm bg-white animate-pulse">
              <div className="h-32 w-full bg-gray-200"></div>
              <div className="p-3">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
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
    <div className={`mt-6 ${className}`}>
      <h3 className="text-xl font-bold mb-4 text-right text-gray-800">إعلانات مقترحة</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {suggestedAds.map((ad) => (
          <div 
            key={ad.id}
            className="border rounded-lg overflow-hidden shadow-sm bg-white text-right cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
            onClick={() => handleAdClick(ad)}
          >
            <div className="relative">
              <img 
                src={ad.images?.[0] || "https://images.unsplash.com/photo-1549924231-f129b911e442?w=300&h=200&fit=crop"}
                alt={ad.title}
                className="h-32 w-full object-cover"
              />
              
              {/* شارات الإعلان */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {ad.is_featured && (
                  <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs px-2 py-1 rounded-md font-medium shadow-md">
                    مميز
                  </span>
                )}
                {ad.is_premium && (
                  <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-2 py-1 rounded-md font-medium shadow-md">
                    بريميوم
                  </span>
                )}
              </div>

              {/* عداد المشاهدات */}
              <div className="absolute bottom-2 left-2">
                <div className="flex items-center gap-1 text-white text-xs bg-black/70 px-2 py-1 rounded-md">
                  <Eye className="w-3 h-3" />
                  {ad.views_count}
                </div>
              </div>
            </div>

            <div className="p-3">
              <h4 className="text-sm font-bold truncate text-gray-800 mb-1">
                {ad.title}
              </h4>
              <p className="text-lg font-bold text-green-600 mb-1">
                {formatPrice(ad.price)} مليون جنيه
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {ad.city}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedAds;