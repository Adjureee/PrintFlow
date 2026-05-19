"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  AlertCircle,
  ChevronRight,
  FileText,
  LogOut,
  MapPin,
  MessageCircle,
  Printer,
  Sparkles,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { PrintStationsMap } from "../../components/PrintStationsMap";
import { ShopProfileSheet } from "../../components/ShopProfileSheet";
import {
  DNSC_CENTER,
  fetchPublicPrintShops,
  type PrintShop,
} from "../../lib/print-shops";
import { calculateDistance } from "../../lib/store";
import { useAuth } from "../../lib/auth-context";
import { setPendingPrintFile } from "../../lib/print-session";

export default function StudentHome() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<PrintShop | null>(
    null,
  );
  const [shops, setShops] = useState<PrintShop[]>([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [distanceError, setDistanceError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [profileShop, setProfileShop] = useState<PrintShop | null>(null);

  useEffect(() => {
    let active = true;
    setShopsLoading(true);

    void fetchPublicPrintShops()
      .then((records) => {
        if (!active) {
          return;
        }

        setShops(records);
        setSelectedLocation((current) => current ?? records[0] ?? null);
      })
      .catch(() => {
        if (active) {
          toast.error("Could not load partner shops");
        }
      })
      .finally(() => {
        if (active) {
          setShopsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const fallback = { lat: DNSC_CENTER.lat, lng: DNSC_CENTER.lng };

    if (!navigator.geolocation) {
      setUserLocation(fallback);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        setUserLocation(
          Number.isFinite(latitude) && Number.isFinite(longitude)
            ? { lat: latitude, lng: longitude }
            : fallback,
        );
      },
      () => setUserLocation(fallback),
    );
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or DOCX file");
      return;
    }

    setSelectedFile(file);
  };

  const handleLocationSelect = (shop: PrintShop) => {
    if (userLocation) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        shop.lat,
        shop.lng,
      );

      if (distance > 500) {
        setDistanceError(
          `Too far (${Math.round(distance)}m). Select a shop within 500m.`,
        );
        setSelectedLocation(shop);
        return;
      }
    }

    setDistanceError(null);
    setSelectedLocation(shop);
  };

  const handleContinue = () => {
    if (!selectedFile || !selectedLocation) {
      return;
    }

    setPendingPrintFile(selectedFile);
    sessionStorage.setItem("printFile", selectedFile.name);
    sessionStorage.setItem("printLocation", JSON.stringify(selectedLocation));
    navigate("/settings");
  };

  const premiumChatShop = useMemo(
    () => (selectedLocation?.tier === "premium" ? selectedLocation : null),
    [selectedLocation],
  );

  const canContinue = Boolean(
    selectedFile && selectedLocation && !distanceError,
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E6F1F0]/60 via-white to-[#F8FAFA] pb-28">
      <div className="sticky top-0 z-40 border-b border-[#80B9B6]/20 bg-white/80 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3.5">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00736D] to-[#002E2C] shadow-lg shadow-[#00736D]/25"
          >
            <span className="text-lg font-black text-white">
              {user?.name?.charAt(0).toUpperCase() ?? "S"}
            </span>
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#80B9B6]">
              Welcome back
            </p>
            <h1 className="truncate text-base font-black leading-tight text-[#002E2C]">
              {user?.name ?? "Student"}
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F1F0]"
            >
              <MessageCircle className="h-4 w-4 text-[#00736D]" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F1F0]"
            >
              <LogOut className="h-4 w-4 text-[#80B9B6]" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-5 px-4 pt-5">
        <Card className="overflow-hidden border-[#80B9B6]/20 bg-[#002E2C] p-5 text-white shadow-xl shadow-[#002E2C]/20">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Sparkles className="h-5 w-5 text-[#80B9B6]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#80B9B6]">
                Print Now
              </p>
              <h2 className="mt-1 text-lg font-black">
                Immediate local printing
              </h2>
              <p className="mt-2 text-sm text-white/75">
                Upload your file, pick a verified online partner, then jump into
                Groq-powered chat when you need a premium reservation.
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-dashed border-[#80B9B6]/30 bg-white/90 p-5 shadow-sm">
          <label htmlFor="file-upload" className="block cursor-pointer">
            <div
              className={`flex items-center gap-4 rounded-2xl border-2 border-dashed p-4 transition-all ${selectedFile ? "border-[#00736D] bg-[#E6F1F0]/60" : "border-[#80B9B6]/40 bg-white hover:border-[#00736D]/50"}`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${selectedFile ? "bg-gradient-to-br from-[#00736D] to-[#002E2C]" : "bg-[#E6F1F0]"}`}
              >
                {selectedFile ? (
                  <FileText className="h-6 w-6 text-white" />
                ) : (
                  <Upload className="h-6 w-6 text-[#80B9B6]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#002E2C]">
                  {selectedFile ? selectedFile.name : "Tap to upload document"}
                </p>
                <p className="mt-0.5 text-xs text-[#80B9B6]">
                  PDF or DOCX only
                </p>
              </div>
            </div>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-black text-[#002E2C]">
              <MapPin className="h-4 w-4 text-[#00736D]" />
              Verified online shops
            </h3>
            <button
              type="button"
              onClick={() => setShowMap((value) => !value)}
              className="text-xs font-semibold text-[#80B9B6]"
            >
              {showMap ? "Hide map" : "Show map"}
            </button>
          </div>

          <AnimatePresence>
            {distanceError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                <p className="text-xs font-medium text-rose-700">
                  {distanceError}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {showMap && (
            <Card className="overflow-hidden border-[#80B9B6]/15 bg-white/95 shadow-md">
              {shopsLoading ? (
                <div className="flex h-[420px] items-center justify-center text-sm text-[#80B9B6]">
                  Loading verified shops...
                </div>
              ) : shops.length === 0 ? (
                <div className="flex h-[420px] items-center justify-center px-6 text-center text-sm text-[#80B9B6]">
                  No verified online shops are available yet.
                </div>
              ) : (
                <PrintStationsMap
                  locations={shops}
                  selectedLocation={selectedLocation}
                  onLocationSelect={handleLocationSelect}
                  userLocation={userLocation}
                />
              )}
            </Card>
          )}

          <div className="space-y-2.5">
            {shops.map((shop, index) => {
              const isSelected = selectedLocation?.id === shop.id;
              const isPremium = shop.tier === "premium";
              const etaColor =
                shop.waitTime <= 5
                  ? "text-green-700 bg-green-50"
                  : shop.waitTime <= 10
                    ? "text-amber-700 bg-amber-50"
                    : "text-orange-700 bg-orange-50";

              return (
                <motion.div
                  key={shop.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className={`overflow-hidden rounded-2xl border-2 transition-all ${isSelected ? "border-[#00736D] bg-gradient-to-r from-[#E6F1F0] to-white shadow-md shadow-[#00736D]/10" : "border-[#80B9B6]/20 bg-white hover:border-[#00736D]/30 hover:shadow-sm"}`}
                >
                  <button
                    type="button"
                    onClick={() => handleLocationSelect(shop)}
                    className="flex w-full items-center gap-3 p-3.5 text-left active:scale-[0.99]"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? "bg-gradient-to-br from-[#00736D] to-[#002E2C] shadow-md" : "bg-[#E6F1F0]"}`}
                    >
                      <Printer
                        className={`w-5 h-5 ${isSelected ? "text-white" : "text-[#00736D]"}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-bold text-[#002E2C]">
                          {shop.name}
                        </p>
                        {isPremium && (
                          <span className="rounded-full bg-[#002E2C] px-2 py-0.5 text-[10px] font-bold text-white">
                            Premium
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${etaColor}`}
                        >
                          {shop.waitTime} min ETA
                        </span>
                        {isPremium && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-[#00736D]">
                            <Sparkles className="h-2.5 w-2.5" /> Groq AI
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div
                        className={`w-2 h-2 rounded-full ${shop.status === "online" ? "bg-green-500 shadow-sm shadow-green-500/60" : "bg-rose-400"}`}
                      />
                      {isSelected && <span className="text-[#00736D]">✓</span>}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>

          {premiumChatShop && (
            <Card className="border-[#00736D]/20 bg-[#E6F1F0]/50 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-black text-[#002E2C]">
                <Sparkles className="h-4 w-4 text-[#00736D]" />
                Groq AI available here
              </div>
              <p className="mt-1 text-xs text-[#00736D]">
                Premium partners get the ultra-low latency reservation bot when
                the shop is offline.
              </p>
              <Button
                type="button"
                onClick={() =>
                  navigate(`/shops/${premiumChatShop.slug}/contact`)
                }
                className="mt-3 w-full gap-2 rounded-2xl bg-gradient-to-r from-[#00736D] to-[#002E2C] text-white"
              >
                Open AI Chat <MessageCircle className="h-4 w-4" />
              </Button>
            </Card>
          )}
        </div>
      </div>

      <ShopProfileSheet
        shop={profileShop}
        onClose={() => setProfileShop(null)}
      />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#80B9B6]/20 bg-white/95 px-4 py-4 shadow-2xl shadow-black/10 backdrop-blur-xl">
        <div className="mx-auto max-w-lg">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-base transition-all ${canContinue ? "bg-gradient-to-r from-[#00736D] via-[#008A83] to-[#002E2C] text-white shadow-lg shadow-[#00736D]/30 hover:shadow-xl hover:shadow-[#00736D]/40" : "bg-[#E6F1F0] text-[#80B9B6] cursor-not-allowed"}`}
          >
            <span>Continue to Print Settings</span>
            {canContinue && <ChevronRight className="w-5 h-5" />}
          </motion.button>

          {!canContinue && (
            <p className="text-center text-[11px] text-[#80B9B6] font-medium mt-2">
              {!selectedFile
                ? "Upload a document to get started"
                : !selectedLocation
                  ? "Select a partner shop"
                  : "Fix the distance error above"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
