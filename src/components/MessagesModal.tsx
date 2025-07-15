
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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

interface ConversationData {
  userId: string;
  userName: string;
  messages: any[];
  lastMessage: any;
  unreadCount: number;
}

const MessagesModal = ({ open, onOpenChange }: MessagesModalProps) => {
  const { user } = useAuth();
  const { messages, sendMessage, markAsRead, isSending } = useMessages();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  console.log('All messages in modal:', messages);

  // Group messages by conversation
  const conversations: Record<string, ConversationData> = messages?.reduce((acc: any, message: any) => {
    const isUserSender = message.sender_id === user?.id;
    const otherUserId = isUserSender ? message.receiver_id : message.sender_id;
    
    // Get other user name safely
    let otherUserName = 'مستخدم';
    if (isUserSender && message.receiver && message.receiver.full_name) {
      otherUserName = message.receiver.full_name;
    } else if (!isUserSender && message.sender && message.sender.full_name) {
      otherUserName = message.sender.full_name;
    }
    
    if (!acc[otherUserId]) {
      acc[otherUserId] = {
        userId: otherUserId,
        userName: otherUserName,
        messages: [],
        lastMessage: message,
        unreadCount: 0
      };
    }
    
    acc[otherUserId].messages.push(message);
    
    // Count unread messages in this conversation
    if (message.receiver_id === user?.id && !message.is_read) {
      acc[otherUserId].unreadCount++;
    }
    
    // Update last message if this one is newer
    if (new Date(message.created_at) > new Date(acc[otherUserId].lastMessage.created_at)) {
      acc[otherUserId].lastMessage = message;
    }
    
    return acc;
  }, {}) || {};

  console.log('Grouped conversations:', conversations);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedConversation, conversations]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    console.log('Sending message to:', selectedConversation, 'Content:', newMessage);
    
    sendMessage({
      receiverId: selectedConversation,
      content: newMessage
    });
    
    setNewMessage('');
  };

  const handleConversationClick = (conversationId: string) => {
    console.log('Opening conversation:', conversationId);
    setSelectedConversation(conversationId);
    
    // Mark all messages in this conversation as read
    const conversation = conversations[conversationId];
    if (conversation) {
      conversation.messages.forEach((message: any) => {
        if (message.receiver_id === user?.id && !message.is_read) {
          console.log('Marking message as read:', message.id);
          markAsRead(message.id);
        }
      });
    }
  };

  const selectedConversationData = selectedConversation ? conversations[selectedConversation] : null;
  const conversationsList = Object.values(conversations);

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
          {/* Conversations List */}
          <div className="w-1/3 border-l border-gray-200 pl-4">
            <ScrollArea className="h-full">
              {conversationsList.length > 0 ? (
                conversationsList.map((conversation) => (
                  <div
                    key={conversation.userId}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 mb-2 transition-colors ${
                      selectedConversation === conversation.userId ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                    onClick={() => handleConversationClick(conversation.userId)}
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
                            {conversation.userName}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate mt-1">
                          {conversation.lastMessage.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(conversation.lastMessage.created_at).toLocaleString('ar-SD')}
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

          {/* Selected Conversation */}
          <div className="flex-1 flex flex-col pr-4">
            {selectedConversationData ? (
              <>
                {/* Conversation Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200 mb-4">
                  <Avatar>
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {selectedConversationData.userName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedConversationData.messages.length} رسالة
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 mb-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {selectedConversationData.messages
                      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((message: any) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_id === user?.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs opacity-70">
                                {new Date(message.created_at).toLocaleTimeString('ar-SD')}
                              </p>
                              {message.sender_id === user?.id && (
                                <span className="text-xs opacity-70">
                                  {message.is_read ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </ScrollArea>
                
                {/* Message Input */}
                <div className="flex gap-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب رسالتك..."
                    className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isSending || !newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>اختر محادثة لعرضها</p>
                  {conversationsList.length > 0 && (
                    <p className="text-sm text-gray-400 mt-2">
                      انقر على إحدى المحادثات في القائمة للبدء
                    </p>
                  )}
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
