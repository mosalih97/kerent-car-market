import { useEffect, useRef } from 'react';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { useAuth } from '@/hooks/useAuth';

interface GoogleAdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  adLayout?: string;
  style?: React.CSSProperties;
  className?: string;
  placement: string;
}

const GoogleAdSense = ({ 
  adSlot, 
  adFormat = 'auto', 
  adLayout,
  style = { display: 'block' },
  className = '',
  placement
}: GoogleAdSenseProps) => {
  const { user } = useAuth();
  const { shouldShowAds, isLoading } = usePremiumStatus();
  const adRef = useRef<HTMLModElement>(null);
  const adPushed = useRef(false);

  useEffect(() => {
    // عدم إظهار الإعلانات للمستخدمين المميزين أو في حالة التحميل
    if (isLoading || !shouldShowAds || !user) {
      return;
    }

    const pushAd = () => {
      try {
        if (typeof window !== 'undefined' && (window as any).adsbygoogle && !adPushed.current) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          adPushed.current = true;
        }
      } catch (error) {
        console.error('خطأ في تحميل AdSense:', error);
      }
    };

    // إضافة سكريبت AdSense إذا لم يتم تحميله بعد
    const loadAdSenseScript = () => {
      if (!document.querySelector('script[src*="adsbygoogle"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXXXXXXXX'); // ضع رقم الناشر هنا
        document.head.appendChild(script);
        
        script.onload = () => {
          pushAd();
        };
      } else {
        pushAd();
      }
    };

    // تأخير قصير للتأكد من تحميل DOM
    const timer = setTimeout(loadAdSenseScript, 100);

    return () => {
      clearTimeout(timer);
      adPushed.current = false;
    };
  }, [shouldShowAds, isLoading, user, adSlot]);

  // عدم عرض أي شيء للمستخدمين المميزين
  if (isLoading || !shouldShowAds || !user) {
    return null;
  }

  return (
    <div className={`google-adsense-container ${className}`} data-placement={placement}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // ضع رقم الناشر هنا
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default GoogleAdSense;