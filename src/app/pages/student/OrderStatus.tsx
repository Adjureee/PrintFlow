import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router';
import { ArrowLeft, CheckCircle2, Clock, Printer, Package, Home, Sparkles, MapPin, Calendar, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { PageLoader } from '../../components/ui/page-loader';
import { QRCodeSVG } from 'qrcode.react';
import { fetchOrderById, type OrderFetchState } from '../../lib/orders-api';
import { useAuth } from '../../lib/auth-context';
import type { Order, OrderStatus } from '../../lib/store';

export default function OrderStatus() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [fetchState, setFetchState] = useState<OrderFetchState>('idle');

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
      console.error('Order fetch failed:', err);
      setOrder(null);
      setFetchState('error');
      toast.error('Failed to load order');
    }
  }, [orderId, accessToken]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (fetchState !== 'success' || !orderId) return;
    const interval = setInterval(() => {
      void fetchOrderById(orderId, accessToken).then((updated) => {
        if (updated) setOrder(updated);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchState, orderId, accessToken]);

  if (!orderId?.trim()) {
    return <Navigate to="/" replace />;
  }

  if (fetchState === 'loading' || fetchState === 'idle') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E6F1F0] via-white to-[#E6F1F0]">
        <PageLoader label="Loading order status…" />
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
      <div className="min-h-screen bg-gradient-to-br from-[#E6F1F0] via-white to-[#E6F1F0] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#E6F1F0] to-[#80B9B6]/20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Package className="w-10 h-10 sm:w-12 sm:h-12 text-[#00736D]" />
          </div>
          <p className="text-gray-600 mb-6 text-base sm:text-lg font-medium">Order not found</p>
          <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-[#00736D] to-[#002E2C] hover:opacity-90 h-11 sm:h-12 px-5 sm:px-6">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const statusSteps: { status: OrderStatus; label: string; icon: any; description: string }[] = [
    { status: 'awaiting-verification', label: 'Payment Verification', icon: Clock, description: 'Shop is verifying your payment' },
    { status: 'processing', label: 'Processing', icon: CheckCircle2, description: 'Payment verified! Preparing to print' },
    { status: 'printing', label: 'Printing', icon: Printer, description: 'Your document is being printed' },
    { status: 'ready', label: 'Ready for Pickup', icon: Package, description: 'Your order is ready!' },
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.status === order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F1F0] via-white to-[#E6F1F0]">
      {/* Modern Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-[#80B9B6]/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')} 
              className="rounded-xl hover:bg-[#E6F1F0] h-9 w-9 sm:h-10 sm:w-10"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-[#002E2C] truncate">Order Status</h1>
              <p className="text-xs sm:text-sm text-gray-600 font-mono truncate">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] sm:text-xs text-gray-600 font-semibold mb-0.5">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-[#00736D]">₱{order.totalAmount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
        {/* Order Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 sm:p-6 md:p-8 bg-white/80 backdrop-blur-sm border-[#80B9B6]/20 shadow-xl">
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-[#E6F1F0] to-[#80B9B6]/20 rounded-lg sm:rounded-xl flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#00736D]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1 sm:mb-2">Document Name</p>
                <p className="font-bold text-base sm:text-lg md:text-xl text-[#002E2C] break-words">{order.fileName}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-[#80B9B6]/20">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-[#E6F1F0] rounded-md sm:rounded-lg flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00736D]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-600 font-semibold mb-1">Location</p>
                  <p className="font-bold text-sm sm:text-base text-[#002E2C] break-words">{order.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-[#E6F1F0] rounded-md sm:rounded-lg flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00736D]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-600 font-semibold mb-1">Order Time</p>
                  <p className="font-bold text-sm sm:text-base text-[#002E2C]">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#80B9B6]/20">
              <div className="bg-gradient-to-br from-[#E6F1F0] to-[#80B9B6]/20 rounded-lg sm:rounded-xl p-2.5 sm:p-4 text-center border border-[#80B9B6]/20">
                <p className="text-[10px] sm:text-xs text-gray-600 font-semibold mb-1 sm:mb-2">Color</p>
                <p className="font-bold text-xs sm:text-sm md:text-base text-[#002E2C] uppercase">{order.settings.color}</p>
              </div>
              <div className="bg-gradient-to-br from-[#E6F1F0] to-[#80B9B6]/20 rounded-lg sm:rounded-xl p-2.5 sm:p-4 text-center border border-[#80B9B6]/20">
                <p className="text-[10px] sm:text-xs text-gray-600 font-semibold mb-1 sm:mb-2">Size</p>
                <p className="font-bold text-xs sm:text-sm md:text-base text-[#002E2C] uppercase">{order.settings.size}</p>
              </div>
              <div className="bg-gradient-to-br from-[#E6F1F0] to-[#80B9B6]/20 rounded-lg sm:rounded-xl p-2.5 sm:p-4 text-center border border-[#80B9B6]/20">
                <p className="text-[10px] sm:text-xs text-gray-600 font-semibold mb-1 sm:mb-2">Copies</p>
                <p className="font-bold text-xs sm:text-sm md:text-base text-[#002E2C]">{order.settings.copies}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 sm:p-6 md:p-8 bg-white/80 backdrop-blur-sm border-[#80B9B6]/20 shadow-xl">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-[#E6F1F0] to-[#80B9B6]/20 rounded-lg sm:rounded-xl flex-shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#00736D]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#002E2C]">Order Progress</h3>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Track your order in real-time</p>
              </div>
            </div>
            
            <div className="space-y-1">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isPending = index > currentStepIndex;

                return (
                  <motion.div
                    key={step.status}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex gap-3 sm:gap-4">
                      {/* Timeline Icon */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <motion.div
                          className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center relative shadow-lg ${
                            isCompleted
                              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30'
                              : isCurrent
                              ? 'bg-gradient-to-br from-[#00736D] to-[#002E2C] text-white shadow-[#00736D]/30'
                              : 'bg-gray-100 text-gray-400 shadow-none'
                          }`}
                          animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                          {isCurrent && (
                            <motion.div
                              className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-[#00736D]"
                              animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </motion.div>
                        {index < statusSteps.length - 1 && (
                          <div className={`w-0.5 sm:w-1 h-16 sm:h-20 transition-all duration-500 rounded-full ${
                            isCompleted ? 'bg-gradient-to-b from-emerald-500 to-emerald-600' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>

                      {/* Timeline Content */}
                      <div className="flex-1 pb-6 sm:pb-8 min-w-0">
                        <p className={`font-bold text-sm sm:text-base md:text-lg mb-1 ${
                          isCurrent ? 'text-[#00736D]' : 
                          isCompleted ? 'text-[#002E2C]' : 
                          'text-gray-400'
                        }`}>
                          {step.label}
                        </p>
                        <AnimatePresence mode="wait">
                          {isCurrent && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 sm:mt-3"
                            >
                              <div className="bg-gradient-to-r from-[#E6F1F0] to-[#80B9B6]/20 border-l-4 border-[#00736D] rounded-r-lg sm:rounded-r-xl p-3 sm:p-4">
                                <p className="text-xs sm:text-sm text-[#002E2C] font-medium">
                                  {step.description}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {isCompleted && (
                          <p className="text-xs sm:text-sm text-emerald-600 mt-1 sm:mt-2 flex items-center gap-1.5 sm:gap-2 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Completed
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Claim Code (Only shown when ready) */}
        <AnimatePresence>
          {order.status === 'ready' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <Card className="p-6 sm:p-8 md:p-10 shadow-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50 border-2 border-emerald-300/50">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="inline-flex items-center gap-2 mb-4 sm:mb-6"
                  >
                    <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
                      <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
                    </div>
                  </motion.div>
                  
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-700 mb-2 sm:mb-3">Ready for Pickup! 🎉</h3>
                  <p className="text-sm sm:text-base text-emerald-600 mb-6 sm:mb-8 font-medium px-2">
                    Show this QR code at the partner shop to claim your order
                  </p>
                  
                  {/* Claim QR Code */}
                  <motion.div
                    className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 inline-block shadow-2xl border-2 border-emerald-200 max-w-full"
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <QRCodeSVG
                      value={`CLAIM:${order.claimCode}`}
                      size={Math.min(240, window.innerWidth - 120)}
                      level="H"
                      includeMargin
                      className="max-w-full h-auto"
                    />
                  </motion.div>
                  
                  <div className="mt-6 sm:mt-8 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-200">
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1 sm:mb-2">Claim Code</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-emerald-700 break-all">{order.claimCode}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 sm:p-6 bg-gradient-to-r from-[#E6F1F0]/50 to-transparent border-[#80B9B6]/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <span className="text-xs sm:text-sm text-gray-600 font-semibold">GCash Reference</span>
                <p className="font-mono font-bold mt-1 sm:mt-2 text-[#002E2C] text-sm sm:text-base md:text-lg break-all">{order.gcashRefNumber}</p>
              </div>
              <div className="sm:text-right">
                <span className="text-xs sm:text-sm text-gray-600 font-semibold">Order Date</span>
                <p className="font-bold mt-1 sm:mt-2 text-[#002E2C] text-sm sm:text-base md:text-lg">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pb-4 sm:pb-6"
        >
          <Button
            variant="outline"
            className="w-full h-12 sm:h-14 border-2 border-[#80B9B6]/50 hover:bg-[#E6F1F0] hover:border-[#00736D] font-bold text-sm sm:text-base rounded-xl transition-all"
            onClick={() => navigate('/')}
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Back to Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
}