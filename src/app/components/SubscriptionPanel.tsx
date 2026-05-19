import { Zap, MapPin, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface SubscriptionPanelProps {
  subscriptionTier: "standard" | "premium";
}

export function SubscriptionPanel({
  subscriptionTier,
}: SubscriptionPanelProps) {
  const isPremium = subscriptionTier === "premium";

  return (
    <div className="space-y-6">
      <Card
        className={`relative overflow-hidden border p-6 shadow-sm ${isPremium ? "border-[#00736D] bg-[#F7FBFB]" : "border-slate-200 bg-white"}`}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-[#002E2C]">
                {isPremium ? "Premium Partner" : "Standard Partner"}
              </h2>
              {isPremium && (
                <span className="rounded-full bg-[#00736D] px-3 py-1 text-[10px] font-bold text-white uppercase tracking-widest">
                  Active
                </span>
              )}
            </div>
            <p className="max-w-md text-sm text-slate-600">
              {isPremium
                ? "You have full access to automated reservations and premium campus visibility."
                : "Upgrade to Premium to automate your customer service with our Groq AI auto-reply bot."}
            </p>
          </div>

          {!isPremium && (
            <Button className="shrink-0 gap-2 bg-[#002E2C] text-white hover:bg-[#00736D]">
              <Zap className="h-4 w-4" /> Upgrade to Premium
            </Button>
          )}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <MapPin className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-[#002E2C]">
                Basic Map Listing
              </p>
              <p className="text-xs text-slate-500">
                Students can find your shop on the campus map.
              </p>
            </div>
          </div>

          <div
            className={`flex items-start gap-3 rounded-xl border p-4 ${isPremium ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-slate-50"}`}
          >
            {isPremium ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
            ) : (
              <Lock className="mt-0.5 h-5 w-5 text-slate-400" />
            )}
            <div>
              <p
                className={`text-sm font-bold ${isPremium ? "text-[#002E2C]" : "text-slate-500"}`}
              >
                Ultra-Low Latency Groq AI Bot
              </p>
              <p className="text-xs text-slate-500">
                Automate chat reservations when you are offline.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Conditionally Render AI Settings ONLY for Premium */}
      {isPremium && (
        <Card className="border-[#80B9B6]/30 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Zap className="h-5 w-5 text-[#00736D]" />
            <h3 className="text-base font-black text-[#002E2C]">
              AI Auto-Reply Configuration
            </h3>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Configure how the Groq AI handles student inquiries while you are
              away.
            </p>
            {/* Future implementation: Toggle switches for AI personality, reservation limits, etc. */}
            <Button
              variant="outline"
              className="border-[#00736D] text-[#00736D]"
            >
              Configure Bot Parameters
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
