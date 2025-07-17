-- إنشاء جدول النسخ الاحتياطية
CREATE TABLE public.project_backups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  backup_name TEXT NOT NULL,
  backup_data JSONB NOT NULL,
  backup_size BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.project_backups ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can create their own backups" 
ON public.project_backups 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own backups" 
ON public.project_backups 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own backups" 
ON public.project_backups 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own backups" 
ON public.project_backups 
FOR DELETE 
USING (auth.uid() = user_id);

-- إضافة trigger للتحديث التلقائي
CREATE TRIGGER update_project_backups_updated_at
BEFORE UPDATE ON public.project_backups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();