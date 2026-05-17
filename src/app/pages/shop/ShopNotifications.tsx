import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Package,
  Banknote,
  Trash2,
  Check,
  X,
  Filter
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

// Mock notification data
const mockNotifications = [
  {
    id: 'not-001',
    type: 'new-order',
    title: 'New Order Received',
    message: 'John Doe placed a new order (ORD-001) for Assignment_Chapter_5.pdf',
    timestamp: '2026-04-02T10:30:00',
    isRead: false,
    priority: 'high',
    orderId: 'ORD-001'
  },
  {
    id: 'not-002',
    type: 'payment-verified',
    title: 'Payment Verified',
    message: 'GCash payment for Order ORD-002 has been verified successfully',
    timestamp: '2026-04-02T09:15:00',
    isRead: false,
    priority: 'medium',
    orderId: 'ORD-002'
  },
  {
    id: 'not-003',
    type: 'order-ready',
    title: 'Order Ready for Pickup',
    message: 'Order ORD-003 is ready for pickup at Main Library',
    timestamp: '2026-04-02T08:45:00',
    isRead: true,
    priority: 'medium',
    orderId: 'ORD-003'
  },
  {
    id: 'not-004',
    type: 'order-completed',
    title: 'Order Completed',
    message: 'Jane Smith picked up Order ORD-004',
    timestamp: '2026-04-01T16:20:00',
    isRead: true,
    priority: 'low',
    orderId: 'ORD-004'
  },
  {
    id: 'not-005',
    type: 'payment-pending',
    title: 'Payment Verification Needed',
    message: 'New order ORD-005 awaiting payment verification (₱125.50)',
    timestamp: '2026-04-01T14:10:00',
    isRead: false,
    priority: 'high',
    orderId: 'ORD-005'
  },
  {
    id: 'not-006',
    type: 'system',
    title: 'System Update',
    message: 'PrintFlow will undergo maintenance tonight from 11 PM to 1 AM',
    timestamp: '2026-04-01T12:00:00',
    isRead: true,
    priority: 'low'
  },
];

export default function ShopNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
    toast.success('Marked as read');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    toast.success('All notifications marked as read');
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
    toast.success('Notification deleted');
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new-order':
        return <Package className="w-5 h-5" />;
      case 'payment-verified':
        return <CheckCircle className="w-5 h-5" />;
      case 'payment-pending':
        return <Banknote className="w-5 h-5" />;
      case 'order-ready':
        return <CheckCircle className="w-5 h-5" />;
      case 'order-completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'system':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new-order':
        return 'from-blue-500 to-blue-600';
      case 'payment-verified':
        return 'from-emerald-500 to-emerald-600';
      case 'payment-pending':
        return 'from-amber-500 to-amber-600';
      case 'order-ready':
        return 'from-[#00736D] to-[#002E2C]';
      case 'order-completed':
        return 'from-gray-500 to-gray-600';
      case 'system':
        return 'from-violet-500 to-violet-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: { label: 'High', className: 'bg-red-50 text-red-700 border-red-200' },
      medium: { label: 'Medium', className: 'bg-amber-50 text-amber-700 border-amber-200' },
      low: { label: 'Low', className: 'bg-gray-50 text-gray-700 border-gray-200' },
    };
    const config = variants[priority as keyof typeof variants] || variants['low'];
    return <Badge className={`${config.className} border text-xs`}>{config.label}</Badge>;
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F1F0] via-white to-[#E6F1F0]">
      {/* Modern Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-[#80B9B6]/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/shop')}
                className="gap-2 hover:bg-[#E6F1F0] transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00736D] to-[#002E2C] rounded-2xl blur opacity-20"></div>
                  <div className="relative bg-gradient-to-br from-[#00736D] to-[#002E2C] p-3 rounded-2xl shadow-lg">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00736D] to-[#002E2C] bg-clip-text text-transparent">
                    Notifications
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="gap-2 border-[#80B9B6]/30 hover:bg-[#E6F1F0] hidden sm:flex"
                  disabled={unreadCount === 0}
                >
                  <Check className="w-4 h-4" />
                  Mark All Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear All</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Filter Tabs */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4 bg-white/70 backdrop-blur-sm border-[#80B9B6]/20">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-[#00736D]" />
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                    className={`transition-all ${
                      filter === 'all'
                        ? 'bg-gradient-to-r from-[#00736D] to-[#002E2C] text-white'
                        : 'hover:bg-[#E6F1F0]'
                    }`}
                  >
                    All ({notifications.length})
                  </Button>
                  <Button
                    variant={filter === 'unread' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('unread')}
                    className={`transition-all ${
                      filter === 'unread'
                        ? 'bg-gradient-to-r from-[#00736D] to-[#002E2C] text-white'
                        : 'hover:bg-[#E6F1F0]'
                    }`}
                  >
                    Unread ({unreadCount})
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-16 text-center bg-white/50 backdrop-blur-sm border-[#80B9B6]/20">
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 bg-[#E6F1F0] rounded-full">
                  <Bell className="w-12 h-12 text-[#00736D]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#002E2C] mb-2">
                    {filter === 'unread' ? 'All caught up!' : 'No notifications'}
                  </h3>
                  <p className="text-gray-600">
                    {filter === 'unread' 
                      ? 'You have no unread notifications at the moment.' 
                      : 'You have no notifications yet. New notifications will appear here.'}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`p-6 transition-all duration-300 group ${
                    notification.isRead
                      ? 'bg-white/50 backdrop-blur-sm border-[#80B9B6]/10 hover:shadow-md'
                      : 'bg-white/90 backdrop-blur-sm border-[#80B9B6]/30 hover:shadow-xl shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 bg-gradient-to-br ${getNotificationColor(notification.type)} rounded-xl text-white shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className={`font-bold text-base ${notification.isRead ? 'text-gray-700' : 'text-[#002E2C]'}`}>
                              {notification.title}
                            </h3>
                            {getPriorityBadge(notification.priority)}
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-[#00736D] rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <p className={`text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                            {notification.message}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between gap-3 mt-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{getTimeAgo(notification.timestamp)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {notification.orderId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/shop/order/${notification.orderId}`)}
                              className="h-8 text-xs gap-1 text-[#00736D] hover:bg-[#E6F1F0]"
                            >
                              View Order
                            </Button>
                          )}
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-8 text-xs gap-1 hover:bg-[#E6F1F0]"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Mark Read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                            className="h-8 text-xs gap-1 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
