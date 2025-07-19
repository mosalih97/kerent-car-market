import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, 
  MessageSquare, 
  User, 
  Search, 
  X, 
  Phone, 
  Info,
  Check,
  CheckCheck,
  Trash2,
  Archive
} from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MessagingCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialReceiverId?: string;
  initialAdId?: string;
}

interface ConversationData {
  userId: string;
  userName: string;
  messages: any[];
  lastMessage: any;
  unreadCount: number;
  userPhone?: string;
}

const MessagingCenter = ({ open, onOpenChange, initialReceiverId, initialAdId }: MessagingCenterProps) => {
  const { user } = useAuth();
  const { messages, sendMessage, markAsRead, isSending } = useMessages();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(initialReceiverId || null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch all users for new message dialog
  const { data: allUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .neq('id', user?.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && showNewMessageDialog,
  });

  // Group messages by conversation
  const conversations: Record<string, ConversationData> = messages?.reduce((acc: any, message: any) => {
    const isUserSender = message.sender_id === user?.id;
    const otherUserId = isUserSender ? message.receiver_id : message.sender_id;
    const otherUserData = isUserSender ? message.receiver : message.sender;
    const otherUserName = otherUserData?.full_name || 'مستخدم';
    const otherUserPhone = otherUserData?.phone;
    
    if (!acc[otherUserId]) {
      acc[otherUserId] = {
        userId: otherUserId,
        userName: otherUserName,
        userPhone: otherUserPhone,
        messages: [],
        lastMessage: message,
        unreadCount: 0
      };
    }
    
    acc[otherUserId].messages.push(message);
    
    // Count unread messages
    if (message.receiver_id === user?.id && !message.is_read) {
      acc[otherUserId].unreadCount++;
    }
    
    // Update last message if newer
    if (new Date(message.created_at) > new Date(acc[otherUserId].lastMessage.created_at)) {
      acc[otherUserId].lastMessage = message;
    }
    
    return acc;
  }, {}) || {};

  // Filter conversations based on search and active tab
  const filteredConversations = Object.values(conversations).filter((conv: ConversationData) => {
    const matchesSearch = conv.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'unread') {
      return matchesSearch && conv.unreadCount > 0;
    }
    
    return matchesSearch;
  }).sort((a, b) => {
    // Sort by last message time
    return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedConversation, conversations]);

  // Set initial conversation if provided
  useEffect(() => {
    if (initialReceiverId && open) {
      setSelectedConversation(initialReceiverId);
    }
  }, [initialReceiverId, open]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessage({
      receiverId: selectedConversation,
      content: newMessage,
      adId: initialAdId
    });
    
    setNewMessage('');
  };

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversation(conversationId);
    
    // Mark all messages in this conversation as read
    const conversation = conversations[conversationId];
    if (conversation) {
      conversation.messages.forEach((message: any) => {
        if (message.receiver_id === user?.id && !message.is_read) {
          markAsRead(message.id);
        }
      });
    }
  };

  const handleStartNewConversation = (userId: string, userName: string) => {
    setSelectedConversation(userId);
    setShowNewMessageDialog(false);
    
    // Create a temporary conversation entry if it doesn't exist
    if (!conversations[userId]) {
      conversations[userId] = {
        userId,
        userName,
        messages: [],
        lastMessage: null,
        unreadCount: 0
      };
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'الآن';
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours}س`;
    } else {
      return date.toLocaleDateString('ar-SD');
    }
  };

  const selectedConversationData = selectedConversation ? conversations[selectedConversation] : null;
  const totalUnread = Object.values(conversations).reduce((total, conv) => total + conv.unreadCount, 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[700px] p-0" dir="rtl">
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-1/3 border-l border-border bg-muted/10">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    المراسلة
                  </h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowNewMessageDialog(true)}
                  >
                    رسالة جديدة
                  </Button>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث في المحادثات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 m-2">
                  <TabsTrigger value="all">الكل ({filteredConversations.length})</TabsTrigger>
                  <TabsTrigger value="unread">
                    غير مقروءة 
                    {totalUnread > 0 && (
                      <Badge variant="destructive" className="mr-1 text-xs">
                        {totalUnread}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="m-0">
                  <ScrollArea className="h-[500px]">
                    {filteredConversations.map((conversation) => (
                      <ConversationItem
                        key={conversation.userId}
                        conversation={conversation}
                        isSelected={selectedConversation === conversation.userId}
                        onClick={() => handleConversationClick(conversation.userId)}
                      />
                    ))}
                    {filteredConversations.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>لا توجد محادثات</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="unread" className="m-0">
                  <ScrollArea className="h-[500px]">
                    {filteredConversations.filter(conv => conv.unreadCount > 0).map((conversation) => (
                      <ConversationItem
                        key={conversation.userId}
                        conversation={conversation}
                        isSelected={selectedConversation === conversation.userId}
                        onClick={() => handleConversationClick(conversation.userId)}
                      />
                    ))}
                    {filteredConversations.filter(conv => conv.unreadCount > 0).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Check className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>جميع الرسائل مقروءة</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversationData ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border bg-background">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {selectedConversationData.userName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedConversationData.messages.length} رسالة
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {selectedConversationData.userPhone && (
                          <Button variant="outline" size="sm">
                            <Phone className="w-4 h-4 ml-1" />
                            {selectedConversationData.userPhone}
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Info className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {selectedConversationData.messages
                        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                        .map((message: any) => (
                          <MessageBubble
                            key={message.id}
                            message={message}
                            isOwn={message.sender_id === user?.id}
                          />
                        ))
                      }
                    </div>
                  </ScrollArea>
                  
                  {/* Message Input */}
                  <div className="p-4 border-t border-border bg-background">
                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="اكتب رسالتك..."
                        className="flex-1 min-h-[60px] max-h-[120px] resize-none"
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
                        className="self-end"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">اختر محادثة</h3>
                    <p className="text-sm">
                      اختر محادثة من القائمة أو ابدأ محادثة جديدة
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Message Dialog */}
      <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>رسالة جديدة</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">اختر المستخدم:</label>
              <ScrollArea className="h-48 border rounded-md p-2">
                {allUsers?.map((user) => (
                  <div
                    key={user.id}
                    className="p-2 hover:bg-muted rounded-md cursor-pointer flex items-center gap-2"
                    onClick={() => handleStartNewConversation(user.id, user.full_name)}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.full_name}</p>
                      {user.phone && (
                        <p className="text-xs text-muted-foreground">{user.phone}</p>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Conversation Item Component
const ConversationItem = ({ conversation, isSelected, onClick }: {
  conversation: ConversationData;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <div
    className={`p-3 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
      isSelected ? 'bg-muted border-l-4 border-l-primary' : ''
    }`}
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <Avatar className="w-10 h-10">
        <AvatarFallback>
          <User className="w-5 h-5" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm truncate">
            {conversation.userName}
          </span>
          <div className="flex items-center gap-2">
            {conversation.lastMessage && (
              <span className="text-xs text-muted-foreground">
                {formatMessageTime(conversation.lastMessage.created_at)}
              </span>
            )}
            {conversation.unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>
        {conversation.lastMessage && (
          <p className="text-xs text-muted-foreground truncate mt-1">
            {conversation.lastMessage.content}
          </p>
        )}
      </div>
    </div>
  </div>
);

// Message Bubble Component
const MessageBubble = ({ message, isOwn }: { message: any; isOwn: boolean }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
        isOwn
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-foreground'
      }`}
    >
      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      <div className="flex items-center justify-between mt-1 gap-2">
        <span className="text-xs opacity-70">
          {new Date(message.created_at).toLocaleTimeString('ar-SD', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
        {isOwn && (
          <span className="text-xs opacity-70">
            {message.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
          </span>
        )}
      </div>
    </div>
  </div>
);

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'الآن';
  } else if (diffInHours < 24) {
    return `منذ ${diffInHours}س`;
  } else {
    return date.toLocaleDateString('ar-SD');
  }
}

export default MessagingCenter;