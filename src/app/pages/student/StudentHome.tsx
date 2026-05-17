import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Upload, MapPin, Clock, Printer, ChevronRight, Zap, LogOut,
  Bell, Sparkles, X, CheckCircle2, FileText, Calendar,
  ChevronLeft, AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../components/ui/button';
import { PrintStationsMap } from '../../components/PrintStationsMap';
import { mockLocations, type PrintLocation, calculateDistance } from '../../lib/store';
import { useAuth } from '../../lib/auth-context';

/* ─── Helpers ─────────────────────────────────────────────────────── */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const TIME_SLOTS = ['08:00 AM', '10:30 AM', '01:00 PM', '03:30 PM'];

function buildDayStrip(anchor: Date, count = 14) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/* ─── Component ───────────────────────────────────────────────────── */
export default function StudentHome() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  /* existing state */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<PrintLocation | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceError, setDistanceError] = useState<string | null>(null);

  /* new state */
  const [mode, setMode] = useState<'now' | 'later'>('now');
  const [today] = useState(() => new Date());
  const [dayStrip] = useState(() => buildDayStrip(new Date()));
  const [calendarStart, setCalendarStart] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const stripRef = useRef<HTMLDivElement>(null);

  /* auto-hide tooltip */
  useEffect(() => {
    const t = setTimeout(() => setShowTooltip(false), 4000);
    return () => clearTimeout(t);
  }, []);

  /* geolocation */
  useEffect(() => {
    const fallback = { lat: 7.3013, lng: 125.6806 };
    if (!navigator.geolocation) { setUserLocation(fallback); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        setUserLocation(
          typeof lat === 'number' && isFinite(lat) && typeof lng === 'number' && isFinite(lng)
            ? { lat, lng }
            : fallback
        );
      },
      () => setUserLocation(fallback)
    );
  }, []);

  /* ── Handlers ── */
  const handleLogout = async () => { await signOut(); navigate('/login'); };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const valid = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (valid.includes(file.type)) setSelectedFile(file);
    else alert('Please upload a PDF or DOCX file');
  };

  const handleLocationSelect = (loc: PrintLocation) => {
    if (userLocation) {
      const dist = calculateDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng);
      if (dist > 500) {
        setDistanceError(`Too far (${Math.round(dist)}m). Select a shop within 500m.`);
        setSelectedLocation(loc);
        return;
      }
    }
    setDistanceError(null);
    setSelectedLocation(loc);
  };

  const handleContinue = () => {
    if (!selectedFile || !selectedLocation) return;
    sessionStorage.setItem('printFile', selectedFile.name);
    sessionStorage.setItem('printLocation', JSON.stringify(selectedLocation));
    if (mode === 'later' && selectedSlot) {
      sessionStorage.setItem('scheduledDate', selectedDate.toISOString());
      sessionStorage.setItem('scheduledTime', selectedSlot);
    }
    navigate('/settings');
  };

  const canContinue =
    !!selectedFile &&
    !!selectedLocation &&
    !distanceError &&
    (mode === 'now' || (mode === 'later' && !!selectedSlot));

  const visibleDays = dayStrip.slice(calendarStart, calendarStart + 7);

  /* ── Rendering ── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E6F1F0]/60 via-white to-[#F8FAFA] pb-28">

      {/* ── STICKY HEADER ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#80B9B6]/20 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3.5 flex items-center gap-3">

          {/* Avatar + text */}
          <div
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00736D] to-[#002E2C] flex items-center justify-center shadow-lg shadow-[#00736D]/25 flex-shrink-0 cursor-pointer"
            onClick={() => navigate('/profile')}
          >
            <span className="text-white font-black text-lg">
              {user?.name?.charAt(0).toUpperCase() ?? 'S'}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[#80B9B6] font-semibold uppercase tracking-widest">Welcome back</p>
            <h1 className="text-[#002E2C] font-black text-base leading-tight truncate">
              {user?.name ?? 'Student'} 👋
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <motion.button
              whileTap={{ scale: 0.88 }}
              className="relative w-9 h-9 rounded-xl bg-[#E6F1F0] hover:bg-[#80B9B6]/30 flex items-center justify-center transition-colors"
            >
              <Bell className="w-4 h-4 text-[#00736D]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleLogout}
              className="w-9 h-9 rounded-xl bg-[#E6F1F0] hover:bg-red-50 flex items-center justify-center transition-colors"
            >
              <LogOut className="w-4 h-4 text-[#80B9B6] hover:text-red-500" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── MAIN SCROLL AREA ──────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 space-y-5 pt-5">

        {/* ── SEGMENTED CONTROL ─────────────────────────────────── */}
        <div className="bg-[#E6F1F0]/70 p-1.5 rounded-2xl flex gap-1.5">
          {(['now', 'later'] as const).map((m) => (
            <motion.button
              key={m}
              layout
              onClick={() => setMode(m)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                mode === m
                  ? 'bg-gradient-to-r from-[#00736D] to-[#005550] text-white shadow-lg shadow-[#00736D]/30'
                  : 'text-[#80B9B6] hover:text-[#002E2C]'
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {m === 'now' ? (
                <><Printer className="w-4 h-4" /> Print Now</>
              ) : (
                <><Calendar className="w-4 h-4" /> Schedule for Later</>
              )}
            </motion.button>
          ))}
        </div>

        {/* ── SCHEDULE VIEW ─────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {mode === 'later' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-3xl shadow-sm border border-[#80B9B6]/15 p-4 space-y-4">

                {/* Month header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[#002E2C] font-black text-sm">Select Date</h3>
                    <p className="text-[#80B9B6] text-xs font-medium mt-0.5">
                      {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCalendarStart(Math.max(0, calendarStart - 7))}
                      disabled={calendarStart === 0}
                      className="w-7 h-7 bg-[#E6F1F0] disabled:opacity-30 rounded-xl flex items-center justify-center hover:bg-[#80B9B6]/30 transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 text-[#00736D]" />
                    </button>
                    <button
                      onClick={() => setCalendarStart(calendarStart + 7)}
                      disabled={calendarStart + 7 >= dayStrip.length}
                      className="w-7 h-7 bg-[#E6F1F0] disabled:opacity-30 rounded-xl flex items-center justify-center hover:bg-[#80B9B6]/30 transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-[#00736D]" />
                    </button>
                  </div>
                </div>

                {/* Day strip */}
                <div className="grid grid-cols-7 gap-1" ref={stripRef}>
                  {visibleDays.map((date) => {
                    const isToday = isSameDay(date, today);
                    const isSelected = isSameDay(date, selectedDate);
                    return (
                      <motion.button
                        key={date.toISOString()}
                        whileTap={{ scale: 0.88 }}
                        onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                        className={`flex flex-col items-center py-2.5 rounded-2xl transition-all ${
                          isSelected
                            ? 'bg-gradient-to-b from-[#00736D] to-[#002E2C] shadow-md shadow-[#00736D]/30'
                            : isToday
                            ? 'bg-[#E6F1F0] ring-1 ring-[#00736D]/30'
                            : 'hover:bg-[#E6F1F0]'
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase leading-none ${isSelected ? 'text-white/70' : 'text-[#80B9B6]'}`}>
                          {DAY_NAMES[date.getDay()]}
                        </span>
                        <span className={`text-sm font-black mt-1 leading-none ${isSelected ? 'text-white' : 'text-[#002E2C]'}`}>
                          {date.getDate()}
                        </span>
                        {isToday && !isSelected && (
                          <div className="w-1 h-1 bg-[#00736D] rounded-full mt-1" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Time Slots */}
                <div>
                  <p className="text-[#002E2C] text-xs font-black mb-2.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#00736D]" /> Available Time Slots
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <motion.button
                        key={slot}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                          selectedSlot === slot
                            ? 'bg-gradient-to-r from-[#00736D] to-[#005550] text-white border-transparent shadow-md shadow-[#00736D]/30'
                            : 'bg-white border-[#80B9B6]/40 text-[#002E2C] hover:border-[#00736D]/50 hover:bg-[#E6F1F0]'
                        }`}
                      >
                        {slot}
                        {selectedSlot === slot && (
                          <CheckCircle2 className="inline w-3 h-3 ml-1.5 -mt-0.5" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Confirmation hint */}
                {selectedSlot && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-3 py-2.5 bg-[#E6F1F0] rounded-xl"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#00736D] flex-shrink-0" />
                    <p className="text-xs font-semibold text-[#00736D]">
                      Scheduled for {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {selectedSlot}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── UPLOAD CARD ───────────────────────────────────────── */}
        <div>
          <label htmlFor="file-upload" className="block cursor-pointer">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`relative rounded-2xl border-2 border-dashed transition-all p-5 flex items-center gap-4 ${
                selectedFile
                  ? 'border-[#00736D] bg-[#E6F1F0]/60'
                  : 'border-[#80B9B6]/50 bg-white hover:border-[#00736D]/50 hover:bg-[#E6F1F0]/30'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                selectedFile
                  ? 'bg-gradient-to-br from-[#00736D] to-[#002E2C] shadow-lg shadow-[#00736D]/30'
                  : 'bg-[#E6F1F0]'
              }`}>
                {selectedFile
                  ? <FileText className="w-6 h-6 text-white" />
                  : <Upload className="w-6 h-6 text-[#80B9B6]" />
                }
              </div>

              <div className="flex-1 min-w-0">
                {selectedFile ? (
                  <>
                    <p className="text-[#002E2C] font-bold text-sm truncate">{selectedFile.name}</p>
                    <p className="text-[#80B9B6] text-xs font-medium mt-0.5">Tap to change file</p>
                  </>
                ) : (
                  <>
                    <p className="text-[#002E2C] font-bold text-sm">Tap to Upload Document</p>
                    <p className="text-[#80B9B6] text-xs font-medium mt-0.5">PDF / DOCX • Max 10 MB</p>
                  </>
                )}
              </div>

              {selectedFile && (
                <CheckCircle2 className="w-5 h-5 text-[#00736D] flex-shrink-0" />
              )}

              <input
                id="file-upload"
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleFileSelect}
              />
            </motion.div>
          </label>
        </div>

        {/* ── MAP CARD ──────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[#002E2C] font-black text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#00736D]" />
              Partner Shops Near You
            </h3>
            <button
              onClick={() => setShowMap(!showMap)}
              className="text-xs font-semibold text-[#80B9B6] hover:text-[#00736D] transition-colors"
            >
              {showMap ? 'Hide map' : 'Show map'}
            </button>
          </div>

          {/* Distance error */}
          <AnimatePresence>
            {distanceError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200 rounded-2xl"
              >
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 font-medium">{distanceError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Map */}
          <AnimatePresence initial={false}>
            {showMap && (
              <motion.div
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl overflow-hidden shadow-md border border-[#80B9B6]/15"
              >
                <PrintStationsMap
                  locations={mockLocations}
                  selectedLocation={selectedLocation}
                  onLocationSelect={handleLocationSelect}
                  userLocation={userLocation}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shop list */}
          <div className="space-y-2.5">
            {mockLocations.map((loc, i) => {
              const isSelected = selectedLocation?.id === loc.id;
              const etaColor =
                loc.waitTime <= 5 ? 'text-green-600 bg-green-50'
                : loc.waitTime <= 10 ? 'text-amber-600 bg-amber-50'
                : 'text-orange-600 bg-orange-50';
              return (
                <motion.button
                  key={loc.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleLocationSelect(loc)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-[#00736D] bg-gradient-to-r from-[#E6F1F0] to-[#80B9B6]/20 shadow-md shadow-[#00736D]/10'
                      : 'border-[#80B9B6]/20 bg-white hover:border-[#00736D]/30 hover:shadow-sm'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#00736D] to-[#002E2C] shadow-md'
                      : 'bg-[#E6F1F0]'
                  }`}>
                    <Printer className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-[#00736D]'}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[#002E2C] font-bold text-sm truncate">{loc.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${etaColor}`}>
                        {loc.waitTime} min ETA
                      </span>
                      {loc.waitTime <= 5 && (
                        <span className="text-[10px] font-semibold text-green-600 flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" /> Fast
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status dot + check */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full ${
                      loc.status === 'online' ? 'bg-green-500 shadow-sm shadow-green-500/60' : 'bg-gray-300'
                    }`} />
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#00736D]" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

      </div>{/* end scroll area */}

      {/* ── AI FAB ────────────────────────────────────────────────── */}
      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.92 }}
              className="relative bg-[#002E2C] text-white text-xs font-semibold px-3.5 py-2 rounded-2xl shadow-xl whitespace-nowrap max-w-[200px] text-center"
            >
              Ask Gemini to schedule your print!
              {/* Arrow */}
              <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-[#002E2C] rotate-45 rounded-sm" />
              <button
                onClick={() => setShowTooltip(false)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#80B9B6]/30 rounded-full flex items-center justify-center hover:bg-[#80B9B6]/60 transition-colors"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate('/chat')}
          className="flex items-center gap-2 bg-gradient-to-r from-[#00736D] to-[#002E2C] text-white px-4 py-3 rounded-2xl shadow-2xl shadow-[#00736D]/40 font-bold text-sm"
        >
          <Sparkles className="w-4 h-4" />
          AI Assistant
        </motion.button>
      </div>

      {/* ── STICKY BOTTOM CTA ─────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#80B9B6]/20 px-4 py-4 shadow-2xl shadow-black/10">
        <div className="max-w-lg mx-auto">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base transition-all ${
              canContinue
                ? 'bg-gradient-to-r from-[#00736D] via-[#008A83] to-[#002E2C] text-white shadow-lg shadow-[#00736D]/30 hover:shadow-xl hover:shadow-[#00736D]/40'
                : 'bg-[#E6F1F0] text-[#80B9B6] cursor-not-allowed'
            }`}
          >
            <span>Continue to Print Settings</span>
            {canContinue && <ChevronRight className="w-5 h-5" />}
          </motion.button>

          {/* Hint text */}
          {!canContinue && (
            <p className="text-center text-[11px] text-[#80B9B6] font-medium mt-2">
              {!selectedFile
                ? 'Upload a document to get started'
                : !selectedLocation
                ? 'Select a partner shop'
                : mode === 'later' && !selectedSlot
                ? 'Choose a time slot'
                : 'Fix the distance error above'}
            </p>
          )}
        </div>
      </div>

    </div>
  );
}