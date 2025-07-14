
import { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Mail, Lock, User, KeyRound } from 'lucide-react';

const Auth = () => {
  const { user, loading, signUp, signIn, resetPassword, updatePassword } = useAuth();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Form states
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', fullName: '', confirmPassword: '' });

  // Check if we're in password reset mode
  const isResetMode = searchParams.get('mode') === 'reset';

  useEffect(() => {
    if (isResetMode) {
      setShowResetPassword(false);
    }
  }, [isResetMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  if (user && !isResetMode) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn(signInData.email, signInData.password);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.confirmPassword) {
      alert('كلمة المرور غير متطابقة');
      return;
    }
    setIsLoading(true);
    await signUp(signUpData.email, signUpData.password, signUpData.fullName);
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      alert('يرجى إدخال البريد الإلكتروني');
      return;
    }
    setIsLoading(true);
    await resetPassword(resetEmail);
    setIsLoading(false);
    setShowResetPassword(false);
    setResetEmail('');
  };

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
      window.location.href = '/';
    }
  };

  // Password reset form
  if (isResetMode) {
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
            <CardTitle className="text-center text-2xl text-gray-800">
              مرحباً بك
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showResetPassword ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center text-gray-800 mb-4">
                  استعادة كلمة المرور
                </h3>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      البريد الإلكتروني
                    </label>
                    <Input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="أدخل بريدك الإلكتروني"
                      className="h-12 text-right"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      disabled={isLoading}
                    >
                      {isLoading ? 'جارٍ الإرسال...' : 'إرسال رابط الاستعادة'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 px-6"
                      onClick={() => setShowResetPassword(false)}
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">تسجيل الدخول</TabsTrigger>
                  <TabsTrigger value="signup">إنشاء حساب</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        البريد الإلكتروني
                      </label>
                      <Input
                        type="email"
                        value={signInData.email}
                        onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="أدخل بريدك الإلكتروني"
                        className="h-12 text-right"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        كلمة المرور
                      </label>
                      <Input
                        type="password"
                        value={signInData.password}
                        onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="أدخل كلمة المرور"
                        className="h-12 text-right"
                        required
                      />
                    </div>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        نسيت كلمة المرور؟
                      </button>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      disabled={isLoading}
                    >
                      {isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        الاسم الكامل
                      </label>
                      <Input
                        type="text"
                        value={signUpData.fullName}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="أدخل اسمك الكامل"
                        className="h-12 text-right"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        البريد الإلكتروني
                      </label>
                      <Input
                        type="email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="أدخل بريدك الإلكتروني"
                        className="h-12 text-right"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        كلمة المرور
                      </label>
                      <Input
                        type="password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="أدخل كلمة المرور"
                        className="h-12 text-right"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        تأكيد كلمة المرور
                      </label>
                      <Input
                        type="password"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="أعد إدخال كلمة المرور"
                        className="h-12 text-right"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      disabled={isLoading}
                    >
                      {isLoading ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
