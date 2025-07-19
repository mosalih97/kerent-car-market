import React, { memo, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { usePremiumAds, useRecordImpression, useUpdateUserBehavior } from '@/hooks/usePremiumAds';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';

interface SmartAdComponentProps {
  placement: 'header_banner' | 'sidebar_ad' | 'between_ads' | 'footer_banner' | 'ad_details_top' | 'ad_details_bottom';
  className?: string;
  size?: 'small' | 'medium' | 'large';
  limit?: number;
}

const SmartAdComponent = memo(({ placement, className = '', size = 'medium', limit = 3 }: SmartAdComponentProps) => {
  const { user } = useAuth();
  const { shouldShowAds, isLoading: isPremiumLoading } = usePremiumStatus();
  const { data: premiumAds, isLoading } = usePremiumAds(placement, limit);
  const recordImpression = useRecordImpression();
  const updateBehavior = useUpdateUserBehavior();
  const navigate = useNavigate();
  const { sessionId } = useSession();

  // تسجيل عرض الإعلانات عند التحميل
  useEffect(() => {
    if (premiumAds && premiumAds.length > 0 && shouldShowAds) {
      premiumAds.forEach(ad => {
        recordImpression.mutate({
          adId: ad.ad_id,
          placement,
          sessionId: sessionId
        });
      });
    }
  }, [premiumAds, placement, shouldShowAds]);

  // إخفاء الإعلانات للمستخدمين المميزين أو في حالة التحميل
  if (isPremiumLoading || !shouldShowAds || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`smart-ad-loading ${className}`}>
        <div className="animate-pulse">
          <div className={`bg-gray-200 rounded-lg ${getSizeClasses(size).container}`}></div>
        </div>
      </div>
    );
  }

  if (!premiumAds || premiumAds.length === 0) {
    return null;
  }

  const handleAdClick = (ad: any) => {
    // تحديث سلوك المستخدم
    updateBehavior.mutate({
      viewedAdBrand: ad.brand,
      viewedAdPrice: ad.price,
      viewedAdCity: ad.city,
      isPremiumAd: true,
      isFeaturedAd: true
    });

    // الانتقال لصفحة التفاصيل
    navigate(`/ad/${ad.ad_id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SD').format(price / 1000000);
  };

  const sizeConfig = getSizeClasses(size);

  return (
    <div className={`smart-ad-component ${className}`} data-placement={placement}>
      <div className="text-center mb-4">
        <Badge variant="outline" className="text-xs font-medium">
          <Crown className="w-3 h-3 ml-1" />
          إعلانات مميزة
        </Badge>
      </div>
      
      <div className={`grid gap-4 ${sizeConfig.grid}`}>
        {premiumAds.map((ad) => (
          <Card 
            key={ad.ad_id} 
            className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 ${sizeConfig.card}`}
            onClick={() => handleAdClick(ad)}
          >
            <div className="relative">
              <img 
                src={ad.images?.[0] || "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop"}
                alt={ad.title}
                className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${sizeConfig.image}`}
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs">
                  <Star className="w-3 h-3 ml-1" />
                  مميز
                </Badge>
                <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs">
                  <Crown className="w-3 h-3 ml-1" />
                  بريميوم
                </Badge>
              </div>
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                  نقاط الأولوية: {Math.round(ad.priority_score)}
                </Badge>
              </div>
            </div>

            <CardContent className={`${sizeConfig.content}`}>
              <h3 className={`font-bold text-gray-800 mb-2 line-clamp-2 ${sizeConfig.title}`}>
                {ad.title}
              </h3>
              
              <div className={`space-y-2 ${sizeConfig.details}`}>
                <p className="text-xl font-bold text-green-600">
                  {formatPrice(ad.price)} مليون جنيه
                </p>
                
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 ml-1" />
                  <span className="text-sm">{ad.city}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600">{ad.brand}</span>
                  <Badge variant="outline" className="text-xs">
                    عدالة: {Math.round(ad.fairness_score)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});

const getSizeClasses = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        container: 'h-32',
        grid: 'grid-cols-1',
        card: 'max-w-sm',
        image: 'h-24 rounded-t-lg',
        content: 'p-3',
        title: 'text-sm',
        details: 'text-xs'
      };
    case 'large':
      return {
        container: 'h-64',
        grid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        card: '',
        image: 'h-48 rounded-t-lg',
        content: 'p-6',
        title: 'text-lg',
        details: 'text-base'
      };
    default: // medium
      return {
        container: 'h-48',
        grid: 'grid-cols-1 md:grid-cols-2',
        card: '',
        image: 'h-32 rounded-t-lg',
        content: 'p-4',
        title: 'text-base',
        details: 'text-sm'
      };
  }
};

SmartAdComponent.displayName = 'SmartAdComponent';

export default SmartAdComponent;