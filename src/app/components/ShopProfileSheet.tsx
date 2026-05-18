import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import type { PrintShop } from '../lib/print-shops';
import { ShopProfileContent } from './ShopProfileContent';

interface ShopProfileSheetProps {
  shop: PrintShop | null;
  onClose: () => void;
}

export function ShopProfileSheet({ shop, onClose }: ShopProfileSheetProps) {
  const navigate = useNavigate();
  return (
    <AnimatePresence>
      {shop && (
        <>
          <motion.button
            type="button"
            aria-label="Close shop profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-[#002E2C]/40 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto max-w-lg"
          >
            <div className="rounded-t-[28px] border border-[#80B9B6]/30 bg-white/90 shadow-2xl backdrop-blur-xl">
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-[#80B9B6]/50" />
              </div>

              <div className="px-5 pb-6 pt-2">
                <div className="mb-3 flex justify-end">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F1F0]/80"
                  >
                    <X className="h-4 w-4 text-[#00736D]" />
                  </motion.button>
                </div>

                <ShopProfileContent
                  shop={shop}
                  variant="sheet"
                  onContact={() => {
                    onClose();
                    navigate(`/shops/${shop.slug}/contact`);
                  }}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
