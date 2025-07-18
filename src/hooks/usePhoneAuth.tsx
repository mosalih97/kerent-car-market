import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePhoneAuth = () => {
  const [loading, setLoading] = useState(false);
  
  const sendOTP = async (phone: string) => {
    setLoading(true);
    try {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP temporarily in localStorage with expiration
      const otpData = {
        otp,
        phone,
        expires: Date.now() + 5 * 60 * 1000 // 5 minutes
      };
      localStorage.setItem('phone_otp', JSON.stringify(otpData));
      
      // Send SMS via edge function
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          phone,
          message: `رمز التحقق الخاص بك في الكرين: ${otp}`
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('تم إرسال رمز التحقق إلى هاتفك');
      return { success: true };
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('فشل في إرسال رمز التحقق');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };
  
  const verifyOTP = async (phone: string, enteredOTP: string) => {
    setLoading(true);
    try {
      // Get stored OTP
      const storedData = localStorage.getItem('phone_otp');
      if (!storedData) {
        toast.error('لم يتم العثور على رمز التحقق');
        return { success: false, error: 'OTP not found' };
      }
      
      const otpData = JSON.parse(storedData);
      
      // Check if OTP expired
      if (Date.now() > otpData.expires) {
        localStorage.removeItem('phone_otp');
        toast.error('انتهت صلاحية رمز التحقق');
        return { success: false, error: 'OTP expired' };
      }
      
      // Check if phone matches
      if (otpData.phone !== phone) {
        toast.error('رقم الهاتف غير متطابق');
        return { success: false, error: 'Phone mismatch' };
      }
      
      // Check if OTP matches
      if (otpData.otp !== enteredOTP) {
        toast.error('رمز التحقق غير صحيح');
        return { success: false, error: 'Invalid OTP' };
      }
      
      // OTP verified successfully
      localStorage.removeItem('phone_otp');
      
      // Create a phone-based session using signInWithOtp
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: true
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('تم التحقق بنجاح');
      return { success: true, data };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('فشل في التحقق من الرمز');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };
  
  return {
    sendOTP,
    verifyOTP,
    loading
  };
};