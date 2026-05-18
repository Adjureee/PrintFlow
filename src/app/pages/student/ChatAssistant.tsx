import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, Navigate } from "react-router";
import {
  ArrowLeft,
  Sparkles,
  Upload,
  CheckCheck,
  MoreVertical,
  Calendar,
  MapPin,
  Clock,
  WifiOff,
  FileText,
  Check,
  ShieldCheck,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { getShopBySlug } from "../../lib/print-shops";
import { useAuth } from "../../lib/auth-context";
import {
  sendShopChatMessage,
  ShopChatError,
  type ShopChatMessage,
} from "../../lib/shop-chat-api";

type Role = "bot" | "user";
interface Message {
  id: string;
  role: Role;
  text: string;
  time: string;
  showCard?: boolean;
  pickupTime?: string | null;
  pickupDate?: string | null;
}

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function newId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildGreeting(shopName: string, isOffline: boolean): Message {
  return {
    id: newId(),
    role: "bot",
    text: isOffline
      ? `Hi! ${shopName} is currently offline. I'm the AI-powered Offline Auto-Reply Bot — I can secure your print reservation for when they return. What time would you like to pick up?`
      : `Hi! Welcome to ${shopName}. I can help you reserve a print pickup slot. What would you like to print, and when would you like to pick it up?`,
    time: formatTime(),
  };
}

function TypingIndicator() {
  return (
    <motion.div
      key="typing"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="mb-4 flex items-end gap-2.5"
    >
      <BotAvatar />
      <div className="flex items-center gap-1.5 rounded-3xl rounded-tl-sm border border-[#80B9B6]/25 bg-white/90 px-4 py-3.5 shadow-sm backdrop-blur-md">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-2 w-2 rounded-full bg-[#80B9B6]"
            animate={{ y: [0, -7, 0], opacity: [0.45, 1, 0.45] }}
            transition={{
              repeat: Infinity,
              duration: 1,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function BotAvatar() {
  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00736D] to-[#002E2C] shadow-md shadow-[#00736D]/30"
    >
      <Sparkles className="h-3.5 w-3.5 text-white" />
    </motion.div>
  );
}

function ReservationCard({
  shopName,
  pickupTime,
  pickupDate,
}: {
  shopName: string;
  pickupTime?: string | null;
  pickupDate?: string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.2, type: "spring", damping: 22, stiffness: 280 }}
      className="mt-3 overflow-hidden rounded-2xl border border-[#80B9B6]/40 bg-gradient-to-br from-[#E6F1F0]/90 to-[#C5E0DE]/50 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2.5 border-b border-[#80B9B6]/25 bg-[#00736D]/10 px-4 py-3">
        <ShieldCheck className="h-4 w-4 text-[#00736D]" />
        <span className="text-[11px] font-black uppercase tracking-widest text-[#002E2C]">
          Reservation Confirmed
        </span>
        <div className="ml-auto h-2 w-2 animate-pulse rounded-full bg-green-500" />
      </div>
      <div className="space-y-2 px-4 py-3">
        {[
          {
            icon: <Calendar className="h-3.5 w-3.5" />,
            label: "Date",
            value: pickupDate || "Today",
          },
          {
            icon: <Clock className="h-3.5 w-3.5" />,
            label: "Time",
            value: pickupTime || "TBD",
          },
          {
            icon: <MapPin className="h-3.5 w-3.5" />,
            label: "Shop",
            value: shopName,
          },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-center gap-2.5">
            <span className="text-[#80B9B6]">{icon}</span>
            <span className="w-10 text-[11px] font-semibold text-[#80B9B6]">
              {label}
            </span>
            <span className="text-[12px] font-black text-[#002E2C]">
              {value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MessageBubble({ msg, shopName }: { msg: Message; shopName: string }) {
  const isBot = msg.role === "bot";
  return (
    <motion.div
      initial={{ opacity: 0, x: isBot ? -18 : 18, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", damping: 22, stiffness: 280 }}
      className={`mb-5 flex items-end gap-2.5 ${isBot ? "" : "flex-row-reverse"}`}
    >
      {isBot ? (
        <BotAvatar />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#80B9B6] to-[#00736D] shadow-md">
          <span className="text-[11px] font-black text-white">ME</span>
        </div>
      )}

      <div
        className={`flex min-w-0 flex-col gap-1.5 ${isBot ? "max-w-[80%]" : "max-w-[72%] items-end"}`}
      >
        {isBot && (
          <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-[#80B9B6]">
            Offline Auto-Reply
          </span>
        )}
        <div
          className={`px-4 py-3 shadow-sm ${
            isBot
              ? "rounded-3xl rounded-tl-sm border border-[#80B9B6]/20 bg-white/90 backdrop-blur-md"
              : "rounded-3xl rounded-tr-sm bg-gradient-to-br from-[#00736D] to-[#004845] shadow-lg shadow-[#00736D]/25"
          }`}
        >
          <p
            className={`text-sm leading-relaxed ${isBot ? "text-[#002E2C]" : "text-white"}`}
          >
            {msg.text}
          </p>
        </div>
        {msg.showCard && (
          <ReservationCard
            shopName={shopName}
            pickupTime={msg.pickupTime}
            pickupDate={msg.pickupDate}
          />
        )}
        <div
          className={`flex items-center gap-1.5 px-1 ${isBot ? "" : "flex-row-reverse"}`}
        >
          <span className="text-[10px] font-medium text-[#80B9B6]">
            {msg.time}
          </span>
          {!isBot && <CheckCheck className="h-3.5 w-3.5 text-[#80B9B6]" />}
        </div>
      </div>
    </motion.div>
  );
}

function DatePill({ label }: { label: string }) {
  return (
    <div className="my-4 flex items-center justify-center">
      <div className="rounded-full border border-[#80B9B6]/25 bg-[#E6F1F0]/80 px-4 py-1 backdrop-blur-sm">
        <span className="text-[11px] font-semibold text-[#80B9B6]">
          {label}
        </span>
      </div>
    </div>
  );
}

export default function ChatAssistant() {
  const navigate = useNavigate();
  const { shopSlug } = useParams<{ shopSlug: string }>();
  const shop = shopSlug ? getShopBySlug(shopSlug) : undefined;
  const { accessToken } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [reservationConfirmed, setReservationConfirmed] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const isOffline = shop?.status === "offline";

  useEffect(() => {
    if (!shop || initialized.current) return;
    initialized.current = true;
    setMessages([buildGreeting(shop.name, shop.status === "offline")]);
  }, [shop]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const toApiHistory = useCallback(
    (msgs: Message[]): ShopChatMessage[] =>
      msgs.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        text: m.text,
      })),
    [],
  );

  const runFallbackReply = useCallback((userText: string) => {
    const lower = userText.toLowerCase();
    const hasTime =
      /\d{1,2}(:\d{2})?\s*(am|pm)?/i.test(userText) ||
      lower.includes("1:00") ||
      lower.includes("pickup") ||
      lower.includes("today") ||
      lower.includes("tomorrow");

    if (hasTime) {
      return {
        message:
          "Done! I have reserved your slot and notified the shop owner. Please upload your document below to complete the reservation.",
        reservationConfirmed: true,
        pickupTime: "1:00 PM",
        pickupDate: "Today",
      };
    }

    return {
      message:
        'Got it! What time would you like to pick up your document? For example: "1:00 PM today".',
      reservationConfirmed: false,
      pickupTime: null,
      pickupDate: null,
    };
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !shop || typing) return;

    const userMsg: Message = {
      id: newId(),
      role: "user",
      text,
      time: formatTime(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setTyping(true);

    try {
      if (!accessToken) {
        throw new ShopChatError("Please sign in to chat", 401, true);
      }

      const reply = await sendShopChatMessage(
        accessToken,
        {
          slug: shop.slug,
          name: shop.name,
          status: shop.status,
          address: shop.address,
          hours: shop.hours,
          services: shop.services,
          waitTime: shop.waitTime,
        },
        toApiHistory(nextMessages),
      );

      setUsingFallback(false);

      const botMsg: Message = {
        id: newId(),
        role: "bot",
        text: reply.message,
        time: formatTime(),
        showCard: reply.reservationConfirmed,
        pickupTime: reply.pickupTime,
        pickupDate: reply.pickupDate,
      };

      setMessages((prev) => [...prev, botMsg]);
      if (reply.reservationConfirmed) {
        setReservationConfirmed(true);
      }
    } catch (err) {
      const fallback =
        err instanceof ShopChatError && err.fallback
          ? runFallbackReply(text)
          : runFallbackReply(text);

      if (err instanceof ShopChatError && err.fallback) {
        setUsingFallback(true);
        toast.message("Using offline demo replies", {
          description:
            "Add GROQ_API_KEY to Supabase Edge Functions to enable live AI.",
        });
      } else {
        toast.error(
          err instanceof Error ? err.message : "Could not reach assistant",
        );
        setUsingFallback(true);
      }

      const botMsg: Message = {
        id: newId(),
        role: "bot",
        text: fallback.message,
        time: formatTime(),
        showCard: fallback.reservationConfirmed,
        pickupTime: fallback.pickupTime,
        pickupDate: fallback.pickupDate,
      };
      setMessages((prev) => [...prev, botMsg]);
      if (fallback.reservationConfirmed) {
        setReservationConfirmed(true);
      }
    } finally {
      setTyping(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadedFile(f);
    setUploadSuccess(true);
  };

  if (!shopSlug || !shop) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <div className="z-30 shrink-0 border-b border-[#80B9B6]/20 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E6F1F0]"
          >
            <ArrowLeft className="h-4.5 w-4.5 text-[#00736D]" />
          </motion.button>

          <div className="relative shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00736D] to-[#002E2C] shadow-lg shadow-[#00736D]/25"
            >
              <span className="text-sm font-black text-white">
                {shop.initials}
              </span>
            </motion.div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ${
                isOffline ? "bg-rose-500" : "bg-green-500"
              }`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[15px] font-black leading-tight text-[#002E2C]">
              {shop.name}
            </h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              {isOffline ? (
                <div className="flex items-center gap-1">
                  <WifiOff className="h-2.5 w-2.5 text-rose-500" />
                  <span className="text-[10px] font-bold text-rose-500">
                    Offline
                  </span>
                </div>
              ) : (
                <span className="text-[10px] font-bold text-green-600">
                  Online
                </span>
              )}
              <span className="text-[10px] text-[#80B9B6]">·</span>
              <div className="flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-[#00736D]" />
                <span className="text-[10px] font-bold text-[#00736D]">
                  {usingFallback ? "Demo mode" : "AI Live"}
                </span>
              </div>
            </div>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(`/shops/${shop.slug}`)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E6F1F0]"
          >
            <MoreVertical className="h-4 w-4 text-[#80B9B6]" />
          </motion.button>
        </div>

        {isOffline && (
          <div className="mx-auto max-w-lg px-4 pb-2.5">
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-100 bg-rose-50/90 px-3.5 py-2 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-rose-400" />
              <p className="text-[11px] font-semibold text-rose-600">
                Shop is offline. AI is handling reservations until the owner
                returns.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-lg flex-1 overflow-y-auto px-4 pb-4 pt-2">
        <DatePill label="Today" />
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} shopName={shop.name} />
          ))}
        </AnimatePresence>
        <AnimatePresence>{typing && <TypingIndicator />}</AnimatePresence>
        <div ref={bottomRef} />
      </div>

      <div className="z-20 shrink-0 border-t border-[#80B9B6]/20 bg-white/90 backdrop-blur-xl">
        {reservationConfirmed && (
          <div className="mx-auto max-w-lg space-y-3 border-b border-[#80B9B6]/15 px-4 py-3">
            <label htmlFor="chat-file-upload">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className={`flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl py-3 text-sm font-bold transition-all ${
                  uploadSuccess
                    ? "border-2 border-green-500/50 bg-green-50 text-green-700"
                    : "bg-gradient-to-r from-[#00736D] to-[#002E2C] text-white shadow-lg shadow-[#00736D]/30"
                }`}
              >
                {uploadSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span className="max-w-[200px] truncate">
                      {uploadedFile?.name}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload File to Complete
                  </>
                )}
              </motion.div>
              <input
                id="chat-file-upload"
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {uploadSuccess && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/settings")}
                className="w-full rounded-2xl bg-[#E6F1F0] py-2.5 text-sm font-bold text-[#00736D]"
              >
                Continue to Print Settings →
              </motion.button>
            )}
          </div>
        )}

        <div className="mx-auto flex max-w-lg items-end gap-2 px-4 py-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder={
              reservationConfirmed
                ? "Reservation set — upload your file above"
                : "Type your message…"
            }
            disabled={typing || reservationConfirmed}
            rows={1}
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border border-[#80B9B6]/30 bg-[#E6F1F0]/50 px-4 py-3 text-sm text-[#002E2C] placeholder:text-[#80B9B6] focus:border-[#00736D]/50 focus:outline-none focus:ring-2 focus:ring-[#00736D]/20 disabled:opacity-60"
          />
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            disabled={!input.trim() || typing || reservationConfirmed}
            onClick={() => void handleSend()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00736D] to-[#002E2C] text-white shadow-lg shadow-[#00736D]/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
