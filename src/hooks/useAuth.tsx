
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // إعداد مستمع تغيير حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // التعامل مع استرداد كلمة المرور
        if (event === 'PASSWORD_RECOVERY') {
          console.log('Password recovery event received');
          toast.success('يمكنك الآن إدخال كلمة المرور الجديدة');
        }

        // التعامل مع تسجيل الدخول بعد إعادة تعيين كلمة المرور
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in successfully after password reset');
        }
      }
    );

    // فحص الجلسة الموجودة
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      // تعريب رسائل الخطأ الشائعة
      let arabicMessage = error.message;
      if (error.message.includes('already registered')) {
        arabicMessage = 'البريد الإلكتروني مسجل مسبقاً';
      } else if (error.message.includes('Invalid email')) {
        arabicMessage = 'البريد الإلكتروني غير صحيح';
      } else if (error.message.includes('Password')) {
        arabicMessage = 'كلمة المرور ضعيفة جداً';
      } else if (error.message.includes('weak')) {
        arabicMessage = 'كلمة المرور ضعيفة جداً - يجب أن تحتوي على 6 أحرف على الأقل';
      } else if (error.message.includes('signup')) {
        arabicMessage = 'خطأ في إنشاء الحساب';
      }
      toast.error(arabicMessage);
    } else {
      toast.success('تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني لتأكيد التسجيل');
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // تعريب رسائل الخطأ الشائعة
      let arabicMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        arabicMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      } else if (error.message.includes('Email not confirmed')) {
        arabicMessage = 'يرجى تأكيد البريد الإلكتروني أولاً';
      } else if (error.message.includes('Too many requests')) {
        arabicMessage = 'تم تجاوز عدد المحاولات المسموح، حاول لاحقاً';
      } else if (error.message.includes('invalid_credentials')) {
        arabicMessage = 'بيانات الدخول غير صحيحة';
      } else if (error.message.includes('user_not_found')) {
        arabicMessage = 'المستخدم غير موجود';
      }
      toast.error(arabicMessage);
    } else {
      toast.success('تم تسجيل الدخول بنجاح');
    }

    return { error };
  };

  const resetPassword = async (email: string) => {
    // استخدام الرابط الصحيح لإعادة تعيين كلمة المرور
    const redirectUrl = `${window.location.origin}/password-reset`;
    
    console.log('Sending password reset request for email:', email);
    console.log('Redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });

    if (error) {
      let arabicMessage = error.message;
      if (error.message.includes('not found')) {
        arabicMessage = 'البريد الإلكتروني غير مسجل في النظام';
      } else if (error.message.includes('Too many requests')) {
        arabicMessage = 'تم تجاوز عدد المحاولات، حاول لاحقاً';
      } else if (error.message.includes('rate_limit')) {
        arabicMessage = 'تم إرسال عدد كبير من الطلبات، انتظر قليلاً ثم حاول مرة أخرى';
      }
      toast.error(arabicMessage);
      console.error('Error sending password reset email:', error);
    } else {
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      console.log('Password reset email sent successfully');
    }

    return { error };
  };

  const updatePassword = async (password: string) => {
    console.log('Attempting to update password');
    
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      let arabicMessage = error.message;
      if (error.message.includes('weak')) {
        arabicMessage = 'كلمة المرور ضعيفة جداً - يجب أن تحتوي على 6 أحرف على الأقل';
      } else if (error.message.includes('same_password')) {
        arabicMessage = 'كلمة المرور الجديدة يجب أن تكون مختلفة عن السابقة';
      } else if (error.message.includes('session')) {
        arabicMessage = 'انتهت صلاحية الجلسة، يرجى طلب رابط جديد';
      }
      toast.error(arabicMessage);
      console.error('Error updating password:', error);
    } else {
      toast.success('تم تحديث كلمة المرور بنجاح');
      console.log('Password updated successfully');
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    } else {
      toast.success('تم تسجيل الخروج بنجاح');
      // Navigation will be handled by the component that calls signOut
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
