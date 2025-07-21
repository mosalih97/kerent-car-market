import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface ExternalAdBannerProps {
  className?: string;
}

const ExternalAdBanner = ({ className = "" }: ExternalAdBannerProps) => {
  // مجموعة من الإعلانات الخارجية التجريبية
  const externalAds = [
    {
      id: 1,
      title: "تأمين السيارات - خصم 30%",
      description: "احم سيارتك بأفضل العروض",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop",
      link: "#",
      badge: "إعلان"
    },
    {
      id: 2,
      title: "قطع غيار أصلية",
      description: "جميع أنواع قطع الغيار متوفرة",
      image: "https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=400&h=200&fit=crop",
      link: "#",
      badge: "إعلان"
    },
    {
      id: 3,
      title: "خدمات صيانة متخصصة",
      description: "صيانة شاملة بضمان وجودة",
      image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=200&fit=crop",
      link: "#",
      badge: "إعلان"
    },
    {
      id: 4,
      title: "تمويل السيارات بأقساط مريحة",
      description: "احصل على سيارة أحلامك الآن",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop",
      link: "#",
      badge: "إعلان"
    }
  ];

  // اختيار إعلان عشوائي
  const [currentAd] = useState(() => 
    externalAds[Math.floor(Math.random() * externalAds.length)]
  );

  return (
    <div className={`my-6 ${className}`}>
      <Card className="overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-md transition-all duration-300">
        <div className="flex items-center h-24 relative">
          {/* Badge */}
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
              {currentAd.badge}
            </Badge>
          </div>

          {/* Image */}
          <div className="w-24 h-full flex-shrink-0">
            <img 
              src={currentAd.image} 
              alt={currentAd.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 px-4 py-3">
            <h4 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">
              {currentAd.title}
            </h4>
            <p className="text-gray-600 text-xs line-clamp-1 mb-2">
              {currentAd.description}
            </p>
            <button className="inline-flex items-center text-blue-600 text-xs font-medium hover:text-blue-700 transition-colors">
              <span>اعرف المزيد</span>
              <ExternalLink className="w-3 h-3 mr-1" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExternalAdBanner;