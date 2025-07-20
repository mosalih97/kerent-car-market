import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MapPin, Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdCardProps {
  ad: {
    id: string;
    title: string;
    price: number;
    brand: string;
    city: string;
    images?: string[];
    is_featured?: boolean;
    is_premium?: boolean;
    views_count: number;
    created_at: string;
    condition: string;
    year: number;
  };
  size?: 'small' | 'medium' | 'large';
  onClick?: (ad: any) => void;
  showActions?: boolean;
  onEdit?: (ad: any) => void;
  onDelete?: (ad: any) => void;
  isDeleting?: boolean;
}

const AdCard: React.FC<AdCardProps> = ({ 
  ad, 
  size = 'medium', 
  onClick, 
  showActions = false, 
  onEdit, 
  onDelete, 
  isDeleting = false 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(ad);
    } else {
      navigate(`/ad/${ad.id}`);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SD').format(price / 1000000);
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

  const getCardStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: "border rounded-lg overflow-hidden shadow-sm bg-white text-right cursor-pointer hover:shadow-md transition-shadow duration-200",
          image: "h-24 w-full object-cover",
          content: "p-2",
          title: "text-sm font-semibold truncate text-gray-800",
          price: "text-xs text-green-600 font-semibold",
          location: "text-xs text-gray-500",
          badge: "text-[6px] px-1 py-0.5 rounded",
          viewCount: "text-[6px] bg-black/60 px-1 py-0.5 rounded"
        };
      case 'large':
        return {
          container: "group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-white cursor-pointer rounded-lg",
          image: "w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300",
          content: "p-6",
          title: "text-xl font-bold text-gray-800 mb-3 line-clamp-2",
          price: "text-2xl font-bold text-green-600 mb-4",
          location: "text-sm text-gray-600",
          badge: "text-sm px-3 py-1 rounded-full font-medium",
          viewCount: "text-sm bg-black/60 px-2 py-1 rounded"
        };
      default: // medium
        return {
          container: "border rounded-lg overflow-hidden shadow-sm bg-white text-right cursor-pointer hover:shadow-lg transition-shadow duration-200",
          image: "h-32 w-full object-cover",
          content: "p-3",
          title: "text-base font-semibold text-gray-800 mb-2 line-clamp-1",
          price: "text-lg font-bold text-green-600 mb-2",
          location: "text-sm text-gray-500",
          badge: "text-[8px] px-2 py-1 rounded",
          viewCount: "text-[8px] bg-black/60 px-1.5 py-0.5 rounded"
        };
    }
  };

  const styles = getCardStyles();

  return (
    <div className={styles.container} onClick={handleClick}>
      <div className="relative">
        <img 
          src={ad.images?.[0] || "https://images.unsplash.com/photo-1549924231-f129b911e442?w=300&h=200&fit=crop"}
          alt={ad.title}
          className={styles.image}
        />
        
        {/* شارات الإعلان */}
        <div className="absolute top-1 right-1 flex flex-col gap-0.5">
          {ad.is_featured && (
            <span className={`bg-amber-500 text-white ${styles.badge}`}>
              مميز
            </span>
          )}
          {ad.is_premium && (
            <span className={`bg-purple-500 text-white ${styles.badge}`}>
              بريميوم
            </span>
          )}
        </div>

        {/* عداد المشاهدات */}
        <div className="absolute bottom-1 left-1">
          <div className={`flex items-center gap-0.5 text-white ${styles.viewCount}`}>
            <Eye className="w-3 h-3" />
            {ad.views_count}
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <h4 className={styles.title}>
          {ad.title}
        </h4>
        
        <p className={styles.price}>
          {formatPrice(ad.price)} م.ج
        </p>
        
        <div className="flex items-center justify-between text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className={styles.location}>{ad.city}</span>
          </div>
          <span className={styles.location}>{ad.brand}</span>
        </div>
        
        {size !== 'small' && (
          <div className="flex items-center justify-between text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">{formatDate(ad.created_at)}</span>
            </div>
            <span className="text-xs">
              {ad.condition === 'new' ? 'جديد' : 
               ad.condition === 'excellent' ? 'ممتاز' :
               ad.condition === 'good' ? 'جيد' :
               ad.condition === 'fair' ? 'مقبول' : 'مستعمل'}
            </span>
          </div>
        )}
        
        {/* أزرار التحكم */}
        {showActions && (
          <div className="flex gap-2 mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => onEdit?.(ad)}
            >
              <Edit className="w-4 h-4 ml-2" />
              تعديل
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => onDelete?.(ad)}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 ml-2" />
              حذف
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdCard;