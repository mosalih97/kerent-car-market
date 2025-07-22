import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSavedAds, useAdSaveStatus } from '@/hooks/useSavedAds';
import { useToast } from '@/hooks/use-toast';

interface SaveAdButtonProps {
  adId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const SaveAdButton = ({ 
  adId, 
  variant = 'outline', 
  size = 'sm',
  className = ''
}: SaveAdButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveAd, unsaveAd, isSaving, isUnsaving } = useSavedAds();
  const { data: isSaved = false } = useAdSaveStatus(adId);

  const handleSaveToggle = () => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول لحفظ الإعلانات",
        variant: "destructive",
      });
      return;
    }

    if (isSaved) {
      unsaveAd(adId);
    } else {
      saveAd(adId);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSaveToggle}
      disabled={isSaving || isUnsaving}
      className={`${className}`}
    >
      <Heart 
        className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} 
      />
      {size !== 'icon' && (
        <span className="mr-2">
          {isSaved ? 'محفوظ' : 'حفظ'}
        </span>
      )}
    </Button>
  );
};