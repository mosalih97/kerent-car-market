
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber: string;
}

const WhatsAppButton = ({ phoneNumber }: WhatsAppButtonProps) => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('مرحباً، أريد الاستفسار عن موقع الكرين للسيارات');
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 left-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
      aria-label="تواصل عبر واتساب"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        تواصل عبر واتساب
      </span>
    </button>
  );
};

export default WhatsAppButton;
