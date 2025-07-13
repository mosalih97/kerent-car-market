-- تأكد من وجود admin role في user_roles table
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email IN ('flymas123@gmail.com', 'mood76726@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create function to safely check admin access with error handling
CREATE OR REPLACE FUNCTION public.verify_admin_access(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user exists and has admin role
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN auth.users u ON u.id = ur.user_id
    WHERE ur.user_id = _user_id
      AND ur.role = 'admin'::app_role
      AND u.email_confirmed_at IS NOT NULL
  );
EXCEPTION 
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Create function to safely update user privileges
CREATE OR REPLACE FUNCTION public.admin_update_user_type(_admin_id uuid, _target_user_id uuid, _user_type user_type)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify admin permissions
  IF NOT public.verify_admin_access(_admin_id) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Update user type and related fields
  UPDATE public.profiles 
  SET 
    user_type = _user_type,
    is_premium = (_user_type = 'premium'),
    updated_at = now()
  WHERE id = _target_user_id;

  RETURN FOUND;
END;
$$;

-- Create function to safely toggle ad status
CREATE OR REPLACE FUNCTION public.admin_toggle_ad_status(_admin_id uuid, _ad_id uuid, _is_active boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify admin permissions
  IF NOT public.verify_admin_access(_admin_id) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Toggle ad status
  UPDATE public.ads 
  SET 
    is_active = _is_active,
    updated_at = now()
  WHERE id = _ad_id;

  RETURN FOUND;
END;
$$;

-- Create function to safely handle reports
CREATE OR REPLACE FUNCTION public.admin_update_report_status(_admin_id uuid, _report_id uuid, _status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify admin permissions
  IF NOT public.verify_admin_access(_admin_id) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Update report status
  UPDATE public.ad_reports 
  SET 
    status = _status,
    reviewed_at = now(),
    reviewed_by = _admin_id
  WHERE id = _report_id;

  -- If report is approved, deactivate the related ad
  IF _status = 'approved' THEN
    UPDATE public.ads 
    SET is_active = false
    WHERE id = (SELECT ad_id FROM public.ad_reports WHERE id = _report_id);
  END IF;

  RETURN FOUND;
END;
$$;