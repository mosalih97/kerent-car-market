import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // إعداد مستمع تغيير حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('تغيرت حالة المصادقة:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // التعامل مع استرداد كلمة المرور
        if (event === 'PASSWORD_RECOVERY') {
          toast.success('يمكنك الآن إدخال كلمة المرور الجديدة');
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
    const redirectUrl = `${window.location.origin}/password-reset`;
    
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
    } else {
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
    }

    return { error };
  };

  const updatePassword = async (password: string) => {
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
    } else {
      toast.success('تم تحديث كلمة المرور بنجاح');
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    } else {
      toast.success('تم تسجيل الخروج بنجاح');
      navigate('/'); // إعادة توجيه إلى الصفحة الرئيسية
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
