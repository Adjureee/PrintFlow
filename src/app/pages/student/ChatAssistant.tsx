import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Sparkles, Upload, CheckCheck, MoreVertical,
  Calendar, MapPin, Clock, WifiOff, FileText, Check,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/* ─── Types ────────────────────────────────────────────────────────── */
type Role = 'bot' | 'user';
interface Message {
  id: string;
  role: Role;
  text: string;
  time: string;
  showCard?: boolean;
}

/* ─── Static message data ──────────────────────────────────────────── */
const MSG_BOT_1: Message = {
  id: 'b1',
  role: 'bot',
  text: "Hi! Ink Masters is currently offline, but I am their AI Assistant. I can secure your print reservation for when they return. What time would you like to pick up your document?",
  time: '2:34 PM',
};
const MSG_USER: Message = {
  id: 'u1',
  role: 'user',
  text: "Can I reserve a slot for 1:00 PM today?",
  time: '2:35 PM',
};
const MSG_BOT_2: Message = {
  id: 'b2',
  role: 'bot',
  text: "Done! I have reserved your 1:00 PM slot and notified the shop owner. Please upload your document below to complete the reservation.",
  time: '2:35 PM',
  showCard: true,
};

/* ─── Typing dots ──────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <motion.div
      key="typing"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="flex items-end gap-2.5 mb-4"
    >
      <BotAvatar />
      <div className="bg-white border border-slate-100 shadow-sm rounded-3xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block w-2 h-2 rounded-full bg-[#80B9B6]"
            animate={{ y: [0, -7, 0], opacity: [0.45, 1, 0.45] }}
            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Bot avatar ───────────────────────────────────────────────────── */
function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00736D] to-[#002E2C] flex items-center justify-center shadow-md shadow-[#00736D]/30 flex-shrink-0">
      <Sparkles className="w-3.5 h-3.5 text-white" />
    </div>
  );
}

/* ─── Reservation confirmation card ───────────────────────────────── */
function ReservationCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.35, type: 'spring', damping: 22, stiffness: 280 }}
      className="mt-3 bg-gradient-to-br from-[#E6F1F0] to-[#C5E0DE]/60 border border-[#80B9B6]/40 rounded-2xl overflow-hidden"
    >
      {/* card header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-[#00736D]/10 border-b border-[#80B9B6]/25">
        <ShieldCheck className="w-4 h-4 text-[#00736D]" />
        <span className="text-[11px] font-black text-[#002E2C] uppercase tracking-widest">
          Reservation Confirmed
        </span>
        <div className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      </div>
      {/* card body */}
      <div className="px-4 py-3 space-y-2">
        {[
          { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Date', value: 'Today' },
          { icon: <Clock className="w-3.5 h-3.5" />, label: 'Time', value: '1:00 PM' },
          { icon: <MapPin className="w-3.5 h-3.5" />, label: 'Shop', value: 'Ink Masters Print Shop' },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-center gap-2.5">
            <span className="text-[#80B9B6]">{icon}</span>
            <span className="text-[11px] text-[#80B9B6] font-semibold w-10">{label}</span>
            <span className="text-[12px] text-[#002E2C] font-black">{value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Single message bubble ────────────────────────────────────────── */
function MessageBubble({ msg }: { msg: Message }) {
  const isBot = msg.role === 'bot';
  return (
    <motion.div
      initial={{ opacity: 0, x: isBot ? -18 : 18, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      className={`flex items-end gap-2.5 mb-5 ${isBot ? '' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      {isBot ? (
        <BotAvatar />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#80B9B6] to-[#00736D] flex items-center justify-center shadow-md flex-shrink-0">
          <span className="text-white font-black text-[11px]">ME</span>
        </div>
      )}

      <div className={`flex flex-col gap-1.5 min-w-0 ${isBot ? 'max-w-[80%]' : 'max-w-[72%] items-end'}`}>
        {/* Label */}
        {isBot && (
          <span className="text-[10px] font-bold text-[#80B9B6] ml-1 uppercase tracking-widest">
            AI Assistant
          </span>
        )}

        {/* Bubble */}
        <div
          className={`px-4 py-3 shadow-sm ${
            isBot
              ? 'bg-white border border-slate-100/80 rounded-3xl rounded-tl-sm shadow-sm'
              : 'bg-gradient-to-br from-[#00736D] to-[#004845] rounded-3xl rounded-tr-sm shadow-lg shadow-[#00736D]/25'
          }`}
        >
          <p className={`text-sm leading-relaxed ${isBot ? 'text-[#1a2e2c]' : 'text-white'}`}>
            {msg.text}
          </p>
        </div>

        {/* Reservation card */}
        {msg.showCard && <ReservationCard />}

        {/* Meta row */}
        <div className={`flex items-center gap-1.5 px-1 ${isBot ? '' : 'flex-row-reverse'}`}>
          <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
          {!isBot && (
            <CheckCheck className="w-3.5 h-3.5 text-[#80B9B6]" />
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Date pill ────────────────────────────────────────────────────── */
function DatePill({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-[#E6F1F0]/80 border border-[#80B9B6]/25 rounded-full px-4 py-1">
        <span className="text-[11px] font-semibold text-[#80B9B6]">{label}</span>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────── */
export default function ChatAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [convDone, setConvDone] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* ── Conversation reveal sequence ── */
  useEffect(() => {
    const t1 = setTimeout(() => setMessages([MSG_BOT_1]), 400);
    const t2 = setTimeout(() => setMessages((p) => [...p, MSG_USER]), 1800);
    const t3 = setTimeout(() => setTyping(true), 2700);
    const t4 = setTimeout(() => {
      setTyping(false);
      setMessages((p) => [...p, MSG_BOT_2]);
      setConvDone(true);
    }, 4400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadedFile(f);
    setUploadSuccess(true);
  };

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div className="h-screen flex flex-col bg-[#F0F7F6] overflow-hidden">

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm z-30 flex-shrink-0">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">

          {/* Back */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-[#E6F1F0] flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-[#00736D]" />
          </motion.button>

          {/* Shop logo */}
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00736D] to-[#002E2C] flex items-center justify-center shadow-lg shadow-[#00736D]/25">
              <span className="text-white font-black text-sm">IM</span>
            </div>
            {/* Online status dot — red for offline */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
          </div>

          {/* Name + status */}
          <div className="flex-1 min-w-0">
            <h2 className="text-[#002E2C] font-black text-[15px] leading-tight truncate">
              Ink Masters Print Shop
            </h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <div className="flex items-center gap-1">
                <WifiOff className="w-2.5 h-2.5 text-rose-500" />
                <span className="text-[10px] font-bold text-rose-500">Currently Offline</span>
              </div>
              <span className="text-[10px] text-slate-300">·</span>
              <div className="flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-[#00736D]" />
                <span className="text-[10px] font-bold text-[#00736D]">AI Auto-Pilot Active</span>
              </div>
            </div>
          </div>

          {/* Options */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            className="w-9 h-9 rounded-xl bg-[#E6F1F0] flex items-center justify-center flex-shrink-0"
          >
            <MoreVertical className="w-4 h-4 text-[#80B9B6]" />
          </motion.button>
        </div>

        {/* Offline notice banner */}
        <div className="max-w-lg mx-auto px-4 pb-2.5">
          <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-100 rounded-xl px-3.5 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse flex-shrink-0" />
            <p className="text-[11px] text-rose-600 font-semibold">
              Shop is offline. The AI is handling reservations automatically.
            </p>
          </div>
        </div>
      </div>

      {/* ── CHAT AREA ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4 max-w-lg mx-auto w-full">

        {/* Date separator */}
        <DatePill label="Today" />

        {/* Messages */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {typing && <TypingIndicator />}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* ── ACTION AREA ───────────────────────────────────────────── */}
      <AnimatePresence>
        {convDone && (
          <motion.div
            key="actions"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="flex-shrink-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-2xl shadow-black/10 z-20"
          >
            <div className="max-w-lg mx-auto px-4 py-4 space-y-3">

              {/* Upload button */}
              <label htmlFor="chat-file-upload">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm cursor-pointer transition-all ${
                    uploadSuccess
                      ? 'bg-green-50 border-2 border-green-500/50 text-green-700'
                      : 'bg-gradient-to-r from-[#00736D] to-[#002E2C] text-white shadow-lg shadow-[#00736D]/30 hover:shadow-xl hover:shadow-[#00736D]/40'
                  }`}
                >
                  {uploadSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="truncate max-w-[200px]">{uploadedFile?.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload File
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

              {/* Disabled input */}
              <div className="flex items-center gap-2.5">
                <div className="flex-1 flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                  <FileText className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  <span className="text-sm text-slate-400 font-medium flex-1 truncate">
                    {uploadSuccess ? uploadedFile?.name : 'Awaiting file upload…'}
                  </span>
                  {uploadSuccess && (
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  disabled={!uploadSuccess}
                  onClick={() => uploadSuccess && navigate('/settings')}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                    uploadSuccess
                      ? 'bg-gradient-to-br from-[#00736D] to-[#002E2C] shadow-lg shadow-[#00736D]/30'
                      : 'bg-slate-100 cursor-not-allowed'
                  }`}
                >
                  <ArrowLeft
                    className={`w-4.5 h-4.5 rotate-180 ${uploadSuccess ? 'text-white' : 'text-slate-300'}`}
                  />
                </motion.button>
              </div>

              {/* Hint */}
              <p className="text-center text-[11px] text-slate-400 font-medium pb-1">
                {uploadSuccess
                  ? '✓ File ready — tap ➤ to proceed to print settings'
                  : 'Upload your PDF or DOCX to complete the reservation'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
