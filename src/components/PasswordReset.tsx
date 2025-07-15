
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Lock, KeyRound } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PasswordReset = () => {
  const { updatePassword } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  // فحص معاملات إعادة تعيين كلمة المرور الصحيحة
  const hasValidResetParams = searchParams.get('type') === 'recovery';
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  useEffect(() => {
    console.log('معاملات URL:', {
      type: searchParams.get('type'),
      access_token: accessToken ? 'موجود' : 'غير موجود',
      refresh_token: refreshToken ? 'موجود' : 'غير موجود'
    });

    // إذا لم تكن المعاملات صحيحة، توجيه المستخدم لصفحة الدخول
    if (!hasValidResetParams) {
      console.log('معاملات غير صحيحة، إعادة توجيه للمصادقة');
      navigate('/auth');
      toast.error('رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية');
    }
  }, [hasValidResetParams, navigate, accessToken, refreshToken, searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('بدء عملية إعادة تعيين كلمة المرور');
    
    // التحقق من أن كلمة المرور غير فارغة
    if (!newPassword.trim()) {
      setMessage('يرجى إدخال كلمة المرور الجديدة');
      return;
    }
    
    // التحقق من تطابق كلمات المرور
    if (newPassword !== confirmPassword) {
      setMessage('كلمة المرور غير متطابقة');
      return;
    }
    
    // التحقق من طول كلمة المرور
    if (newPassword.length < 6) {
      setMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      const { error } = await updatePassword(newPassword);
      
      if (error) {
        console.error('خطأ في تحديث كلمة المرور:', error);
        setMessage(error.message || 'حدث خطأ أثناء تحديث كلمة المرور');
      } else {
        console.log('تم تحديث كلمة المرور بنجاح');
        setMessage('تم تحديث كلمة المرور بنجاح!');
        toast.success('تم تحديث كلمة المرور بنجاح!');
        // التوجيه للصفحة الرئيسية بعد النجاح
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('خطأ غير متوقع:', error);
      setMessage('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  // إذا لم تكن المعاملات صحيحة، لا تعرض الصفحة
  if (!hasValidResetParams) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <Car className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-blue-800">الكيرين</h1>
          </div>
          <p className="text-gray-600">موقع السيارات الأول في السودان</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-gray-800 flex items-center justify-center gap-2">
              <KeyRound className="w-6 h-6" />
              إعادة تعيين كلمة المرور
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              أدخل كلمة المرور الجديدة لحسابك
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  كلمة المرور الجديدة
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                  className="h-12 text-right"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  تأكيد كلمة المرور
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  className="h-12 text-right"
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                disabled={isLoading}
              >
                {isLoading ? 'جارٍ التحديث...' : 'تأكيد'}
              </Button>
            </form>
            {message && (
              <p className={`mt-4 text-center ${message.includes('بنجاح') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PasswordReset;
