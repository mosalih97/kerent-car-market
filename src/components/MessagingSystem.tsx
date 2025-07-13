
import { useState, useEffect } from 'react';
import { MessageCircle, Send, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';

const MessagingSystem = () => {
  const { user } = useAuth();
  const { messages, sendMessage, markAsRead, isLoading } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    await sendMessage({
      content: newMessage,
      conversationId: selectedConversation
    });
    
    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ar-SD', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-96 flex border rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-4 border-b bg-white">
          <h3 className="font-semibold flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            المحادثات
          </h3>
        </div>
        <ScrollArea className="h-full">
          {messages.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">لا توجد محادثات</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {messages.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full p-3 text-right rounded-lg transition-colors ${
                    selectedConversation === conversation.id
                      ? 'bg-blue-100 border-blue-300'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-sm">
                      {conversation.participantName || 'مستخدم'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {conversation.lastMessage}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {formatTime(conversation.updatedAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b bg-white">
              <h4 className="font-semibold">المحادثة</h4>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {/* Mock messages */}
                <div className="flex justify-end">
                  <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                    <p className="text-sm">مرحباً، أريد الاستفسار عن السيارة</p>
                    <span className="text-xs opacity-75">14:30</span>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-xs">
                    <p className="text-sm">أهلاً وسهلاً، كيف يمكنني مساعدتك؟</p>
                    <span className="text-xs opacity-75">14:35</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="اكتب رسالتك..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="text-right"
                />
                <Button onClick={handleSendMessage} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>اختر محادثة لبدء المراسلة</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingSystem;
