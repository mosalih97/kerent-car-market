
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageSquare, User } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';

interface MessagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MessagesModal = ({ open, onOpenChange }: MessagesModalProps) => {
  const { user } = useAuth();
  const { messages, sendMessage, markAsRead, isSending } = useMessages();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const conversations = messages?.reduce((acc: any, message: any) => {
    const otherUserId = message.sender_id === user?.id ? message.receiver_id : message.sender_id;
    const otherUser = message.sender_id === user?.id ? message.receiver : message.sender;
    
    if (!acc[otherUserId]) {
      acc[otherUserId] = {
        userId: otherUserId,
        user: otherUser,
        messages: [],
        lastMessage: message,
      };
    }
    
    acc[otherUserId].messages.push(message);
    if (new Date(message.created_at) > new Date(acc[otherUserId].lastMessage.created_at)) {
      acc[otherUserId].lastMessage = message;
    }
    
    return acc;
  }, {}) || {};

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessage({
      receiverId: selectedConversation,
      content: newMessage
    });
    
    setNewMessage('');
  };

  const handleMessageClick = (message: any) => {
    if (message.receiver_id === user?.id && !message.is_read) {
      markAsRead(message.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            الرسائل
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex h-full">
          {/* المحادثات */}
          <div className="w-1/3 border-l border-gray-200 pl-4">
            <ScrollArea className="h-full">
              {Object.values(conversations).length > 0 ? (
                Object.values(conversations).map((conversation: any) => (
                  <div
                    key={conversation.userId}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 mb-2 ${
                      selectedConversation === conversation.userId ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation.userId)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {conversation.user?.email || 'مستخدم'}
                          </span>
                          {!conversation.lastMessage.is_read && 
                           conversation.lastMessage.receiver_id === user?.id && (
                            <Badge variant="secondary" className="text-xs">جديد</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>لا توجد رسائل</p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* المحادثة المحددة */}
          <div className="flex-1 flex flex-col pr-4">
            {selectedConversation ? (
              <>
                <ScrollArea className="flex-1 mb-4">
                  {conversations[selectedConversation]?.messages
                    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((message: any) => (
                      <div
                        key={message.id}
                        className={`mb-4 ${message.sender_id === user?.id ? 'text-left' : 'text-right'}`}
                        onClick={() => handleMessageClick(message)}
                      >
                        <div
                          className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.created_at).toLocaleTimeString('ar-SD')}
                          </p>
                        </div>
                      </div>
                    ))
                  }
                </ScrollArea>
                
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب رسالتك..."
                    className="flex-1 min-h-[40px] max-h-[120px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>اختر محادثة لعرضها</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessagesModal;
