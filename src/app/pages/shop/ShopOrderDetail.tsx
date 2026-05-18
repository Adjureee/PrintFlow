import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router';
import { motion } from 'motion/react';
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Download,
  Package
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { fetchOrderById, type OrderFetchState } from '../../lib/orders-api';
import { useAuth } from '../../lib/auth-context';
import { PageLoader } from '../../components/ui/page-loader';
import type { Order } from '../../lib/store';

const SIZE_LABELS: Record<string, string> = {
  letter: 'Letter (8.5" × 11")',
  legal: 'Legal (8.5" × 14")',
  a4: 'A4 (210 × 297mm)',
};

function formatSettings(order: Order) {
  return {
    color: order.settings.color === 'bw' ? 'Black & White' : 'Full Color',
    size: SIZE_LABELS[order.settings.size] ?? order.settings.size,
    copies: order.settings.copies,
  };
}

export default function ShopOrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { accessToken } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [fetchState, setFetchState] = useState<OrderFetchState>('idle');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!orderId?.trim()) {
      setOrder(null);
      setFetchState('not_found');
      return;
    }
    setFetchState('loading');
    try {
      const result = await fetchOrderById(orderId, accessToken);
      if (result) {
        setOrder(result);
        setFetchState('success');
      } else {
        setOrder(null);
        setFetchState('not_found');
      }
    } catch (err) {
      console.error('Shop order fetch failed:', err);
      setOrder(null);
      setFetchState('error');
      toast.error('Failed to load order');
    }
  }, [orderId, accessToken]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  if (!orderId?.trim()) {
    return <Navigate to="/shop" replace />;
  }

  if (fetchState === 'loading' || fetchState === 'idle') {
    return (
      <div className="min-h-screen bg-[#E6F1F0]/30">
        <PageLoader label="Loading order…" />
      </div>
    );
  }

  if (fetchState === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <p className="font-medium text-[#002E2C]">Could not load order.</p>
        <Button onClick={() => void loadOrder()}>Retry</Button>
      </div>
    );
  }

  if (fetchState === 'not_found' || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-600">Order not found</p>
        <Button onClick={() => navigate('/shop')}>Back to Dashboard</Button>
      </div>
    );
  }

  const displaySettings = formatSettings(order);

  const handleVerifyAccept = () => {
    toast.success('Order verified and accepted!');
    setTimeout(() => navigate('/shop'), 1500);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    toast.success('Order rejected');
    setTimeout(() => navigate('/shop'), 1500);
  };

  const handleStartProcessing = () => {
    toast.success('Order status updated to Processing');
  };

  const handleMarkReady = () => {
    toast.success('Order marked as Ready for Pickup!');
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      'awaiting-verification': { 
        label: 'Needs Verification', 
        color: 'bg-amber-500',
        lightColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200'
      },
      'processing': { 
        label: 'In Progress', 
        color: 'bg-blue-500',
        lightColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200'
      },
      'ready': { 
        label: 'Ready for Pickup', 
        color: 'bg-emerald-500',
        lightColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200'
      },
      'completed': { 
        label: 'Completed', 
        color: 'bg-gray-400',
        lightColor: 'bg-gray-50',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-200'
      },
    };
    return configs[status as keyof typeof configs] || configs['processing'];
  };

  const statusConfig = getStatusConfig(order.status);

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    };
  };

  const dateTime = formatDateTime(order.createdAt.toISOString());

  const handleDownload = () => {
    if (!order.fileUrl || order.fileUrl.startsWith('mock://')) {
      toast.error('Document not available for download');
      return;
    }
    window.open(order.fileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#E6F1F0]/30">
      {/* Header */}
      <div className="bg-white border-b border-[#80B9B6]/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/shop')}
              className="flex-shrink-0 hover:bg-[#E6F1F0] hover:text-[#00736D]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-[#002E2C] truncate">Order Details</h1>
              <p className="text-xs sm:text-sm text-[#00736D] font-mono">{order.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4 sm:space-y-6">
        
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white border-[#80B9B6]/20 overflow-hidden shadow-sm">
            <div className={`h-1.5 ${statusConfig.color}`} />
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-[#80B9B6] mb-1 font-medium">Current Status</p>
                  <Badge 
                    className={`${statusConfig.lightColor} ${statusConfig.textColor} border ${statusConfig.borderColor} font-semibold px-4 py-1.5 text-sm`}
                  >
                    {statusConfig.label}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#80B9B6] mb-1 font-medium">Order Time</p>
                  <p className="text-sm font-semibold text-[#002E2C]">{dateTime.date}</p>
                  <p className="text-xs text-[#00736D]/70">{dateTime.time}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Student Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="p-5 sm:p-6 bg-white border-[#80B9B6]/20 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-[#002E2C] mb-4 sm:mb-5">Student Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#80B9B6] mb-1 font-medium">Name</p>
                  <p className="text-sm sm:text-base font-semibold text-[#002E2C]">{order.studentName}</p>
                </div>
                
                <div>
                  <p className="text-xs text-[#80B9B6] mb-1 font-medium">Student ID</p>
                  <p className="text-sm sm:text-base font-semibold text-[#002E2C]">{order.studentId}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#80B9B6] mb-1 font-medium">Location</p>
                  <p className="text-xs sm:text-sm text-[#002E2C]/70 break-all">{order.location}</p>
                </div>
                
                <div>
                  <p className="text-xs text-[#80B9B6] mb-1 font-medium">Claim Code</p>
                  <p className="text-xs sm:text-sm font-mono text-[#002E2C]/70">{order.claimCode}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Document & Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-5 sm:p-6 bg-white border-[#80B9B6]/20 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-[#002E2C] mb-4 sm:mb-5">Order Details</h2>
            
            <div className="space-y-5">
              {/* Document Name */}
              <div>
                <p className="text-xs text-[#80B9B6] mb-2 font-medium">Document</p>
                <div className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-[#E6F1F0]/50 rounded-lg border border-[#80B9B6]/20">
                  <p className="text-sm sm:text-base font-semibold text-[#002E2C] break-words flex-1">
                    {order.fileName}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    type="button"
                    onClick={handleDownload}
                    className="flex-shrink-0 hover:bg-white hover:text-[#00736D]"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="h-px bg-[#E6F1F0]" />

              {/* Print Settings */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-[#80B9B6] mb-1 font-medium">Copies</p>
                  <p className="text-xl sm:text-2xl font-bold text-[#002E2C]">{displaySettings.copies}</p>
                </div>
                
                <div>
                  <p className="text-xs text-[#80B9B6] mb-1 font-medium">Color Mode</p>
                  <p className="text-sm sm:text-base font-semibold text-[#002E2C]">{displaySettings.color}</p>
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs text-[#80B9B6] mb-1 font-medium">Paper Size</p>
                  <p className="text-sm sm:text-base font-semibold text-[#002E2C]">{displaySettings.size}</p>
                </div>
              </div>

              <div className="h-px bg-[#E6F1F0]" />

              {/* Payment Info */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-[#80B9B6] mb-1 font-medium">GCash Reference</p>
                  <p className="text-sm font-mono text-[#002E2C] bg-[#E6F1F0]/50 px-3 py-2 rounded border border-[#80B9B6]/20">
                    {order.gcashRefNumber}
                  </p>
                </div>

                <div className="flex items-end justify-between pt-2">
                  <p className="text-sm text-[#00736D] font-semibold">Total Amount</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[#00736D]">₱{order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* QR Code (only for ready status) */}
        {order.status === 'ready' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="p-5 sm:p-6 bg-white border-[#80B9B6]/20 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-[#002E2C] mb-4 text-center">Claim QR Code</h2>
              
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 sm:p-6 rounded-xl border-2 border-[#80B9B6]/30 shadow-sm">
                  <QRCodeSVG
                    value={`CLAIM:${order.claimCode}`}
                    size={Math.min(200, window.innerWidth - 150)}
                    level="H"
                    includeMargin
                    className="max-w-full h-auto"
                  />
                </div>
                <p className="text-sm text-[#00736D] mt-4 text-center font-medium">
                  Student scans this code to claim order
                </p>
                <p className="text-xs font-mono text-[#80B9B6] mt-2 bg-[#E6F1F0]/50 px-3 py-1 rounded">{order.claimCode}</p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3 pb-6"
        >
          {order.status === 'awaiting-verification' && (
            <>
              {!showRejectForm ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={handleVerifyAccept}
                    className="h-12 sm:h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:opacity-90 text-white font-semibold text-sm sm:text-base shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Verify & Accept Order
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectForm(true)}
                    className="h-12 sm:h-14 border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm sm:text-base"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Reject Order
                  </Button>
                </div>
              ) : (
                <Card className="p-4 sm:p-5 bg-red-50 border-red-200">
                  <Label className="text-sm font-semibold text-[#002E2C] mb-2 block">
                    Rejection Reason
                  </Label>
                  <Textarea
                    placeholder="Explain why this order is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mb-3 border-red-200 focus:border-red-400 min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleReject}
                      className="flex-1 bg-red-600 hover:bg-red-700 h-11"
                    >
                      Confirm Rejection
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectionReason('');
                      }}
                      className="flex-1 h-11"
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}

          {order.status === 'processing' && (
            <Button
              onClick={handleMarkReady}
              className="w-full h-12 sm:h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:opacity-90 text-white font-semibold text-sm sm:text-base shadow-lg shadow-emerald-600/20"
            >
              <Package className="w-5 h-5 mr-2" />
              Mark as Ready for Pickup
            </Button>
          )}

          {(order.status === 'ready' || order.status === 'completed') && (
            <Button
              variant="outline"
              onClick={() => navigate('/shop')}
              className="w-full h-12 sm:h-14 font-semibold text-sm sm:text-base border-[#80B9B6]/30 hover:bg-[#E6F1F0] hover:border-[#00736D] hover:text-[#00736D]"
            >
              Back to Dashboard
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}