
-- Create enum for user types
CREATE TYPE user_type AS ENUM ('free', 'premium');

-- Create enum for ad types
CREATE TYPE ad_type AS ENUM ('standard', 'featured', 'premium');

-- Create enum for car conditions
CREATE TYPE car_condition AS ENUM ('new', 'used', 'excellent', 'good', 'fair');

-- Create profiles table for users
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  user_type user_type NOT NULL DEFAULT 'free',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  credits INTEGER NOT NULL DEFAULT 20,
  ads_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create ads table
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER,
  condition car_condition NOT NULL DEFAULT 'used',
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  ad_type ad_type NOT NULL DEFAULT 'standard',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad views tracking table
CREATE TABLE public.ad_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact reveals table (for credit tracking)
CREATE TABLE public.contact_reveals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ad_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_reveals ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Ads policies
CREATE POLICY "Anyone can view active ads" ON public.ads FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create own ads" ON public.ads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ads" ON public.ads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ads" ON public.ads FOR DELETE USING (auth.uid() = user_id);

-- Ad views policies
CREATE POLICY "Users can view ad views" ON public.ad_views FOR SELECT USING (true);
CREATE POLICY "Users can create ad views" ON public.ad_views FOR INSERT WITH CHECK (auth.uid() = viewer_id OR viewer_id IS NULL);

-- Contact reveals policies
CREATE POLICY "Users can view own contact reveals" ON public.contact_reveals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create contact reveals" ON public.contact_reveals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type, credits)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    'free',
    20
  );
  RETURN new;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update ad priority based on type
CREATE OR REPLACE FUNCTION public.get_ad_priority(ad_type ad_type, is_featured boolean, is_premium boolean)
RETURNS integer
LANGUAGE plpgsql
AS $$
BEGIN
  CASE
    WHEN is_premium = true THEN RETURN 3;
    WHEN is_featured = true THEN RETURN 2;
    WHEN ad_type = 'featured' THEN RETURN 2;
    WHEN ad_type = 'premium' THEN RETURN 3;
    ELSE RETURN 1;
  END CASE;
END;
$$;

-- Create storage bucket for ad images
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-images', 'ad-images', true);

-- Storage policies for ad images
CREATE POLICY "Anyone can view ad images" ON storage.objects FOR SELECT USING (bucket_id = 'ad-images');
CREATE POLICY "Authenticated users can upload ad images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ad-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own ad images" ON storage.objects FOR UPDATE USING (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own ad images" ON storage.objects FOR DELETE USING (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);
