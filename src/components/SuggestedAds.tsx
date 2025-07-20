import React from 'react';
import { useSuggestedAds } from '@/hooks/useSuggestedAds';
import { useUpdateUserBehavior } from '@/hooks/usePremiumAds';
import AdCard from '@/components/AdCard';

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
  };

  if (isLoading) {
    return (
      <div className={`mt-6 ${className}`}>
        <h3 className="text-lg font-bold mb-2 text-right">إعلانات مقترحة</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
    <div className={`mt-6 ${className}`}>
      <h3 className="text-lg font-bold mb-2 text-right">إعلانات مقترحة</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {suggestedAds.map((ad) => (
          <AdCard 
            key={ad.id}
            ad={ad}
            size="small"
            onClick={handleAdClick}
          />
        ))}
      </div>
    </div>
  );
};

export default SuggestedAds;