-- إنشاء جدول لتتبع سلوك المستخدم وتفضيلاته
CREATE TABLE public.user_behavior (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_preferences JSONB DEFAULT '{}'::jsonb,
  price_range_preferences JSONB DEFAULT '{}'::jsonb,
  city_preferences JSONB DEFAULT '{}'::jsonb,
  condition_preferences JSONB DEFAULT '{}'::jsonb,
  last_search_filters JSONB DEFAULT '{}'::jsonb,
  favorite_brands TEXT[],
  preferred_price_min INTEGER DEFAULT 0,
  preferred_price_max INTEGER DEFAULT 999999999,
  viewed_ads_count INTEGER DEFAULT 0,
  premium_ads_viewed INTEGER DEFAULT 0,
  featured_ads_viewed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول لإحصائيات عرض الإعلانات المميزة
CREATE TABLE public.premium_ad_impressions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL,
  user_id UUID,
  placement_type TEXT NOT NULL,
  impression_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_ip TEXT,
  user_agent TEXT,
  session_id TEXT
);

-- إنشاء جدول لتتبع توزيع عرض الإعلانات المميزة
CREATE TABLE public.premium_ad_distribution (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL,
  total_impressions INTEGER DEFAULT 0,
  header_impressions INTEGER DEFAULT 0,
  sidebar_impressions INTEGER DEFAULT 0,
  between_ads_impressions INTEGER DEFAULT 0,
  footer_impressions INTEGER DEFAULT 0,
  details_top_impressions INTEGER DEFAULT 0,
  details_bottom_impressions INTEGER DEFAULT 0,
  last_shown_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fairness_score DECIMAL(5,2) DEFAULT 100.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تمكين RLS للجداول الجديدة
ALTER TABLE public.user_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_ad_distribution ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لجدول user_behavior
CREATE POLICY "Users can view their own behavior data" 
ON public.user_behavior 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own behavior data" 
ON public.user_behavior 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own behavior data" 
ON public.user_behavior 
FOR UPDATE 
USING (auth.uid() = user_id);

-- سياسات RLS لجدول premium_ad_impressions
CREATE POLICY "Users can insert impression data" 
ON public.premium_ad_impressions 
FOR INSERT 
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can view impression data" 
ON public.premium_ad_impressions 
FOR SELECT 
USING (true);

-- سياسات RLS لجدول premium_ad_distribution
CREATE POLICY "Ad owners can view their distribution data" 
ON public.premium_ad_distribution 
FOR SELECT 
USING (
  ad_id IN (
    SELECT id FROM public.ads WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can manage distribution data" 
ON public.premium_ad_distribution 
FOR ALL 
USING (true);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_user_behavior_user_id ON public.user_behavior(user_id);
CREATE INDEX idx_premium_ad_impressions_ad_id ON public.premium_ad_impressions(ad_id);
CREATE INDEX idx_premium_ad_impressions_user_id ON public.premium_ad_impressions(user_id);
CREATE INDEX idx_premium_ad_impressions_placement ON public.premium_ad_impressions(placement_type);
CREATE INDEX idx_premium_ad_impressions_time ON public.premium_ad_impressions(impression_time);
CREATE INDEX idx_premium_ad_distribution_ad_id ON public.premium_ad_distribution(ad_id);
CREATE INDEX idx_premium_ad_distribution_fairness ON public.premium_ad_distribution(fairness_score);

-- إضافة trigger لتحديث updated_at
CREATE TRIGGER update_user_behavior_updated_at
BEFORE UPDATE ON public.user_behavior
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_premium_ad_distribution_updated_at
BEFORE UPDATE ON public.premium_ad_distribution
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- دالة لحساب خوارزمية العرض العادل للإعلانات المميزة
CREATE OR REPLACE FUNCTION public.get_fair_premium_ads(
  _user_id UUID DEFAULT NULL,
  _placement_type TEXT DEFAULT 'header_banner',
  _limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  ad_id UUID,
  title TEXT,
  brand TEXT,
  price NUMERIC,
  city TEXT,
  images TEXT[],
  priority_score DECIMAL(10,2),
  fairness_score DECIMAL(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_preferences RECORD;
BEGIN
  -- الحصول على تفضيلات المستخدم إذا كان مسجل دخول
  IF _user_id IS NOT NULL THEN
    SELECT * INTO user_preferences
    FROM public.user_behavior
    WHERE user_id = _user_id;
  END IF;

  RETURN QUERY
  WITH premium_ads AS (
    SELECT 
      a.id,
      a.title,
      a.brand,
      a.price,
      a.city,
      a.images,
      a.is_featured,
      a.is_premium,
      a.created_at,
      p.is_premium as owner_is_premium,
      COALESCE(d.fairness_score, 100.0) as fairness_score,
      COALESCE(d.total_impressions, 0) as total_impressions,
      CASE _placement_type
        WHEN 'header_banner' THEN COALESCE(d.header_impressions, 0)
        WHEN 'sidebar_ad' THEN COALESCE(d.sidebar_impressions, 0)
        WHEN 'between_ads' THEN COALESCE(d.between_ads_impressions, 0)
        WHEN 'footer_banner' THEN COALESCE(d.footer_impressions, 0)
        WHEN 'ad_details_top' THEN COALESCE(d.details_top_impressions, 0)
        WHEN 'ad_details_bottom' THEN COALESCE(d.details_bottom_impressions, 0)
        ELSE 0
      END as placement_impressions,
      COALESCE(d.last_shown_at, a.created_at) as last_shown_at
    FROM public.ads a
    INNER JOIN public.profiles p ON a.user_id = p.id
    LEFT JOIN public.premium_ad_distribution d ON a.id = d.ad_id
    WHERE a.is_active = true 
      AND (a.is_featured = true OR a.is_premium = true OR p.is_premium = true)
  ),
  scored_ads AS (
    SELECT 
      pa.*,
      -- حساب نقاط الأولوية
      (
        CASE 
          WHEN pa.is_premium THEN 100
          WHEN pa.owner_is_premium THEN 90
          WHEN pa.is_featured THEN 80
          ELSE 70
        END +
        -- مكافأة العدالة (كلما قل العرض زادت النقاط)
        (100 - LEAST(pa.placement_impressions, 100)) +
        -- مكافأة التفضيلات الشخصية
        CASE 
          WHEN _user_id IS NOT NULL AND user_preferences.favorite_brands IS NOT NULL THEN
            CASE WHEN pa.brand = ANY(user_preferences.favorite_brands) THEN 50 ELSE 0 END
          ELSE 0
        END +
        -- مكافأة نطاق السعر المفضل
        CASE 
          WHEN _user_id IS NOT NULL AND user_preferences.preferred_price_min IS NOT NULL THEN
            CASE WHEN pa.price BETWEEN user_preferences.preferred_price_min AND user_preferences.preferred_price_max THEN 30 ELSE 0 END
          ELSE 0
        END +
        -- مكافأة الوقت (إعلانات أحدث تحصل على نقاط أعلى)
        GREATEST(0, 20 - EXTRACT(DAY FROM now() - pa.created_at))
      ) as calculated_priority
    FROM premium_ads pa
  )
  SELECT 
    sa.id as ad_id,
    sa.title,
    sa.brand,
    sa.price,
    sa.city,
    sa.images,
    sa.calculated_priority as priority_score,
    sa.fairness_score
  FROM scored_ads sa
  ORDER BY 
    sa.calculated_priority DESC,
    sa.fairness_score DESC,
    RANDOM()
  LIMIT _limit;
END;
$$;

-- دالة لتسجيل عرض إعلان مميز
CREATE OR REPLACE FUNCTION public.record_premium_ad_impression(
  _ad_id UUID,
  _user_id UUID DEFAULT NULL,
  _placement_type TEXT DEFAULT 'header_banner',
  _user_ip TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL,
  _session_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- تسجيل الإحصائية
  INSERT INTO public.premium_ad_impressions (
    ad_id, user_id, placement_type, user_ip, user_agent, session_id
  ) VALUES (
    _ad_id, _user_id, _placement_type, _user_ip, _user_agent, _session_id
  );

  -- تحديث إحصائيات التوزيع
  INSERT INTO public.premium_ad_distribution (ad_id, total_impressions)
  VALUES (_ad_id, 1)
  ON CONFLICT (ad_id) 
  DO UPDATE SET
    total_impressions = premium_ad_distribution.total_impressions + 1,
    header_impressions = CASE WHEN _placement_type = 'header_banner' 
      THEN premium_ad_distribution.header_impressions + 1 
      ELSE premium_ad_distribution.header_impressions END,
    sidebar_impressions = CASE WHEN _placement_type = 'sidebar_ad' 
      THEN premium_ad_distribution.sidebar_impressions + 1 
      ELSE premium_ad_distribution.sidebar_impressions END,
    between_ads_impressions = CASE WHEN _placement_type = 'between_ads' 
      THEN premium_ad_distribution.between_ads_impressions + 1 
      ELSE premium_ad_distribution.between_ads_impressions END,
    footer_impressions = CASE WHEN _placement_type = 'footer_banner' 
      THEN premium_ad_distribution.footer_impressions + 1 
      ELSE premium_ad_distribution.footer_impressions END,
    details_top_impressions = CASE WHEN _placement_type = 'ad_details_top' 
      THEN premium_ad_distribution.details_top_impressions + 1 
      ELSE premium_ad_distribution.details_top_impressions END,
    details_bottom_impressions = CASE WHEN _placement_type = 'ad_details_bottom' 
      THEN premium_ad_distribution.details_bottom_impressions + 1 
      ELSE premium_ad_distribution.details_bottom_impressions END,
    last_shown_at = now(),
    updated_at = now();

  RETURN TRUE;
END;
$$;

-- دالة لتحديث تفضيلات المستخدم
CREATE OR REPLACE FUNCTION public.update_user_behavior(
  _user_id UUID,
  _search_filters JSONB DEFAULT NULL,
  _viewed_ad_brand TEXT DEFAULT NULL,
  _viewed_ad_price NUMERIC DEFAULT NULL,
  _viewed_ad_city TEXT DEFAULT NULL,
  _viewed_ad_condition TEXT DEFAULT NULL,
  _is_premium_ad BOOLEAN DEFAULT FALSE,
  _is_featured_ad BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_behavior RECORD;
  updated_brand_prefs JSONB;
  updated_city_prefs JSONB;
  updated_condition_prefs JSONB;
BEGIN
  -- الحصول على السلوك الحالي
  SELECT * INTO current_behavior
  FROM public.user_behavior
  WHERE user_id = _user_id;

  -- إذا لم يوجد سجل، إنشاء واحد جديد
  IF NOT FOUND THEN
    INSERT INTO public.user_behavior (
      user_id, 
      brand_preferences, 
      city_preferences, 
      condition_preferences,
      last_search_filters,
      viewed_ads_count,
      premium_ads_viewed,
      featured_ads_viewed
    ) VALUES (
      _user_id,
      CASE WHEN _viewed_ad_brand IS NOT NULL THEN jsonb_build_object(_viewed_ad_brand, 1) ELSE '{}'::jsonb END,
      CASE WHEN _viewed_ad_city IS NOT NULL THEN jsonb_build_object(_viewed_ad_city, 1) ELSE '{}'::jsonb END,
      CASE WHEN _viewed_ad_condition IS NOT NULL THEN jsonb_build_object(_viewed_ad_condition, 1) ELSE '{}'::jsonb END,
      COALESCE(_search_filters, '{}'::jsonb),
      1,
      CASE WHEN _is_premium_ad THEN 1 ELSE 0 END,
      CASE WHEN _is_featured_ad THEN 1 ELSE 0 END
    );
    RETURN TRUE;
  END IF;

  -- تحديث التفضيلات الموجودة
  updated_brand_prefs := current_behavior.brand_preferences;
  updated_city_prefs := current_behavior.city_preferences;
  updated_condition_prefs := current_behavior.condition_preferences;

  -- تحديث تفضيلات البراند
  IF _viewed_ad_brand IS NOT NULL THEN
    updated_brand_prefs := jsonb_set(
      updated_brand_prefs,
      ARRAY[_viewed_ad_brand],
      to_jsonb(COALESCE((updated_brand_prefs->>_viewed_ad_brand)::integer, 0) + 1)
    );
  END IF;

  -- تحديث تفضيلات المدينة
  IF _viewed_ad_city IS NOT NULL THEN
    updated_city_prefs := jsonb_set(
      updated_city_prefs,
      ARRAY[_viewed_ad_city],
      to_jsonb(COALESCE((updated_city_prefs->>_viewed_ad_city)::integer, 0) + 1)
    );
  END IF;

  -- تحديث تفضيلات الحالة
  IF _viewed_ad_condition IS NOT NULL THEN
    updated_condition_prefs := jsonb_set(
      updated_condition_prefs,
      ARRAY[_viewed_ad_condition],
      to_jsonb(COALESCE((updated_condition_prefs->>_viewed_ad_condition)::integer, 0) + 1)
    );
  END IF;

  -- تحديث السجل
  UPDATE public.user_behavior
  SET
    brand_preferences = updated_brand_prefs,
    city_preferences = updated_city_prefs,
    condition_preferences = updated_condition_prefs,
    last_search_filters = COALESCE(_search_filters, last_search_filters),
    viewed_ads_count = viewed_ads_count + 1,
    premium_ads_viewed = premium_ads_viewed + CASE WHEN _is_premium_ad THEN 1 ELSE 0 END,
    featured_ads_viewed = featured_ads_viewed + CASE WHEN _is_featured_ad THEN 1 ELSE 0 END,
    updated_at = now()
  WHERE user_id = _user_id;

  RETURN TRUE;
END;
$$;