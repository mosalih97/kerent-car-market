import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface QuickMessageButtonProps {
  receiverId: string;
  receiverName: string;
  adId?: string;
  adTitle?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const QuickMessageButton = ({ 
  receiverId, 
  receiverName, 
  adId, 
  adTitle,
  variant = 'default',
  size = 'default',
  className 
}: QuickMessageButtonProps) => {
  const { user } = useAuth();
  const { sendMessage, isSending } = useMessages();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Don't show button if user is trying to message themselves
  if (user?.id === receiverId) {
    return null;
  }

  const messageTemplates = [
    'السلام عليكم، أريد الاستفسار عن هذا الإعلان',
    'هل السيارة متاحة للمعاينة؟',
    'ما هو آخر سعر؟',
    'هل يمكن التفاوض في السعر؟',
    'أين مكان السيارة بالضبط؟',
    'هل تقبل المقايضة؟',
    'متى يمكنني معاينة السيارة؟'
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى كتابة رسالة",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendMessage({
        receiverId,
        content: message,
        adId
      });
      
      setMessage('');
      setOpen(false);
      
      toast({
        title: "تم إرسال الرسالة",
        description: `تم إرسال رسالتك إلى ${receiverName}`,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTemplateSelect = (template: string) => {
    setMessage(template);
    setSelectedTemplate(template);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          disabled={!user}
        >
          <MessageCircle className="w-4 h-4 ml-2" />
          راسل المعلن
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            رسالة إلى {receiverName}
          </DialogTitle>
          {adTitle && (
            <p className="text-sm text-muted-foreground">
              بخصوص: {adTitle}
            </p>
          )}
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Quick Templates */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              رسائل سريعة:
            </label>
            <div className="grid gap-2">
              {messageTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant={selectedTemplate === template ? "default" : "outline"}
                  size="sm"
                  className="justify-start text-right h-auto p-2 whitespace-normal"
                  onClick={() => handleTemplateSelect(template)}
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Custom Message */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              أو اكتب رسالتك:
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              className="min-h-[100px]"
              dir="rtl"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !message.trim()}
            >
              <Send className="w-4 h-4 ml-2" />
              {isSending ? 'جارٍ الإرسال...' : 'إرسال'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickMessageButton;