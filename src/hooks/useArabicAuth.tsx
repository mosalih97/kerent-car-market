
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useArabicAuth = () => {
  const auth = useAuth();

  const signUpWithArabicMessages = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await auth.signUp(email, password, fullName);
      
      if (!error) {
        toast.success('تم إنشاء الحساب بنجاح! ✅', {
          description: 'تحقق من بريدك الإلكتروني لتأكيد التسجيل. قد تحتاج للتحقق من مجلد الرسائل غير المرغوب فيها.',
          duration: 6000
        });
      }
      
      return { error };
    } catch (error: any) {
      toast.error('حدث خطأ أثناء إنشاء الحساب', {
        description: 'يرجى المحاولة مرة أخرى'
      });
      return { error };
    }
  };

  const signInWithArabicMessages = async (email: string, password: string) => {
    try {
      const { error } = await auth.signIn(email, password);
      
      if (!error) {
        toast.success('تم تسجيل الدخول بنجاح! 🎉', {
          description: 'مرحباً بك في الكيرين'
        });
      }
      
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const resetPasswordWithArabicMessages = async (email: string) => {
    try {
      const { error } = await auth.resetPassword(email);
      
      if (!error) {
        toast.success('تم إرسال رابط إعادة التعيين! 📧', {
          description: 'تحقق من بريدك الإلكتروني لرابط إعادة تعيين كلمة المرور',
          duration: 6000
        });
      }
      
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  return {
    ...auth,
    signUp: signUpWithArabicMessages,
    signIn: signInWithArabicMessages,
    resetPassword: resetPasswordWithArabicMessages
  };
};
