
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

  console.log('PasswordReset component loaded');
  console.log('URL params:', Object.fromEntries(searchParams.entries()));

  useEffect(() => {
    // فحص إذا كان المستخدم وصل من رابط صحيح
    const type = searchParams.get('type');
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    console.log('Recovery type:', type);
    console.log('Access token exists:', !!accessToken);
    console.log('Refresh token exists:', !!refreshToken);

    // التحقق من وجود المعاملات المطلوبة لإعادة تعيين كلمة المرور
    if (type !== 'recovery' || (!accessToken && !refreshToken)) {
      console.log('Invalid recovery link, redirecting to auth');
      toast.error('رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية');
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    }
  }, [searchParams, navigate]);

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PasswordReset;
