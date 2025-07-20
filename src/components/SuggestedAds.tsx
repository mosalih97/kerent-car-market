import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Eye, Star, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSuggestedAds } from '@/hooks/useSuggestedAds';
import { useUserBehavior } from '@/hooks/useUserBehavior';

interface SuggestedAdsProps {
  currentAdId?: string;
  brand?: string;
  city?: string;
  limit?: number;
  title?: string;
  className?: string;
}

const SuggestedAds = ({ 
  currentAdId, 
  brand, 
  city, 
  limit = 6, 
  title = "سيارات مقترحة",
  className = ""
}: SuggestedAdsProps) => {
  const navigate = useNavigate();
  const { data: suggestedAds, isLoading } = useSuggestedAds({ currentAdId, brand, city, limit });
  const { trackAdView } = useUserBehavior();

  useEffect(() => {
    console.log('SuggestedAds component rendered:', {
      currentAdId,
      brand,
      city,
      suggestedAds: suggestedAds?.length,
      isLoading
    });
  }, [currentAdId, brand, city, suggestedAds, isLoading]);

  const handleAdClick = (ad: any) => {
    trackAdView(ad);
    navigate(`/ad/${ad.id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SD').format(price / 1000000);
  };

  if (isLoading) {
    return (
      <section className={`py-8 ${className}`}>
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">{title}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse h-48">
                <div className="h-24 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-3">
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!suggestedAds || suggestedAds.length === 0) {
    return null;
  }

  return (
    <section className={`py-8 ${className}`}>
      <div className="container mx-auto px-4">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {suggestedAds.map((ad) => {
            const isPremium = ad.is_premium || ad.profiles?.is_premium;
            const isFeatured = ad.is_featured;
            
            return (
              <Card 
                key={ad.id} 
                className={`group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden h-48 ${
                  isPremium ? 'premium-card ring-2 ring-amber-200' : 
                  isFeatured ? 'featured-card' : 
                  'hover:shadow-md border-gray-200'
                }`}
                onClick={() => handleAdClick(ad)}
              >
                <div className="relative h-24">
                  <img 
                    src={ad.images?.[0] || "https://images.unsplash.com/photo-1549924231-f129b911e442?w=200&h=120&fit=crop"}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Premium/Featured Badges */}
                  <div className="absolute top-1 right-1 flex gap-1">
                    {isPremium && (
                      <Badge className="premium-badge text-xs px-1 py-0.5 h-5">
                        <Crown className="w-2 h-2 ml-1" />
                        مميز
                      </Badge>
                    )}
                    {isFeatured && !isPremium && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-1 py-0.5 h-5">
                        <Star className="w-2 h-2 ml-1" />
                        مُروّج
                      </Badge>
                    )}
                  </div>

                  {/* Views Counter */}
                  <div className="absolute bottom-1 left-1">
                    <Badge variant="outline" className="bg-black/70 text-white border-none text-xs px-1 py-0.5 h-5">
                      <Eye className="w-2 h-2 ml-1" />
                      {ad.views_count}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-3 h-24 flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-800 line-clamp-1 mb-1">
                      {ad.title}
                    </h4>
                    <p className={`font-bold text-sm mb-1 ${
                      isPremium ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      {formatPrice(ad.price)} مليون
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 ml-1" />
                      <span className="truncate">{ad.city}</span>
                    </div>
                    <span>{ad.year}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SuggestedAds;