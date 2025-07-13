-- إنشاء جدول لحدود الإعلانات الشهرية
CREATE TABLE IF NOT EXISTS public.user_ad_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ads_count INTEGER NOT NULL DEFAULT 0,
  max_ads INTEGER NOT NULL DEFAULT 5,
  last_reset DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تمكين RLS
ALTER TABLE public.user_ad_limits ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان
CREATE POLICY "Users can view own ad limits" 
ON public.user_ad_limits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own ad limits" 
ON public.user_ad_limits 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ad limits" 
ON public.user_ad_limits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- إنشاء function لفحص حدود الإعلانات
CREATE OR REPLACE FUNCTION public.check_ad_limit(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_limits RECORD;
  user_is_premium boolean := false;
BEGIN
  -- فحص إذا كان المستخدم مميز
  SELECT is_premium INTO user_is_premium
  FROM public.profiles
  WHERE id = _user_id;
  
  -- المستخدمون المميزون لا يوجد لديهم حدود
  IF user_is_premium = true THEN
    RETURN true;
  END IF;
  
  -- الحصول على حدود المستخدم أو إنشاؤها
  SELECT * INTO user_limits
  FROM public.user_ad_limits
  WHERE user_id = _user_id;
  
  -- إنشاء سجل جديد إذا لم يوجد
  IF NOT FOUND THEN
    INSERT INTO public.user_ad_limits (user_id, ads_count, max_ads, last_reset)
    VALUES (_user_id, 0, 5, CURRENT_DATE);
    RETURN true;
  END IF;
  
  -- فحص إذا كان يجب إعادة تعيين العداد
  IF user_limits.last_reset < DATE_TRUNC('month', CURRENT_DATE) THEN
    UPDATE public.user_ad_limits
    SET ads_count = 0, 
        last_reset = CURRENT_DATE,
        updated_at = now()
    WHERE user_id = _user_id;
    RETURN true;
  END IF;
  
  -- فحص إذا كان المستخدم وصل للحد الأقصى
  RETURN user_limits.ads_count < user_limits.max_ads;
END;
$$;

-- إنشاء function لزيادة عداد الإعلانات
CREATE OR REPLACE FUNCTION public.increment_ad_count(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- تحديث العداد أو إنشاء سجل جديد
  INSERT INTO public.user_ad_limits (user_id, ads_count, max_ads, last_reset)
  VALUES (_user_id, 1, 5, CURRENT_DATE)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    ads_count = user_ad_limits.ads_count + 1,
    updated_at = now();
END;
$$;

-- إنشاء trigger لزيادة العداد عند إضافة إعلان
CREATE OR REPLACE FUNCTION public.handle_new_ad()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- زيادة عداد الإعلانات للمستخدم
  PERFORM public.increment_ad_count(NEW.user_id);
  RETURN NEW;
END;
$$;

-- إنشاء trigger
DROP TRIGGER IF EXISTS on_ad_created ON public.ads;
CREATE TRIGGER on_ad_created
  AFTER INSERT ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_ad();

-- إنشاء function لإعادة تعيين الحدود الشهرية (سيتم استخدامها بواسطة cron job)
CREATE OR REPLACE FUNCTION public.reset_monthly_limits()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- إعادة تعيين عدد الإعلانات لجميع المستخدمين في بداية كل شهر
  UPDATE public.user_ad_limits
  SET ads_count = 0, 
      last_reset = CURRENT_DATE,
      updated_at = now()
  WHERE last_reset < DATE_TRUNC('month', CURRENT_DATE);
END;
$$;