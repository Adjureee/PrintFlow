"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Activity,
  ArrowRight,
  Bell,
  Bot,
  CheckCircle2,
  Clock,
  Loader2,
  LogOut,
  MapPin,
  Package,
  RefreshCw,
  Settings,
  Shield,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { PageLoader } from "../../components/ui/page-loader";
import { useAuth } from "../../lib/auth-context";
import {
  fetchVendorDashboardData,
  formatPeso,
  type VendorDashboardData,
} from "../../lib/vendor-dashboard";

const STATUS_TONES: Record<
  string,
  { label: string; pill: string; icon: ReactNode }
> = {
  pending: {
    label: "Pending",
    pill: "bg-amber-50 text-amber-700",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  "awaiting-verification": {
    label: "Awaiting Verification",
    pill: "bg-amber-50 text-amber-700",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  processing: {
    label: "Processing",
    pill: "bg-blue-50 text-blue-700",
    icon: <Package className="h-3.5 w-3.5" />,
  },
  printing: {
    label: "Printing",
    pill: "bg-blue-50 text-blue-700",
    icon: <Package className="h-3.5 w-3.5" />,
  },
  ready: {
    label: "Ready",
    pill: "bg-emerald-50 text-emerald-700",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  completed: {
    label: "Completed",
    pill: "bg-slate-100 text-slate-600",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
};

function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={onToggle}
      className={`relative h-7 w-12 rounded-full transition-colors ${enabled ? "bg-[#00736D]" : "bg-slate-300"}`}
    >
      <motion.span
        animate={{ x: enabled ? 22 : 2 }}
        transition={{ type: "spring", damping: 18, stiffness: 420 }}
        className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-md"
      />
    </motion.button>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <Card className="border-[#80B9B6]/20 bg-white/90 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#80B9B6]">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black text-[#002E2C]">{value}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">{hint}</p>
        </div>
        <div className={`rounded-2xl p-3 ${accent}`}>{icon}</div>
      </div>
    </Card>
  );
}

function OrderCard({
  order,
  onOpen,
}: {
  order: VendorDashboardData["orders"][number];
  onOpen: () => void;
}) {
  const tone = STATUS_TONES[order.status] ?? STATUS_TONES.pending;

  return (
    <div className="rounded-2xl border border-[#80B9B6]/15 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-black text-[#002E2C]">
              {order.student_name}
            </p>
            <span className="rounded-full bg-[#E6F1F0] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#00736D]">
              {order.student_id}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-slate-500">
            {order.file_name} · {order.location}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${tone.pill}`}
            >
              {tone.icon}
              {tone.label}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              {new Date(order.created_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="rounded-2xl bg-[#F2F8F7] px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#80B9B6]">
              Revenue
            </p>
            <p className="text-sm font-black text-[#002E2C]">
              {formatPeso(Number(order.total_amount || 0))}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onOpen}
            className="h-8 rounded-xl border-[#80B9B6]/30 text-xs"
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ShopHome() {
  const navigate = useNavigate();
  const { user, accessToken, signOut } = useAuth();
  const [dashboard, setDashboard] = useState<VendorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [offlineOnly, setOfflineOnly] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!user?.id || !accessToken) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchVendorDashboardData(accessToken, user.id);
        if (active) {
          setDashboard(result);
        }
      } catch (err) {
        console.error("Vendor dashboard load failed:", err);
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load vendor dashboard",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [accessToken, user?.id]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleMockUpgrade = () => {
    setCheckoutLoading(true);
    setTimeout(() => {
      setCheckoutLoading(false);
      toast.message("Mock checkout opened", {
        description:
          "Connect this CTA to your billing provider and update profiles.subscription_tier to premium on success.",
      });
    }, 700);
  };

  const shop = dashboard?.shop ?? null;
  const metrics = dashboard?.metrics;
  const latestOrder = dashboard?.orders[0];
  const subscriptionTier =
    dashboard?.profile?.subscription_tier ?? shop?.tier ?? "standard";
  const isPremium = subscriptionTier === "premium";

  const revenueLabel = useMemo(
    () => formatPeso(metrics?.revenue ?? 0),
    [metrics?.revenue],
  );

  if (loading) {
    return <PageLoader label="Loading vendor dashboard…" />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#F8FCFC] via-white to-[#E6F1F0] p-6 text-center">
        <p className="max-w-md text-sm font-medium text-[#002E2C]">{error}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
          <Button variant="outline" onClick={() => navigate("/shop/register")}>
            Register shop
          </Button>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FCFC] via-white to-[#E6F1F0] px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-[#80B9B6]/20 bg-white/90 p-8 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#E6F1F0] p-3 text-[#00736D]">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#002E2C]">
                Vendor dashboard
              </h1>
              <p className="text-sm text-slate-500">
                No shop is linked to your vendor account yet.
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-3xl bg-[#F2F8F7] p-5">
            <p className="text-sm font-semibold text-[#002E2C]">
              Create your live shop record
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Register a partner shop so orders, revenue, and premium AI
              controls stream from Supabase.
            </p>
            <Button className="mt-4" onClick={() => navigate("/shop/register")}>
              Register shop
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E6F1F0]/60 via-white to-[#F8FAFA] pb-10">
      <div className="sticky top-0 z-40 border-b border-[#80B9B6]/20 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-3.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/shop/profile")}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00736D] to-[#002E2C] shadow-lg shadow-[#00736D]/25"
            >
              <Store className="h-5 w-5 text-white" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#80B9B6]">
                Vendor dashboard
              </p>
              <h1 className="truncate text-lg font-black leading-tight text-[#002E2C]">
                {shop.shop_name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F1F0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#00736D]">
                  {shop.online ? "Online" : "Offline"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#002E2C] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  <Sparkles className="h-3 w-3" />
                  {isPremium ? "Premium" : "Standard"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => navigate("/shop/analytics")}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F1F0]"
              >
                <TrendingUp className="h-4 w-4 text-[#00736D]" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/shop/notifications")}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F1F0]"
              >
                <Bell className="h-4 w-4 text-[#00736D]" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F1F0]"
              >
                <LogOut className="h-4 w-4 text-[#80B9B6]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-4 pt-5">
        <Card className="overflow-hidden border-[#80B9B6]/20 bg-[#002E2C] p-5 text-white shadow-xl shadow-[#002E2C]/20">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Activity className="h-5 w-5 text-[#80B9B6]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#80B9B6]">
                Live operations
              </p>
              <h2 className="mt-1 text-lg font-black">
                Real-time vendor control center
              </h2>
              <p className="mt-2 text-sm text-white/75">
                The dashboard reads live data from Supabase by your
                authenticated vendor account. No dummy metrics remain.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Pending orders"
            value={String(metrics?.pendingOrders ?? 0)}
            hint="Awaiting verification or production"
            icon={<Clock className="h-5 w-5 text-amber-700" />}
            accent="bg-amber-50"
          />
          <MetricCard
            label="Completed prints"
            value={String(metrics?.completedPrints ?? 0)}
            hint="Marked completed in Supabase"
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-700" />}
            accent="bg-emerald-50"
          />
          <MetricCard
            label="Revenue"
            value={revenueLabel}
            hint="Sum of live orders tied to this shop"
            icon={<TrendingUp className="h-5 w-5 text-[#00736D]" />}
            accent="bg-[#E6F1F0]"
          />
          <MetricCard
            label="Active orders"
            value={String(metrics?.activeOrders ?? 0)}
            hint="In progress or ready for pickup"
            icon={<Package className="h-5 w-5 text-slate-700" />}
            accent="bg-slate-100"
          />
        </div>

        <Card className="border-[#80B9B6]/20 bg-white/90 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#80B9B6]">
                Subscription
              </p>
              <h2 className="mt-1 text-xl font-black text-[#002E2C]">
                {isPremium
                  ? "Premium subscription active"
                  : "Standard map listing"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                {isPremium
                  ? "Premium unlocks the ultra-low latency Groq AI auto-reply bot for offline student reservations, plus live vendor controls."
                  : "Standard vendors get a basic map listing. Upgrade to unlock the ultra-low latency Groq AI auto-reply bot for offline reservations."}
              </p>
            </div>
            <div className="rounded-2xl bg-[#F2F8F7] px-3 py-2 text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#80B9B6]">
                Tier
              </p>
              <p className="text-sm font-black capitalize text-[#002E2C]">
                {subscriptionTier}
              </p>
            </div>
          </div>

          {!isPremium ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-3xl border border-dashed border-[#80B9B6]/35 bg-[#F8FCFC] p-5">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#00736D]" />
                  <p className="text-sm font-black text-[#002E2C]">
                    Upgrade to Premium
                  </p>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>• Basic map listing remains visible to students.</li>
                  <li>
                    • Premium adds Groq-powered auto-replies for offline
                    reservations.
                  </li>
                  <li>
                    • AI reservations sync against your live shop record in
                    Supabase.
                  </li>
                </ul>
              </div>
              <div className="rounded-3xl bg-[#002E2C] p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-[#80B9B6]">
                  Mock checkout
                </p>
                <p className="mt-2 text-lg font-black">
                  Activate premium instantly in the demo flow
                </p>
                <p className="mt-2 text-sm text-white/70">
                  Connect this button to your billing provider later. For now it
                  only simulates the activation path.
                </p>
                <Button
                  className="mt-4 w-full bg-white text-[#002E2C] hover:bg-white/90"
                  onClick={handleMockUpgrade}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Upgrade to Premium
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
              <div className="rounded-3xl bg-gradient-to-br from-[#E6F1F0] to-white p-5 ring-1 ring-[#80B9B6]/20">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-[#00736D]" />
                  <p className="text-sm font-black text-[#002E2C]">
                    Ultra-Low Latency Groq AI Auto-Reply Bot
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  The backend checks your `print_shops` row before allowing Groq
                  responses.
                </p>
                <div className="mt-4 space-y-3 rounded-2xl bg-white/80 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#002E2C]">
                        Auto-reply bot
                      </p>
                      <p className="text-xs text-slate-500">
                        Enable or disable student reservation replies
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={autoReplyEnabled}
                      onToggle={() => setAutoReplyEnabled((value) => !value)}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#002E2C]">
                        Offline only
                      </p>
                      <p className="text-xs text-slate-500">
                        Restrict the bot to away-mode reservations
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={offlineOnly}
                      onToggle={() => setOfflineOnly((value) => !value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-[#F2F8F7] px-3 py-2 text-xs font-semibold text-[#00736D]">
                    <Sparkles className="h-4 w-4" />
                    Groq model: llama3-8b-8192
                  </div>
                </div>
              </div>
              <div className="rounded-3xl bg-[#002E2C] p-5 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-[#80B9B6]">
                  AI configuration
                </p>
                <div className="mt-4 space-y-3 text-sm text-white/75">
                  <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2">
                    <Settings className="h-4 w-4 text-[#80B9B6]" />
                    Premium settings are unlocked for this shop only.
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2">
                    <MapPin className="h-4 w-4 text-[#80B9B6]" />
                    Basic map listing remains active for discovery.
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2">
                    <Shield className="h-4 w-4 text-[#80B9B6]" />
                    Live access is checked against Supabase before every AI
                    reply.
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className="border-[#80B9B6]/20 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#80B9B6]">
                  Recent orders
                </p>
                <h3 className="mt-1 text-xl font-black text-[#002E2C]">
                  Live queue from Supabase
                </h3>
              </div>
              <Button
                variant="ghost"
                className="text-[#00736D]"
                onClick={() => navigate("/shop/analytics")}
              >
                Open analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="mt-5 space-y-3">
              {dashboard?.orders.length ? (
                dashboard.orders
                  .slice(0, 6)
                  .map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onOpen={() =>
                        navigate(`/shop/order/${encodeURIComponent(order.id)}`)
                      }
                    />
                  ))
              ) : (
                <div className="rounded-3xl border border-dashed border-[#80B9B6]/30 bg-[#F8FCFC] p-8 text-center">
                  <p className="text-sm font-semibold text-[#002E2C]">
                    No live orders yet.
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Once students place orders, they will appear here
                    automatically.
                  </p>
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="border-[#80B9B6]/20 bg-white/90 p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-[#80B9B6]">
                Live snapshot
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-2xl bg-[#F8FCFC] px-4 py-3">
                  <span>Last updated</span>
                  <span className="font-bold text-[#002E2C]">
                    {latestOrder
                      ? new Date(latestOrder.created_at).toLocaleString()
                      : "No orders"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-[#F8FCFC] px-4 py-3">
                  <span>Total orders</span>
                  <span className="font-bold text-[#002E2C]">
                    {metrics?.totalOrders ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-[#F8FCFC] px-4 py-3">
                  <span>Subscription</span>
                  <span className="font-bold capitalize text-[#002E2C]">
                    {subscriptionTier}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="border-[#80B9B6]/20 bg-gradient-to-br from-[#002E2C] to-[#00736D] p-6 text-white shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-[#80B9B6]">
                Quick action
              </p>
              <h3 className="mt-2 text-xl font-black">
                Open your analytics view
              </h3>
              <p className="mt-2 text-sm text-white/75">
                Review revenue, top customers, and daily trends pulled directly
                from Supabase.
              </p>
              <Button
                className="mt-4 w-full bg-white text-[#002E2C] hover:bg-white/90"
                onClick={() => navigate("/shop/analytics")}
              >
                View analytics
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
