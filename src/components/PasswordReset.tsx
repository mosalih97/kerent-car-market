
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Lock, KeyRound } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PasswordReset = () => {
  const { updatePassword } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Check if we have valid reset parameters
  const hasValidResetParams = searchParams.get('type') === 'recovery';

  useEffect(() => {
    if (!hasValidResetParams) {
      navigate('/auth');
    }
  }, [hasValidResetParams, navigate]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('كلمة المرور غير متطابقة');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    setIsLoading(true);
    const { error } = await updatePassword(newPassword);
    setIsLoading(false);
    
    if (!error) {
      // Redirect to home after successful password update
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

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
            <form onSubmit={handleUpdatePassword} className="space-y-4">
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
