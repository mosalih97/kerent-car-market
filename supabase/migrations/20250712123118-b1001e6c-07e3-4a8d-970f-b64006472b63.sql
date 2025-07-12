
-- إضافة دورك كمدير في النظام
-- يرجى استبدال 'YOUR_USER_ID_HERE' بمعرف المستخدم الخاص بك من جدول auth.users
INSERT INTO public.user_roles (user_id, role) 
VALUES ('YOUR_USER_ID_HERE', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;
