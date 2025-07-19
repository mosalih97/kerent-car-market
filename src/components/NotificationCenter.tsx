import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Search, 
  Filter,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Star,
  Car,
  User,
  Settings,
  Trash2,
  Archive,
  MoreVertical
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface NotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationCenter = ({ open, onOpenChange }: NotificationCenterProps) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filter notifications based on search, tab, and type filter
  const filteredNotifications = notifications?.filter((notification) => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'unread' && !notification.is_read) ||
      (activeTab === 'read' && notification.is_read);
    
    const matchesFilter = selectedFilter === 'all' || notification.type === selectedFilter;
    
    return matchesSearch && matchesTab && matchesFilter;
  }) || [];

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups: any, notification) => {
    const date = new Date(notification.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {});

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'ad_status':
        return <Car className="w-5 h-5 text-green-500" />;
      case 'ad_featured':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'report':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'system':
        return <Settings className="w-5 h-5 text-gray-500" />;
      case 'user':
        return <User className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message':
        return 'border-l-blue-500 bg-blue-50/50';
      case 'ad_status':
        return 'border-l-green-500 bg-green-50/50';
      case 'ad_featured':
        return 'border-l-yellow-500 bg-yellow-50/50';
      case 'report':
        return 'border-l-red-500 bg-red-50/50';
      case 'system':
        return 'border-l-gray-500 bg-gray-50/50';
      case 'user':
        return 'border-l-purple-500 bg-purple-50/50';
      default:
        return 'border-l-gray-300 bg-gray-50/50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'منذ دقائق';
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else if (diffInHours < 48) {
      return 'أمس';
    } else {
      return date.toLocaleDateString('ar-SD');
    }
  };

  const formatGroupDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'اليوم';
    } else if (diffInDays === 1) {
      return 'أمس';
    } else if (diffInDays < 7) {
      return `منذ ${diffInDays} أيام`;
    } else {
      return date.toLocaleDateString('ar-SD');
    }
  };

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
  const totalCount = notifications?.length || 0;

  const notificationTypes = [
    { value: 'all', label: 'الكل', count: totalCount },
    { value: 'message', label: 'رسائل', count: notifications?.filter(n => n.type === 'message').length || 0 },
    { value: 'ad_status', label: 'إعلانات', count: notifications?.filter(n => n.type === 'ad_status').length || 0 },
    { value: 'system', label: 'نظام', count: notifications?.filter(n => n.type === 'system').length || 0 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[700px] p-0" dir="rtl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">مركز الإشعارات</h2>
                  <p className="text-sm text-muted-foreground">
                    {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllAsRead()}
                  >
                    <CheckCheck className="w-4 h-4 ml-1" />
                    قراءة الكل
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {notificationTypes.map((type) => (
                      <DropdownMenuItem
                        key={type.value}
                        onClick={() => setSelectedFilter(type.value)}
                        className="flex items-center justify-between"
                      >
                        <span>{type.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {type.count}
                        </Badge>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ابحث في الإشعارات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
              <TabsTrigger value="all">
                الكل ({totalCount})
              </TabsTrigger>
              <TabsTrigger value="unread">
                غير مقروءة 
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="mr-1 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="read">
                مقروءة ({totalCount - unreadCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 m-0">
              <NotificationsList 
                groupedNotifications={groupedNotifications}
                markAsRead={markAsRead}
                getNotificationIcon={getNotificationIcon}
                getNotificationColor={getNotificationColor}
                formatDate={formatDate}
                formatGroupDate={formatGroupDate}
              />
            </TabsContent>

            <TabsContent value="unread" className="flex-1 m-0">
              <NotificationsList 
                groupedNotifications={groupedNotifications}
                markAsRead={markAsRead}
                getNotificationIcon={getNotificationIcon}
                getNotificationColor={getNotificationColor}
                formatDate={formatDate}
                formatGroupDate={formatGroupDate}
              />
            </TabsContent>

            <TabsContent value="read" className="flex-1 m-0">
              <NotificationsList 
                groupedNotifications={groupedNotifications}
                markAsRead={markAsRead}
                getNotificationIcon={getNotificationIcon}
                getNotificationColor={getNotificationColor}
                formatDate={formatDate}
                formatGroupDate={formatGroupDate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const NotificationsList = ({ 
  groupedNotifications, 
  markAsRead, 
  getNotificationIcon, 
  getNotificationColor, 
  formatDate, 
  formatGroupDate 
}: any) => (
  <ScrollArea className="flex-1 px-4">
    {Object.keys(groupedNotifications).length > 0 ? (
      <div className="space-y-6 pb-4">
        {Object.entries(groupedNotifications).map(([date, notifications]: [string, any]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">
                {formatGroupDate(date)}
              </h3>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            
            <div className="space-y-2">
              {notifications.map((notification: any) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  markAsRead={markAsRead}
                  getNotificationIcon={getNotificationIcon}
                  getNotificationColor={getNotificationColor}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">لا توجد إشعارات</h3>
          <p className="text-sm">ستظهر الإشعارات الجديدة هنا</p>
        </div>
      </div>
    )}
  </ScrollArea>
);

const NotificationItem = ({ 
  notification, 
  markAsRead, 
  getNotificationIcon, 
  getNotificationColor, 
  formatDate 
}: any) => (
  <div
    className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${
      getNotificationColor(notification.type)
    } ${
      notification.is_read 
        ? 'opacity-75' 
        : 'shadow-sm'
    }`}
    onClick={() => !notification.is_read && markAsRead(notification.id)}
  >
    <div className="flex items-start gap-3">
      <div className="mt-1">
        {getNotificationIcon(notification.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <h4 className={`font-medium text-sm ${!notification.is_read ? 'font-semibold' : ''}`}>
            {notification.title}
          </h4>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(notification.created_at)}
            </span>
            {!notification.is_read && (
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            )}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
          {notification.content}
        </p>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {getTypeLabel(notification.type)}
          </Badge>
          
          {notification.is_read && (
            <Check className="w-4 h-4 text-green-500" />
          )}
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Archive className="w-4 h-4 ml-2" />
            أرشفة
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            <Trash2 className="w-4 h-4 ml-2" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);

function getTypeLabel(type: string): string {
  switch (type) {
    case 'message':
      return 'رسالة';
    case 'ad_status':
      return 'إعلان';
    case 'ad_featured':
      return 'مميز';
    case 'report':
      return 'بلاغ';
    case 'system':
      return 'نظام';
    case 'user':
      return 'مستخدم';
    default:
      return 'عام';
  }
}

export default NotificationCenter;