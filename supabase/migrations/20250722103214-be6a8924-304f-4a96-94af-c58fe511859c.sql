-- Create saved_ads table for user's saved advertisements
CREATE TABLE public.saved_ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ad_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, ad_id)
);

-- Enable Row Level Security
ALTER TABLE public.saved_ads ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_ads
CREATE POLICY "Users can view their own saved ads" 
ON public.saved_ads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save ads" 
ON public.saved_ads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave ads" 
ON public.saved_ads 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX idx_saved_ads_user_id ON public.saved_ads(user_id);
CREATE INDEX idx_saved_ads_ad_id ON public.saved_ads(ad_id);