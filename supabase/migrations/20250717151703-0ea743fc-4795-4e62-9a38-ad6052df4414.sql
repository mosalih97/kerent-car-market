-- إنشاء جدول لتتبع اشتراكات المستخدمين المميزين
CREATE TABLE public.premium_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscription_type TEXT NOT NULL DEFAULT 'monthly',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can view their own subscriptions" 
ON public.premium_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" 
ON public.premium_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.premium_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- إنشاء فانكشن للتحقق من صحة الاشتراك المميز
CREATE OR REPLACE FUNCTION public.check_premium_status(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  has_active_subscription boolean := false;
BEGIN
  -- التحقق من وجود اشتراك نشط وغير منتهي الصلاحية
  SELECT EXISTS (
    SELECT 1
    FROM public.premium_subscriptions
    WHERE user_id = _user_id
      AND is_active = true
      AND expires_at > now()
  ) INTO has_active_subscription;
  
  -- تحديث حالة المستخدم في جدول profiles
  UPDATE public.profiles
  SET 
    is_premium = has_active_subscription,
    user_type = CASE 
      WHEN has_active_subscription THEN 'premium'::user_type 
      ELSE 'free'::user_type 
    END,
    updated_at = now()
  WHERE id = _user_id;
  
  RETURN has_active_subscription;
END;
$function$;

-- إنشاء فانكشن لتنظيف الاشتراكات المنتهية الصلاحية (يتم تشغيلها يومياً)
CREATE OR REPLACE FUNCTION public.cleanup_expired_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- إلغاء تفعيل الاشتراكات المنتهية الصلاحية
  UPDATE public.premium_subscriptions
  SET 
    is_active = false,
    updated_at = now()
  WHERE expires_at < now() AND is_active = true;
  
  -- تحديث حالة المستخدمين الذين انتهت اشتراكاتهم
  UPDATE public.profiles
  SET 
    is_premium = false,
    user_type = 'free'::user_type,
    updated_at = now()
  WHERE id IN (
    SELECT DISTINCT user_id
    FROM public.premium_subscriptions
    WHERE expires_at < now() AND is_active = false
  );
END;
$function$;

-- إنشاء جدول لتتبع مواضع الإعلانات
CREATE TABLE public.ad_placements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إدراج مواضع الإعلانات الافتراضية
INSERT INTO public.ad_placements (name, description) VALUES
('header_banner', 'إعلان في أعلى الصفحة'),
('sidebar_ad', 'إعلان في الشريط الجانبي'),
('between_ads', 'إعلان بين الإعلانات'),
('footer_banner', 'إعلان في أسفل الصفحة'),
('ad_details_top', 'إعلان في أعلى صفحة تفاصيل الإعلان'),
('ad_details_bottom', 'إعلان في أسفل صفحة تفاصيل الإعلان');

-- تفعيل RLS لجدول مواضع الإعلانات
ALTER TABLE public.ad_placements ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للجميع بقراءة مواضع الإعلانات النشطة
CREATE POLICY "Everyone can view active ad placements" 
ON public.ad_placements 
FOR SELECT 
USING (is_active = true);

-- trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_premium_subscriptions_updated_at
  BEFORE UPDATE ON public.premium_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ad_placements_updated_at
  BEFORE UPDATE ON public.ad_placements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();