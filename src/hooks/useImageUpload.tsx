
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const uploadImages = async (files: FileList): Promise<string[]> => {
    if (!user) throw new Error('يجب تسجيل الدخول لتحميل الصور');
    
    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${i}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('ad-images')
          .upload(fileName, file);

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('ad-images')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageUrl: string): Promise<void> => {
    if (!user) throw new Error('يجب تسجيل الدخول لحذف الصور');

    try {
      // Extract file path from URL
      const path = imageUrl.split('/ad-images/')[1];
      if (path) {
        const { error } = await supabase.storage
          .from('ad-images')
          .remove([path]);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  };

  return {
    uploadImages,
    deleteImage,
    uploading
  };
};
