
import { Crown, Check, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PremiumCardProps {
  variant?: 'home' | 'dashboard' | 'footer';
}

const PremiumCard = ({ variant = 'home' }: PremiumCardProps) => {
  const handleWhatsAppContact = () => {
    const phoneNumber = "+249966960202";
    const message = "مرحباً، أريد الاستفسار عن الخطة المميزة للكيرين";
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SD').format(price / 1000000);
  };

  if (variant === 'footer') {
    return (
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-bold">الخطة المميزة</h4>
            <Badge className="bg-white/20 text-white border-0 mt-1">
              وفر أكثر من 50%
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4" />
              <span>إعلانات مميزة في المقدمة</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4" />
              <span>كريديت إضافي شهرياً</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4" />
              <span>دعم فني مخصص</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4" />
              <span>تقارير مفصلة</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{formatPrice(25000)} ألف جنيه</p>
            <p className="text-sm text-white/80">شهرياً</p>
          </div>
          <Button 
            onClick={handleWhatsAppContact}
            className="bg-white text-amber-600 hover:bg-white/90 font-bold"
          >
            <MessageCircle className="w-4 h-4 ml-2" />
            قم بالترقية الآن
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-amber-800">ترقية لحساب مميز</CardTitle>
                <Badge className="bg-amber-200 text-amber-800 border-0 mt-1">
                  العرض محدود
                </Badge>
              </div>
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-amber-800">{formatPrice(25000)}</p>
              <p className="text-sm text-amber-600">ألف جنيه/شهر</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <Check className="w-4 h-4 text-amber-600" />
              <span>إعلانات مميزة</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <Check className="w-4 h-4 text-amber-600" />
              <span>كريديت إضافي</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <Check className="w-4 h-4 text-amber-600" />
              <span>أولوية في النتائج</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <Check className="w-4 h-4 text-amber-600" />
              <span>دعم فني مخصص</span>
            </div>
          </div>
          
          <Button 
            onClick={handleWhatsAppContact}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold"
          >
            <MessageCircle className="w-4 h-4 ml-2" />
            قم بالترقية الآن
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Default home variant
  return (
    <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">الخطة المميزة</CardTitle>
              <Badge className="bg-white/20 text-white border-0 mt-1">
                احصل على المزيد من المشاهدات
              </Badge>
            </div>
          </div>
          <div className="text-left">
            <p className="text-3xl font-bold text-white">{formatPrice(25000)}</p>
            <p className="text-amber-100">ألف جنيه سوداني شهرياً</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-white" />
              <span className="text-white">إعلانات مميزة في المقدمة</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-white" />
              <span className="text-white">100 كريديت إضافي شهرياً</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-white" />
              <span className="text-white">أولوية في نتائج البحث</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-white" />
              <span className="text-white">شارة "موثق" على الحساب</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-white" />
              <span className="text-white">دعم فني مخصص 24/7</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-white" />
              <span className="text-white">تقارير مفصلة للمشاهدات</span>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleWhatsAppContact}
          size="lg"
          className="w-full bg-white text-amber-600 hover:bg-white/90 font-bold text-lg h-14"
        >
          <MessageCircle className="w-5 h-5 ml-3" />
          قم بالترقية الآن عبر واتساب
        </Button>
      </CardContent>
    </Card>
  );
};

export default PremiumCard;
