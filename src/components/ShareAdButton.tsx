import { useState } from 'react';
import { Share2, Facebook, MessageCircle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface ShareAdButtonProps {
  adId: string;
  adTitle: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const ShareAdButton = ({ 
  adId, 
  adTitle, 
  variant = 'outline', 
  size = 'sm',
  className = ''
}: ShareAdButtonProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const adUrl = `${window.location.origin}/ad/${adId}`;
  const shareText = `شاهد هذا الإعلان: ${adTitle}`;

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(adUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${adUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(adUrl);
      setCopied(true);
      toast({
        title: "تم نسخ الرابط",
        description: "تم نسخ رابط الإعلان إلى الحافظة",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "خطأ في النسخ",
        description: "لا يمكن نسخ الرابط. حاول مرة أخرى",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
        >
          <Share2 className="w-4 h-4" />
          {size !== 'icon' && <span className="mr-2">مشاركة</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={shareOnFacebook} className="cursor-pointer">
          <Facebook className="w-4 h-4 ml-2 text-blue-600" />
          مشاركة على فيسبوك
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnWhatsApp} className="cursor-pointer">
          <MessageCircle className="w-4 h-4 ml-2 text-green-600" />
          مشاركة على واتساب
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink} className="cursor-pointer">
          {copied ? (
            <Check className="w-4 h-4 ml-2 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 ml-2" />
          )}
          {copied ? 'تم النسخ' : 'نسخ الرابط'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};