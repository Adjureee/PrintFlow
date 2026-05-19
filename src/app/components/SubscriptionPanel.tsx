import { useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Button } from "./ui/button";

interface SubscriptionPanelProps {
  subscriptionTier: "standard" | "premium" | string;
  shopName?: string;
}

export function SubscriptionPanel({
  subscriptionTier,
  shopName,
}: SubscriptionPanelProps) {
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  const isPremium = subscriptionTier === "premium";
  const headline = isPremium ? "Premium Partner Tier" : "Standard Listing Plan";
  const description = isPremium
    ? "Your shop is unlocked for low-latency Groq AI auto-replies and priority platform placement."
    : "This shop currently has the basic map listing package with manual order handling.";

  const handleUpgradeClick = () => {
    setCheckoutMessage(
      "Mock checkout initiated. In production, this would open the premium billing flow.",
    );
  };

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#E6F1F0] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#00736D]">
              <Sparkles className="h-4 w-4" />
              {headline}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {shopName
                  ? `${shopName} Subscription`
                  : "Vendor subscription status"}
              </p>
              <p className="text-sm text-slate-500">{description}</p>
            </div>
          </div>
          <div className="rounded-3xl bg-[#F5FFF9] px-4 py-2 text-sm font-black text-emerald-700 ring-1 ring-emerald-200">
            {isPremium ? "Premium" : "Standard"}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-[#F9FEFF] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Zap className="h-4 w-4 text-[#00736D]" />
              {isPremium
                ? "Unlocked: Ultra-Low Latency Groq AI Auto-Reply Bot"
                : "Basic Map Listing"}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {isPremium
                ? "AI auto-response for offline student reservations is active."
                : "Your shop is discoverable on the vendor map with standard visibility."}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-[#00736D]" />
              Premium Benefits
            </div>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>• Priority placement in vendor discovery</li>
              <li>• Faster reservation handling with AI support</li>
              <li>• More customer visibility and analytics</li>
            </ul>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Upgrade to unlock AI features
            </p>
            <p className="text-sm text-slate-500">
              Premium unlocks full Groq AI auto-reply, real-time reservation
              support, and premium placement.
            </p>
          </div>
          <Button
            onClick={handleUpgradeClick}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#00736D] px-4 py-3 text-sm font-black text-white hover:bg-[#00574F]"
          >
            Upgrade to Premium
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {checkoutMessage ? (
          <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {checkoutMessage}
          </p>
        ) : null}
      </div>

      {isPremium ? (
        <div className="rounded-3xl border border-[#D6F5EB] bg-[#F5FFFA] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                AI Configuration
              </p>
              <p className="text-sm text-slate-500">
                Only premium vendors can tune Groq AI auto-replies and offline
                reservation behavior.
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
              Live
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Reply Mode
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Reservation-first
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Groq AI prioritizes pickup scheduling and reservation
                confirmation with students.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Latency Profile
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Ultra-low
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Response latency is optimized for fast campus chat flows and
                rapid reservation replies.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
