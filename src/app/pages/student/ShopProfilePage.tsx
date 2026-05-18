import { useNavigate, useParams, Navigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { getShopBySlug } from '../../lib/print-shops';
import { ShopProfileContent } from '../../components/ShopProfileContent';

export default function ShopProfilePage() {
  const navigate = useNavigate();
  const { shopSlug } = useParams<{ shopSlug: string }>();
  const shop = shopSlug ? getShopBySlug(shopSlug) : undefined;

  if (!shopSlug || !shop) {
    return <Navigate to="/" replace />;
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-white via-[#F8FAFA] to-[#E6F1F0]/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="sticky top-0 z-40 border-b border-[#80B9B6]/20 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3.5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F1F0]"
          >
            <ArrowLeft className="h-4.5 w-4.5 text-[#00736D]" />
          </motion.button>
          <p className="text-xs font-bold uppercase tracking-widest text-[#80B9B6]">
            Partner Shop
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 py-6">
        <ShopProfileContent shop={shop} variant="page" />
      </div>
    </motion.div>
  );
}
