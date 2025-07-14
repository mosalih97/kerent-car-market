
import { Car, Mail, MessageCircle } from "lucide-react";
import PremiumCard from "./PremiumCard";

const Footer = () => {
  const handleWhatsAppContact = () => {
    const phoneNumber = "+249966960202";
    const message = "مرحباً، أحتاج للمساعدة";
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          
          {/* معلومات الشركة */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Car className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-3xl font-bold">الكيرين</h3>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              موقع السيارات الأول في السودان، نربط بين البائعين والمشترين بسهولة وأمان
            </p>
            
            {/* قسم تواصل معنا */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="text-xl font-bold mb-4 text-blue-400">تواصل معنا</h4>
              <div className="space-y-4">
                <button
                  onClick={handleWhatsAppContact}
                  className="flex items-center gap-3 p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors w-full text-right"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>تواصل معنا عبر واتساب</span>
                </button>
                
                <a
                  href="mailto:info@alkeren.com"
                  className="flex items-center gap-3 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors w-full text-right"
                >
                  <Mail className="w-5 h-5" />
                  <span>info@alkeren.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* الخطة المميزة */}
          <div>
            <PremiumCard variant="footer" />
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 الكيرين. جميع الحقوق محفوظة</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
