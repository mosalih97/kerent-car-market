import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MessageSquare, ArrowRight } from 'lucide-react';
import { usePhoneAuth } from '@/hooks/usePhoneAuth';

interface PhoneAuthProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

const PhoneAuth = ({ onSuccess, onBack }: PhoneAuthProps) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const { sendOTP, verifyOTP, loading } = usePhoneAuth();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      return;
    }
    
    // Format phone number (ensure it starts with +249 for Sudan)
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+249' + formattedPhone.substring(1);
      } else {
        formattedPhone = '+249' + formattedPhone;
      }
    }
    
    const result = await sendOTP(formattedPhone);
    if (result.success) {
      setPhone(formattedPhone);
      setStep('otp');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      return;
    }
    
    const result = await verifyOTP(phone, otp);
    if (result.success) {
      onSuccess?.();
    }
  };

  const handleResendOTP = async () => {
    const result = await sendOTP(phone);
    if (result.success) {
      setOtp('');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl text-gray-800 flex items-center justify-center gap-2">
          <Phone className="w-5 h-5" />
          تسجيل الدخول برقم الهاتف
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                رقم الهاتف
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                className="h-12 text-right"
                dir="ltr"
                required
              />
              <p className="text-xs text-gray-500 text-right">
                سيتم إرسال رمز التحقق عبر رسالة نصية
              </p>
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              disabled={loading || !phone.trim()}
            >
              {loading ? 'جارٍ الإرسال...' : 'إرسال رمز التحقق'}
            </Button>
            
            {onBack && (
              <Button
                type="button"
                variant="outline"
                className="w-full h-12"
                onClick={onBack}
              >
                العودة
              </Button>
            )}
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">
                  تم إرسال رمز التحقق إلى
                </span>
              </div>
              <p className="font-medium text-gray-800" dir="ltr">{phone}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 text-center block">
                أدخل رمز التحقق (6 أرقام)
              </label>
              <div className="flex justify-center">
                <InputOTP 
                  value={otp} 
                  onChange={setOtp}
                  maxLength={6}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'جارٍ التحقق...' : 'تأكيد الرمز'}
            </Button>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12"
                onClick={handleResendOTP}
                disabled={loading}
              >
                إعادة إرسال
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12"
                onClick={() => setStep('phone')}
                disabled={loading}
              >
                تغيير الرقم
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default PhoneAuth;