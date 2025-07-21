import { memo } from 'react';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdComponentProps {
  placement: 'header_banner' | 'sidebar_ad' | 'between_ads' | 'footer_banner' | 'ad_details_top' | 'ad_details_bottom' | 'sponsored_small';
  className?: string;
  size?: 'small' | 'medium' | 'large';
  adContent?: React.ReactNode;
}

const AdComponent = memo(({ placement, className = '', size = 'medium', adContent }: AdComponentProps) => {
  const { user } = useAuth();
  const { shouldShowAds, isLoading } = usePremiumStatus();

  // عدم إظهار الإعلانات في حالة التحميل أو للمستخدمين المميزين
  if (isLoading || !shouldShowAds || !user) {
    return null;
  }

  const sizeClasses = {
    small: 'h-20 min-h-[80px]',
    medium: 'h-32 min-h-[128px]',
    large: 'h-48 min-h-[192px]'
  };

  const placementTitles = {
    header_banner: 'إعلان ممول',
    sidebar_ad: 'إعلان',
    between_ads: 'إعلان ممول',
    footer_banner: 'إعلان',
    ad_details_top: 'إعلان ممول',
    ad_details_bottom: 'إعلان ممول',
    sponsored_small: 'إعلان مدفوع'
  };

  return (
    <div className={`w-full ${className}`} data-ad-placement={placement}>
      <Card className={`${sizeClasses[size]} border-dashed border-muted-foreground/30 relative overflow-hidden`}>
        <CardContent className="p-4 h-full flex flex-col items-center justify-center bg-muted/20">
          {adContent ? (
            adContent
          ) : (
            <>
              <Badge variant="outline" className="mb-2 text-xs">
                {placementTitles[placement]}
              </Badge>
              <div className="text-center text-muted-foreground">
                <div className="text-sm font-medium mb-1">مساحة إعلانية</div>
                <div className="text-xs">
                  {size === 'large' && '728 × 90 / 970 × 250'}
                  {size === 'medium' && '300 × 250 / 336 × 280'}
                  {size === 'small' && '320 × 50 / 728 × 90'}
                </div>
              </div>
              {/* Google AdSense Placeholder */}
              <div className="absolute inset-0 opacity-0 hover:opacity-5 transition-opacity">
                <div 
                  className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10"
                  data-ad-slot-ready="true"
                />
              </div>
            </>
          )}
          
          {/* معرف مميز لكل موضع إعلان */}
          <div className="absolute top-1 right-1 text-[10px] text-muted-foreground/50 font-mono">
            {placement}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

AdComponent.displayName = 'AdComponent';

export default AdComponent;