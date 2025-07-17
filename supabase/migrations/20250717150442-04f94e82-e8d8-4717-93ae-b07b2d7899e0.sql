-- إنشاء trigger لتحديث عداد المشاهدات تلقائياً
CREATE OR REPLACE FUNCTION public.update_ad_views_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- تحديث عداد المشاهدات للإعلان
  UPDATE public.ads
  SET views_count = (
    SELECT COUNT(*)
    FROM public.ad_views
    WHERE ad_id = NEW.ad_id
  )
  WHERE id = NEW.ad_id;
  
  RETURN NEW;
END;
$function$;

-- إنشاء trigger يتم تشغيله عند إضافة مشاهدة جديدة
CREATE TRIGGER trigger_update_ad_views_count
  AFTER INSERT ON public.ad_views
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ad_views_count();

-- تفعيل realtime للجداول المطلوبة
ALTER TABLE public.ads REPLICA IDENTITY FULL;
ALTER TABLE public.ad_views REPLICA IDENTITY FULL;

-- إضافة الجداول لنشر realtime
ALTER publication supabase_realtime ADD TABLE public.ads;
ALTER publication supabase_realtime ADD TABLE public.ad_views;