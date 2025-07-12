
-- إنشاء enum للأدوار
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- إنشاء جدول أدوار المستخدمين
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    assigned_at timestamp with time zone DEFAULT now(),
    assigned_by uuid REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- تفعيل Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- إنشاء دالة للتحقق من الأدوار (security definer لتجنب RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- إنشاء دالة للتحقق من صلاحيات الإدارة
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role)
$$;

-- سياسات RLS لجدول user_roles
CREATE POLICY "Admins can view all roles" 
  ON public.user_roles 
  FOR SELECT 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" 
  ON public.user_roles 
  FOR ALL 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- إضافة عمود الإحصائيات للإعلانات
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS reported_count integer DEFAULT 0;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- إنشاء جدول التقارير
CREATE TABLE public.ad_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id uuid REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
    reporter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reason text NOT NULL,
    description text,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now(),
    reviewed_by uuid REFERENCES auth.users(id),
    reviewed_at timestamp with time zone
);

ALTER TABLE public.ad_reports ENABLE ROW LEVEL SECURITY;

-- سياسات لجدول التقارير
CREATE POLICY "Users can create reports" 
  ON public.ad_reports 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" 
  ON public.ad_reports 
  FOR SELECT 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reports" 
  ON public.ad_reports 
  FOR UPDATE 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- إضافة مستخدم إداري افتراضي (يجب تغيير البريد الإلكتروني)
-- ملاحظة: يجب على المطور تشغيل هذا يدوياً بعد إنشاء المستخدم
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('USER_ID_HERE', 'admin');
