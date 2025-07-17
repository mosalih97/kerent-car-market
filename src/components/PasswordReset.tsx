import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const PasswordReset = () => {
  const { updatePassword, user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasValidRecoverySession, setHasValidRecoverySession] = useState(false);

  console.log('PasswordReset component loaded');
  console.log('URL params:', Object.fromEntries(searchParams.entries()));

  useEffect(() => {
    const handleRecoverySession = async () => {
      const type = searchParams.get('type');
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      
      console.log('Recovery type:', type);
      console.log('Access token exists:', !!accessToken);
      console.log('Refresh token exists:', !!refreshToken);

      // إذا كان هناك رموز استعادة، حاول إعداد الجلسة
      if (type === 'recovery' && (accessToken || refreshToken)) {
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken!,
            refresh_token: refreshToken!
          });
          
          if (error) {
            console.error('Error setting recovery session:', error);
            toast.error('رابط الاستعادة غير صحيح أو منتهي الصلاحية');
            setTimeout(() => navigate('/auth'), 3000);
          } else {
            console.log('Recovery session set successfully:', data);
            setHasValidRecoverySession(true);
            toast.success('يمكنك الآن إدخال كلمة المرور الجديدة');
          }
        } catch (error) {
          console.error('Unexpected error setting session:', error);
          toast.error('حدث خطأ غير متوقع');
          setTimeout(() => navigate('/auth'), 3000);
        }
      } else if (user) {
        // إذا كان المستخدم مسجل دخوله بالفعل، اسمح له بتغيير كلمة المرور
        setHasValidRecoverySession(true);
        toast.success('يمكنك الآن إدخال كلمة المرور الجديدة');
      } else {
        // لا توجد معاملات استعادة ولا يوجد مستخدم مسجل دخوله
        toast.error('يرجى استخدام الرابط المرسل إلى بريدك الإلكتروني لإعادة تعيين كلمة المرور');
        setTimeout(() => navigate('/auth'), 3000);
      }
    };

    handleRecoverySession();
  }, [searchParams, navigate, user]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Starting password reset process');
    
    if (!newPassword.trim()) {
      toast.error('يرجى إدخال كلمة المرور الجديدة');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('كلمة المرور غير متطابقة');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await updatePassword(newPassword);
      
      if (error) {
        console.error('Password update error:', error);
        toast.error(error.message || 'حدث خطأ أثناء تحديث كلمة المرور');
      } else {
        console.log('Password updated successfully');
        toast.success('تم تحديث كلمة المرور بنجاح!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasValidRecoverySession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  جارٍ التحقق من رابط الاستعادة...
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => navigate('/auth')}
                >
                  العودة لصفحة تسجيل الدخول
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 border-2 border-blue-500 bg-transparent rounded-lg p-2 flex items-center justify-center overflow-hidden">
              <img 
                src="/lovable-uploads/6e1da3af-20f1-469a-8fb3-547fa3c534ac.png" 
                alt="الكرين" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-blue-800">الكرين</h1>
          </div>
          <p className="text-gray-600">موقع السيارات الأول في السودان</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-gray-800 flex items-center justify-center gap-2">
              <Shield className="w-6 h-6" />
              تغيير كلمة المرور
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="اكتب كلمة المرور الجديدة"
                  className="h-12 text-right"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد كتابة كلمة المرور"
                  className="h-12 text-right"
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                <Shield className="w-4 h-4 ml-2" />
                {isLoading ? 'جارٍ التحديث...' : 'تحديث كلمة المرور'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PasswordReset;