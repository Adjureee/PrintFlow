import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot, Bell, LogOut, BarChart3, ChevronRight, Clock, Package,
  CheckCircle2, Sparkles, FileText, Store, TrendingUp, Zap,
  ArrowRight, User, Settings,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

/* ─── Queue data ───────────────────────────────────────────────────── */
const TODAY_QUEUE = [
  { id: 'q1', time: '08:00 AM', name: 'Maria Santos', pages: 2,  type: 'PDF',  copies: 1, status: 'done',        isAI: false },
  { id: 'q2', time: '09:30 AM', name: 'Jed Camacho',  pages: 5,  type: 'DOCX', copies: 3, status: 'processing',  isAI: false },
  { id: 'q3', time: '11:00 AM', name: 'Ana Reyes',    pages: 8,  type: 'PDF',  copies: 2, status: 'ready',       isAI: false },
  { id: 'q4', time: '01:00 PM', name: 'Mark',         pages: 15, type: 'PDF',  copies: 1, status: 'ai-reserved', isAI: true  },
  { id: 'q5', time: '02:30 PM', name: 'Lisa Tan',     pages: 3,  type: 'PDF',  copies: 2, status: 'pending',     isAI: false },
  { id: 'q6', time: '03:30 PM', name: 'Ryan Cruz',    pages: 8,  type: 'DOCX', copies: 1, status: 'pending',     isAI: false },
];

/* ─── Status config ────────────────────────────────────────────────── */
type Status = 'done' | 'processing' | 'ready' | 'ai-reserved' | 'pending';
const STATUS: Record<Status, { label: string; pill: string; dot: string; icon: React.ReactNode }> = {
  done:         { label: 'Done',        pill: 'bg-gray-100 text-gray-500',               dot: 'bg-gray-400',    icon: <CheckCircle2 className="w-3 h-3" /> },
  processing:   { label: 'Printing…',  pill: 'bg-blue-50 text-blue-600',                dot: 'bg-blue-500',    icon: <Package className="w-3 h-3" /> },
  ready:        { label: 'Ready',       pill: 'bg-emerald-50 text-emerald-700',          dot: 'bg-emerald-500', icon: <CheckCircle2 className="w-3 h-3" /> },
  'ai-reserved':{ label: 'AI Reserved', pill: 'bg-[#E6F1F0] text-[#00736D]',            dot: 'bg-[#00736D]',   icon: <Bot className="w-3 h-3" /> },
  pending:      { label: 'Pending',     pill: 'bg-amber-50 text-amber-600',              dot: 'bg-amber-400',   icon: <Clock className="w-3 h-3" /> },
};

/* ─── Toggle Switch ────────────────────────────────────────────────── */
function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${
        on ? 'bg-[#00736D]' : 'bg-gray-300'
      }`}
      whileTap={{ scale: 0.93 }}
    >
      <motion.div
        animate={{ x: on ? 24 : 2 }}
        transition={{ type: 'spring', damping: 20, stiffness: 400 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
      />
    </motion.button>
  );
}

/* ─── Queue Row ────────────────────────────────────────────────────── */
function QueueRow({ item, index, onReview }: { item: typeof TODAY_QUEUE[0]; index: number; onReview: () => void }) {
  const cfg = STATUS[item.status as Status];
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
      className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all ${
        item.isAI
          ? 'bg-gradient-to-r from-[#E6F1F0]/80 to-[#80B9B6]/15 border border-[#80B9B6]/40 shadow-sm'
          : 'bg-white border border-slate-100'
      }`}
    >
      {/* Time */}
      <div className="flex-shrink-0 w-16 text-center">
        <span className={`text-[11px] font-black leading-tight block ${item.isAI ? 'text-[#00736D]' : 'text-slate-400'}`}>
          {item.time.split(' ')[0]}
        </span>
        <span className={`text-[9px] font-semibold ${item.isAI ? 'text-[#80B9B6]' : 'text-slate-300'}`}>
          {item.time.split(' ')[1]}
        </span>
      </div>

      {/* Divider dot */}
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={`text-sm font-black truncate ${item.isAI ? 'text-[#002E2C]' : 'text-slate-700'}`}>
            {item.name}
          </p>
          {item.isAI && <Bot className="w-3.5 h-3.5 text-[#00736D] flex-shrink-0" />}
        </div>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
          {item.pages} pages · {item.type} · {item.copies}× copy
        </p>
      </div>

      {/* Status / Action */}
      {item.isAI ? (
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={onReview}
          className="flex-shrink-0 px-2.5 py-1.5 bg-[#00736D] text-white text-[10px] font-black rounded-xl shadow-sm shadow-[#00736D]/30"
        >
          Review
        </motion.button>
      ) : (
        <span className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold ${cfg.pill}`}>
          {cfg.icon}
          {cfg.label}
        </span>
      )}
    </motion.div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────── */
export default function ShopHome() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [aiMode, setAIMode] = useState(true);
  const [notifDismissed, setNotifDismissed] = useState(false);

  const handleLogout = async () => { await signOut(); navigate('/login'); };

  const stats = [
    { label: 'Pending',    value: 3, icon: <Clock className="w-4 h-4" />,        color: 'text-amber-600  bg-amber-50',   dot: 'bg-amber-400' },
    { label: 'Printing',   value: 2, icon: <Package className="w-4 h-4" />,       color: 'text-blue-600   bg-blue-50',    dot: 'bg-blue-500' },
    { label: 'Today',      value: 6, icon: <CheckCircle2 className="w-4 h-4" />,  color: 'text-[#00736D]  bg-[#E6F1F0]', dot: 'bg-[#00736D]' },
  ];

  return (
    <div className="min-h-screen bg-[#F2F8F7]">

      {/* ── STICKY HEADER ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3.5">

          {/* Row 1: identity + actions */}
          <div className="flex items-center gap-3">

            {/* Shop logo */}
            <motion.div
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/shop/profile')}
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00736D] to-[#002E2C] flex items-center justify-center shadow-lg shadow-[#00736D]/25 flex-shrink-0 cursor-pointer"
            >
              <Store className="w-5 h-5 text-white" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#80B9B6] font-semibold uppercase tracking-widest">
                Shop Dashboard
              </p>
              <h1 className="text-[#002E2C] font-black text-base leading-tight truncate">
                Hello, {user?.name ?? 'Ink Masters'}! 👋
              </h1>
            </div>

            {/* Icon actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => navigate('/shop/analytics')}
                className="w-9 h-9 rounded-xl bg-[#E6F1F0] flex items-center justify-center"
              >
                <BarChart3 className="w-4 h-4 text-[#00736D]" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => navigate('/shop/notifications')}
                className="relative w-9 h-9 rounded-xl bg-[#E6F1F0] flex items-center justify-center"
              >
                <Bell className="w-4 h-4 text-[#00736D]" />
                {!notifDismissed && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={handleLogout}
                className="w-9 h-9 rounded-xl bg-[#E6F1F0] flex items-center justify-center"
              >
                <LogOut className="w-4 h-4 text-[#80B9B6]" />
              </motion.button>
            </div>
          </div>

          {/* Row 2: AI toggle */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${aiMode ? 'bg-[#E6F1F0]' : 'bg-gray-100'}`}>
                <Bot className={`w-3.5 h-3.5 ${aiMode ? 'text-[#00736D]' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-[12px] font-black text-[#002E2C] leading-tight">AI Auto-Pilot (Away Mode)</p>
                <p className={`text-[10px] font-semibold ${aiMode ? 'text-[#00736D]' : 'text-gray-400'}`}>
                  {aiMode ? 'Active — AI is handling reservations' : 'Disabled — Manual mode'}
                </p>
              </div>
            </div>
            <ToggleSwitch on={aiMode} onToggle={() => setAIMode(v => !v)} />
          </div>
        </div>
      </div>

      {/* ── SCROLL CONTENT ────────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 pt-5 pb-10 space-y-5">

        {/* ── MINI STATS ROW ──────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2.5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i }}
              className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm"
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center mb-2 ${s.color.split(' ')[1]}`}>
                <span className={s.color.split(' ')[0]}>{s.icon}</span>
              </div>
              <p className="text-2xl font-black text-[#002E2C]">{s.value}</p>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── AI NOTIFICATION CARD ─��──────────────────────────────── */}
        <AnimatePresence>
          {aiMode && !notifDismissed && (
            <motion.div
              key="ai-notif"
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#00736D]/20"
              style={{ isolation: 'isolate' }}
            >
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-3xl ring-2 ring-[#00736D]/30 pointer-events-none z-10" />

              {/* Gradient top band */}
              <div className="bg-gradient-to-r from-[#002E2C] via-[#00736D] to-[#008A83] px-5 pt-5 pb-6 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/5 rounded-full" />
                <div className="absolute -bottom-8 -left-4 w-20 h-20 bg-white/5 rounded-full" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-2 right-12 w-16 h-16 border-2 border-white/10 rounded-full"
                />

                {/* Header row */}
                <div className="flex items-start gap-3 relative z-10">
                  {/* Animated robot icon */}
                  <div className="relative flex-shrink-0">
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                      className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg"
                    >
                      <Bot className="w-8 h-8 text-white" />
                    </motion.div>
                    {/* Pulse ring */}
                    <motion.div
                      animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-2xl border-2 border-white/40"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-white font-black text-lg leading-tight">
                        New AI Reservation!
                      </h2>
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1.4 }}
                        className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-black rounded-full uppercase tracking-widest"
                      >
                        NEW
                      </motion.span>
                    </div>
                    <p className="text-white/70 text-[11px] font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Secured while you were away
                    </p>
                  </div>
                </div>
              </div>

              {/* White content area */}
              <div className="bg-white px-5 pt-4 pb-5 space-y-4">

                {/* Description */}
                <p className="text-[#002E2C] text-sm leading-relaxed font-medium">
                  Your AI Assistant secured a new booking while you were away.{' '}
                  <span className="font-black text-[#002E2C]">Mark</span> scheduled a{' '}
                  <span className="font-black text-[#00736D]">15-page PDF</span> for{' '}
                  <span className="font-black text-[#002E2C]">1:00 PM</span>.
                </p>

                {/* Mini detail chips */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: <FileText className="w-3 h-3" />, text: '15 pages · PDF' },
                    { icon: <Clock className="w-3 h-3" />,     text: 'Today · 1:00 PM' },
                    { icon: <Bot className="w-3 h-3" />,       text: 'AI Confirmed' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-1.5 bg-[#E6F1F0] px-3 py-1.5 rounded-full">
                      <span className="text-[#00736D]">{icon}</span>
                      <span className="text-[11px] font-bold text-[#002E2C]">{text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/shop/order/ORD-AI-001')}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-[#00736D] to-[#002E2C] text-white font-black text-sm shadow-lg shadow-[#00736D]/30"
                >
                  <FileText className="w-4 h-4" />
                  Review &amp; Accept File
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </motion.button>

                {/* Dismiss */}
                <button
                  onClick={() => setNotifDismissed(true)}
                  className="w-full text-center text-[11px] text-slate-400 font-semibold hover:text-slate-600 transition-colors"
                >
                  Dismiss notification
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI mode off / notif dismissed — show small chip */}
        {(!aiMode || notifDismissed) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2.5 bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm"
          >
            <div className={`w-2 h-2 rounded-full ${aiMode ? 'bg-[#00736D] animate-pulse' : 'bg-gray-300'}`} />
            <p className="text-sm font-semibold text-slate-500">
              {aiMode ? 'AI Auto-Pilot is active — no new reservations yet.' : 'AI Auto-Pilot is off. Enable it to accept bookings automatically.'}
            </p>
          </motion.div>
        )}

        {/* ── TODAY'S QUEUE ──────────────────────────────────────── */}
        <div>
          {/* Section header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[#002E2C] font-black text-sm flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-[#E6F1F0] flex items-center justify-center">
                  <Clock className="w-3 h-3 text-[#00736D]" />
                </div>
                Today's Queue
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 ml-7">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => navigate('/shop/notifications')}
              className="text-xs font-bold text-[#80B9B6] hover:text-[#00736D] transition-colors"
            >
              View all →
            </button>
          </div>

          {/* Queue rows */}
          <div className="space-y-2">
            {TODAY_QUEUE.map((item, i) => (
              <QueueRow
                key={item.id}
                item={item}
                index={i}
                onReview={() => navigate('/shop/order/ORD-AI-001')}
              />
            ))}
          </div>
        </div>

        {/* ── QUICK ACTIONS ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Analytics',    sub: 'Revenue & trends',  icon: <BarChart3 className="w-5 h-5" />,    path: '/shop/analytics' },
            { label: 'Notifications', sub: 'Pending alerts',   icon: <Bell className="w-5 h-5" />,         path: '/shop/notifications' },
          ].map(({ label, sub, icon, path }) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(path)}
              className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 hover:border-[#80B9B6]/40 hover:shadow-md transition-all text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-[#E6F1F0] flex items-center justify-center text-[#00736D] flex-shrink-0">
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-[#002E2C] font-black text-sm">{label}</p>
                <p className="text-[10px] text-slate-400 font-medium">{sub}</p>
              </div>
            </motion.button>
          ))}
        </div>

      </div>
    </div>
  );
}
