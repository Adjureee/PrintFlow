import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  MapPin,
  Clock,
  Sparkles,
  MessageCircle,
  Star,
  Printer,
  ChevronRight,
} from "lucide-react";
import type { PrintShop } from "../lib/print-shops";

interface ShopProfileContentProps {
  shop: PrintShop;
  variant?: "sheet" | "page";
  onContact?: () => void;
}

export function ShopProfileContent({
  shop,
  variant = "page",
  onContact,
}: ShopProfileContentProps) {
  const navigate = useNavigate();

  const handleContact = () => {
    if (onContact) {
      onContact();
      return;
    }
    navigate(`/shops/${shop.slug}/contact`);
  };

  const isPage = variant === "page";

  return (
    <motion.div
      className={isPage ? "space-y-5" : "space-y-4"}
      initial={isPage ? { opacity: 0, y: 12 } : false}
      animate={isPage ? { opacity: 1, y: 0 } : false}
    >
      <div className="flex items-start gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`flex shrink-0 items-center justify-center rounded-2xl shadow-lg ${
            isPage ? "h-16 w-16" : "h-14 w-14"
          } ${
            shop.isFlagship
              ? "bg-gradient-to-br from-[#00736D] via-[#008A83] to-[#002E2C] shadow-[#00736D]/35"
              : "bg-gradient-to-br from-[#00736D] to-[#002E2C] shadow-[#00736D]/25"
          }`}
        >
          <span
            className={`font-black text-white ${isPage ? "text-xl" : "text-lg"}`}
          >
            {shop.initials}
          </span>
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1
              className={`font-black leading-tight text-[#002E2C] ${
                isPage ? "text-2xl" : "text-[17px]"
              }`}
            >
              {shop.name}
            </h1>
            {shop.isFlagship && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F1F0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#00736D]">
                <Star className="h-3 w-3 fill-[#00736D]" />
                Flagship
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-[#80B9B6]">
            {shop.hours}
          </p>
          <p
            className={`mt-2 font-bold ${
              shop.status === "online" ? "text-green-600" : "text-rose-500"
            }`}
          >
            {shop.status === "online" ? "● Online now" : "● Currently offline"}
          </p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-[#002E2C]/80">
        {shop.description}
      </p>

      <div className="space-y-2.5 rounded-2xl border border-[#80B9B6]/25 bg-[#E6F1F0]/40 p-4 backdrop-blur-sm">
        <div className="flex items-start gap-2.5 text-sm text-[#002E2C]">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00736D]" />
          <span className="font-medium">{shop.address}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          <Clock className="h-4 w-4 text-[#00736D]" />
          <span
            className={`font-bold ${
              shop.waitTime <= 5
                ? "text-green-700"
                : shop.waitTime <= 10
                  ? "text-amber-700"
                  : "text-orange-700"
            }`}
          >
            ~{shop.waitTime} min typical wait
          </span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-[#80B9B6]">
          Services
        </p>
        <div className="flex flex-wrap gap-2">
          {shop.services.map((service) => (
            <span
              key={service}
              className="inline-flex items-center gap-1 rounded-full border border-[#80B9B6]/30 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#002E2C]"
            >
              <Printer className="h-3 w-3 text-[#00736D]" />
              {service}
            </span>
          ))}
        </div>
      </div>

      {shop.status === "offline" && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50/90 px-3.5 py-3 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 shrink-0 text-[#00736D]" />
          <p className="text-xs font-semibold text-rose-700">
            Shop is offline — AI auto-reply can reserve your slot until the
            owner returns.
          </p>
        </div>
      )}

      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleContact}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#00736D] via-[#008A83] to-[#002E2C] py-4 text-sm font-black text-white shadow-lg shadow-[#00736D]/30 transition-shadow hover:shadow-xl hover:shadow-[#00736D]/40"
      >
        <MessageCircle className="h-4 w-4" />
        Contact Shop
        <ChevronRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}
