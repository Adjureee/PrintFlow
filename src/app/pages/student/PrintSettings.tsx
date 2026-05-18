import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Printer, CreditCard, Check, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { QRCodeSVG } from 'qrcode.react';
import { calculatePrintCost, type PrintSettings as PrintSettingsType } from '../../lib/store';
import { createOrder } from '../../lib/orders-api';
import { uploadDocumentToCloudinary, CloudinaryUploadError } from '../../lib/cloudinary-api';
import { getPendingPrintFile, clearPendingPrintFile } from '../../lib/print-session';
import { useAuth } from '../../lib/auth-context';

export default function PrintSettings() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const [settings, setSettings] = useState<PrintSettingsType>({
    color: 'bw',
    size: 'letter',
    copies: 1,
  });
  const [gcashRefNumber, setGcashRefNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fileName = sessionStorage.getItem('printFile') || 'document.pdf';
  const locationData = sessionStorage.getItem('printLocation');
  const location = locationData ? JSON.parse(locationData) : { name: 'Unknown' };

  const totalAmount = calculatePrintCost(settings);

  const handleSubmitOrder = async () => {
    if (!gcashRefNumber.trim()) {
      toast.error('Please enter your GCash reference number');
      return;
    }

    setSubmitting(true);
    let fileUrl = 'mock://uploaded-file.pdf';
    let cloudinaryPublicId: string | undefined;
    const pendingFile = getPendingPrintFile();

    try {
      if (pendingFile && accessToken) {
        try {
          const uploaded = await uploadDocumentToCloudinary(pendingFile, accessToken);
          fileUrl = uploaded.secureUrl;
          cloudinaryPublicId = uploaded.publicId;
        } catch (err) {
          if (err instanceof CloudinaryUploadError) {
            toast.error(err.message);
          } else {
            toast.error('Document upload failed');
          }
          console.error('Cloudinary upload failed:', err);
          return;
        }
      }

      const newOrder = await createOrder(
        {
          studentName: user?.name ?? 'Student',
          studentId: user?.studentId ?? 'STU-UNKNOWN',
          fileName,
          fileUrl,
          cloudinaryPublicId,
          location: location.name,
          settings,
          gcashRefNumber: gcashRefNumber.trim(),
          totalAmount,
          userId: user?.id,
        },
        accessToken,
      );

      clearPendingPrintFile();
      sessionStorage.removeItem('printFile');
      navigate(`/status/${encodeURIComponent(newOrder.id)}`);
    } catch (err) {
      console.error('Order creation failed:', err);
      toast.error('Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F1F0] via-white to-[#E6F1F0]">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-[#80B9B6]/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-base sm:text-lg text-[#002E2C]">Print Settings</h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{fileName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-6">
        {/* Location Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-3 sm:p-4 bg-gradient-to-r from-[#E6F1F0] to-[#80B9B6]/30 border-2 border-[#80B9B6]/50 shadow-md">
            <div className="flex items-center gap-2 sm:gap-3 text-[#00736D]">
              <div className="bg-white/70 rounded-lg p-1.5 sm:p-2 flex-shrink-0">
                <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-[#00736D] font-semibold">Printing at</p>
                <p className="font-bold text-sm sm:text-base text-[#002E2C] truncate">{location.name}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Print Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 sm:p-6 space-y-5 sm:space-y-6 shadow-lg border-2 border-[#80B9B6]/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#00736D]" />
              <h3 className="font-bold text-base sm:text-lg text-[#002E2C]">Print Options</h3>
            </div>

            {/* Color Selection */}
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-bold text-[#002E2C]">Color Mode</Label>
              <RadioGroup
                value={settings.color}
                onValueChange={(value) => setSettings({ ...settings, color: value as 'bw' | 'color' })}
                className="space-y-2"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <div className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${
                    settings.color === 'bw' 
                      ? 'bg-gradient-to-r from-[#E6F1F0] to-[#80B9B6]/30 border-[#00736D] shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}>
                    <RadioGroupItem value="bw" id="bw" className="mt-0 flex-shrink-0" />
                    <Label htmlFor="bw" className="flex-1 cursor-pointer flex justify-between items-center gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-sm sm:text-base text-[#002E2C] block">Black & White</span>
                        <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5">Standard printing</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-base sm:text-lg font-bold text-[#00736D] block">Γé▒5</span>
                        <span className="text-[10px] sm:text-xs text-gray-600">/page</span>
                      </div>
                    </Label>
                    {settings.color === 'bw' && (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#00736D] flex-shrink-0" />
                    )}
                  </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <div className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${
                    settings.color === 'color' 
                      ? 'bg-gradient-to-r from-[#E6F1F0] to-[#80B9B6]/30 border-[#00736D] shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}>
                    <RadioGroupItem value="color" id="color" className="mt-0 flex-shrink-0" />
                    <Label htmlFor="color" className="flex-1 cursor-pointer flex justify-between items-center gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-sm sm:text-base text-[#002E2C] block">Full Color</span>
                        <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5">Vibrant printing</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-base sm:text-lg font-bold text-[#00736D] block">Γé▒15</span>
                        <span className="text-[10px] sm:text-xs text-gray-600">/page</span>
                      </div>
                    </Label>
                    {settings.color === 'color' && (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#00736D] flex-shrink-0" />
                    )}
                  </div>
                </motion.div>
              </RadioGroup>
            </div>

            {/* Size Selection */}
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-sm sm:text-base font-bold text-[#002E2C]">Paper Size</Label>
              <RadioGroup
                value={settings.size}
                onValueChange={(value) => setSettings({ ...settings, size: value as 'letter' | 'legal' | 'a4' })}
                className="grid grid-cols-3 gap-2 sm:gap-3"
              >
                {[
                  { value: 'letter', label: 'Letter', size: '8.5" ├ù 11"' },
                  { value: 'legal', label: 'Legal', size: '8.5" ├ù 14"' },
                  { value: 'a4', label: 'A4', size: '210 ├ù 297mm' },
                ].map((option) => (
                  <motion.div key={option.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <div className={`relative p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all ${
                      settings.size === option.value
                        ? 'bg-gradient-to-br from-[#E6F1F0] to-[#80B9B6]/30 border-[#00736D] shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}>
                      <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                      <Label htmlFor={option.value} className="cursor-pointer text-center block">
                        <p className="font-semibold text-xs sm:text-sm text-[#002E2C]">{option.label}</p>
                        <p className="text-[10px] sm:text-xs text-gray-600 mt-1 break-words">{option.size}</p>
                      </Label>
                      {settings.size === option.value && (
                        <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-[#00736D] rounded-full p-1">
                          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </RadioGroup>
            </div>

            {/* Number of Copies */}
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="copies" className="text-sm sm:text-base font-bold text-[#002E2C]">Number of Copies</Label>
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl border-2 border-[#80B9B6]/30 hover:bg-[#E6F1F0] flex-shrink-0"
                  onClick={() => setSettings({ ...settings, copies: Math.max(1, settings.copies - 1) })}
                >
                  <span className="text-lg sm:text-xl font-bold">ΓêÆ</span>
                </Button>
                <Input
                  id="copies"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.copies}
                  onChange={(e) => setSettings({ ...settings, copies: parseInt(e.target.value) || 1 })}
                  className="text-center text-xl sm:text-2xl font-bold h-10 sm:h-12 border-2 border-[#80B9B6]/30 focus:border-[#00736D]"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl border-2 border-[#80B9B6]/30 hover:bg-[#E6F1F0] flex-shrink-0"
                  onClick={() => setSettings({ ...settings, copies: Math.min(100, settings.copies + 1) })}
                >
                  <span className="text-lg sm:text-xl font-bold">+</span>
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Payment Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-lg border-2 border-[#80B9B6]/20">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-[#00736D]" />
              <h3 className="font-bold text-base sm:text-lg text-[#002E2C]">Payment</h3>
            </div>

            {/* Total Amount */}
            <div className="bg-gradient-to-r from-[#00736D] to-[#002E2C] rounded-xl sm:rounded-2xl p-5 sm:p-6 text-white text-center shadow-xl">
              <p className="text-xs sm:text-sm opacity-90 mb-1">Total Amount</p>
              <motion.p 
                className="text-4xl sm:text-5xl font-bold"
                key={totalAmount}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                Γé▒{totalAmount}
              </motion.p>
              <p className="text-[10px] sm:text-xs opacity-75 mt-2 break-words px-2">
                {settings.copies} {settings.copies === 1 ? 'copy' : 'copies'} ΓÇó {settings.color.toUpperCase()} ΓÇó {settings.size.toUpperCase()}
              </p>
            </div>

            {/* QR Code */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <p className="text-center font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-[#002E2C]">Scan with GCash App</p>
              <div className="flex justify-center bg-white p-3 sm:p-4 rounded-xl max-w-full">
                <QRCodeSVG
                  value={`gcash://pay?amount=${totalAmount}&merchant=PrintFlow&reference=ORDER`}
                  size={Math.min(200, window.innerWidth - 150)}
                  level="H"
                  includeMargin
                  className="max-w-full h-auto"
                />
              </div>
              <div className="mt-3 sm:mt-4 p-3 bg-[#E6F1F0] rounded-lg border border-[#80B9B6]/30">
                <p className="text-xs sm:text-sm text-center text-[#00736D] font-semibold">
                  Open GCash ΓåÆ Scan QR ΓåÆ Pay Γé▒{totalAmount}
                </p>
              </div>
            </div>

            {/* Reference Number Input */}
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="refNumber" className="text-sm sm:text-base font-bold text-[#002E2C]">Enter GCash Reference Number</Label>
              <Input
                id="refNumber"
                placeholder="e.g., GC-1234567890"
                value={gcashRefNumber}
                onChange={(e) => setGcashRefNumber(e.target.value)}
                className="text-base sm:text-lg h-12 sm:h-14 border-2 border-[#80B9B6]/30 focus:border-[#00736D] font-mono"
              />
              <p className="text-[10px] sm:text-xs text-gray-600 flex items-start gap-1.5 sm:gap-2">
                <span className="text-[#00736D] flex-shrink-0">≡ƒÆí</span>
                <span>You can find this 13-digit reference number on your GCash receipt after payment</span>
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pb-6"
        >
          <Button
            className="w-full h-12 sm:h-14 text-sm sm:text-base font-bold bg-gradient-to-r from-[#00736D] to-[#002E2C] hover:opacity-90 shadow-lg shadow-[#00736D]/30 hover:shadow-xl hover:shadow-[#00736D]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => void handleSubmitOrder()}
            disabled={!gcashRefNumber.trim() || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <span>Submit Order & Track Status</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
