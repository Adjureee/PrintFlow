"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  BarChart3,
  Banknote,
  Calendar,
  Download,
  Package,
  PieChart,
  RefreshCw,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { PageLoader } from "../../components/ui/page-loader";
import { useAuth } from "../../lib/auth-context";
import {
  buildTopCustomers,
  buildVendorDailySummary,
  buildVendorMetrics,
  fetchVendorDashboardData,
  formatPeso,
  type VendorDashboardData,
} from "../../lib/vendor-dashboard";

type RangeKey = "7d" | "30d" | "90d";

function exportCsv(filename: string, rows: string[][]) {
  const content = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ShopAnalytics() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const [dashboard, setDashboard] = useState<VendorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<RangeKey>("7d");

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
        console.error("Vendor analytics load failed:", err);
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load analytics",
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

  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;

  const filteredOrders = useMemo(() => {
    const orders = dashboard?.orders ?? [];
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return orders.filter(
      (order) => new Date(order.created_at).getTime() >= cutoff,
    );
  }, [dashboard?.orders, days]);

  const metrics = useMemo(
    () => buildVendorMetrics(filteredOrders),
    [filteredOrders],
  );
  const daily = useMemo(
    () => buildVendorDailySummary(filteredOrders, Math.min(days, 14)),
    [filteredOrders, days],
  );
  const topCustomers = useMemo(
    () => buildTopCustomers(filteredOrders),
    [filteredOrders],
  );

  const handleExport = (kind: "orders" | "customers" | "daily") => {
    if (kind === "orders") {
      exportCsv("vendor_orders.csv", [
        [
          "Date",
          "Order ID",
          "Student",
          "Student ID",
          "File",
          "Location",
          "Amount",
          "Status",
        ],
        ...filteredOrders.map((order) => [
          new Date(order.created_at).toISOString().slice(0, 10),
          order.id,
          order.student_name,
          order.student_id,
          order.file_name,
          order.location,
          String(order.total_amount),
          order.status,
        ]),
      ]);
    }

    if (kind === "customers") {
      exportCsv("top_customers.csv", [
        ["Student", "Student ID", "Orders", "Spent"],
        ...topCustomers.map((student) => [
          student.name,
          student.studentId,
          String(student.orders),
          String(student.spent),
        ]),
      ]);
    }

    if (kind === "daily") {
      exportCsv("daily_summary.csv", [
        ["Date", "Orders", "Revenue"],
        ...daily.map((day) => [
          day.label,
          String(day.orders),
          String(day.revenue),
        ]),
      ]);
    }

    toast.success("CSV export downloaded");
  };

  if (loading) {
    return <PageLoader label="Loading analytics…" />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="max-w-md text-sm font-medium text-[#002E2C]">{error}</p>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F1F0] via-white to-[#E6F1F0]">
      <div className="sticky top-0 z-50 border-b border-[#80B9B6]/20 bg-white/75 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/shop")}
              className="gap-2 hover:bg-[#E6F1F0]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="bg-gradient-to-r from-[#00736D] to-[#002E2C] bg-clip-text text-2xl font-bold text-transparent">
                Analytics & Reports
              </h1>
              <p className="text-sm font-medium text-gray-600">
                Live vendor metrics pulled from Supabase
              </p>
            </div>
          </div>

          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as RangeKey)}
          >
            <SelectTrigger className="w-[180px] border-[#80B9B6]/30 focus:border-[#00736D]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-[#80B9B6]/20 bg-white/85 p-6">
              <p className="mb-2 text-sm font-semibold text-[#00736D]">
                Total Orders
              </p>
              <p className="text-4xl font-black text-[#002E2C]">
                {metrics.totalOrders}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Live filtered window
              </p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="border-[#80B9B6]/20 bg-white/85 p-6">
              <p className="mb-2 text-sm font-semibold text-emerald-700">
                Revenue
              </p>
              <p className="text-4xl font-black text-[#002E2C]">
                {formatPeso(metrics.revenue)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                From live Supabase orders
              </p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-[#80B9B6]/20 bg-white/85 p-6">
              <p className="mb-2 text-sm font-semibold text-[#00736D]">
                Avg order value
              </p>
              <p className="text-4xl font-black text-[#002E2C]">
                {formatPeso(metrics.averageOrderValue)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Per order in this range
              </p>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-[#80B9B6]/20 bg-white/85 p-6">
              <p className="mb-2 text-sm font-semibold text-violet-700">
                Completion rate
              </p>
              <p className="text-4xl font-black text-[#002E2C]">
                {metrics.totalOrders
                  ? Math.round(
                      (metrics.completedPrints / metrics.totalOrders) * 100,
                    )
                  : 0}
                %
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Completed orders only
              </p>
            </Card>
          </motion.div>
        </div>

        <Card className="border-[#80B9B6]/20 bg-white/85 p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#80B9B6]">
                Exports
              </p>
              <h2 className="text-xl font-black text-[#002E2C]">
                Download live reports
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => handleExport("orders")}>
                <Download className="mr-2 h-4 w-4" />
                Orders
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport("customers")}
              >
                <Download className="mr-2 h-4 w-4" />
                Customers
              </Button>
              <Button variant="outline" onClick={() => handleExport("daily")}>
                <Download className="mr-2 h-4 w-4" />
                Daily
              </Button>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            CSV exports are generated from the same Supabase-backed dataset that
            powers the dashboard.
          </p>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-[#80B9B6]/20 bg-white/85 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-[#E6F1F0] p-3 text-[#00736D]">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#002E2C]">
                  Daily revenue
                </h2>
                <p className="text-sm text-slate-500">
                  Orders and revenue over the selected range
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {daily.length ? (
                daily.map((day) => {
                  const maxRevenue = Math.max(
                    ...daily.map((entry) => entry.revenue),
                    1,
                  );
                  return (
                    <div
                      key={day.label}
                      className="rounded-2xl bg-[#F8FCFC] p-4"
                    >
                      <div className="flex items-center justify-between gap-3 text-sm font-semibold text-[#002E2C]">
                        <span>{day.label}</span>
                        <span>
                          {formatPeso(day.revenue)} · {day.orders} orders
                        </span>
                      </div>
                      <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#E6F1F0]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#00736D] to-[#002E2C]"
                          style={{
                            width: `${Math.max((day.revenue / maxRevenue) * 100, 8)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-3xl border border-dashed border-[#80B9B6]/30 bg-[#F8FCFC] p-8 text-center text-sm text-slate-500">
                  No orders in the selected range.
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="border-[#80B9B6]/20 bg-white/85 p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-[#E6F1F0] p-3 text-[#00736D]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#002E2C]">
                    Top customers
                  </h2>
                  <p className="text-sm text-slate-500">
                    Students with the highest spend
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {topCustomers.length ? (
                  topCustomers.map((student, index) => (
                    <div
                      key={`${student.studentId}-${student.name}`}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-[#F8FCFC] p-4"
                    >
                      <div>
                        <p className="font-bold text-[#002E2C]">
                          {index + 1}. {student.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {student.studentId} · {student.orders} orders
                        </p>
                      </div>
                      <p className="text-lg font-black text-emerald-600">
                        {formatPeso(student.spent)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-[#80B9B6]/30 bg-[#F8FCFC] p-8 text-center text-sm text-slate-500">
                    No customer data yet.
                  </div>
                )}
              </div>
            </Card>

            <Card className="border-[#80B9B6]/20 bg-white/85 p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-[#E6F1F0] p-3 text-[#00736D]">
                  <PieChart className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#002E2C]">
                    Highlights
                  </h2>
                  <p className="text-sm text-slate-500">
                    Fast view of this window
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-[#F8FCFC] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#80B9B6]">
                    Pending
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#002E2C]">
                    {metrics.pendingOrders}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F8FCFC] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#80B9B6]">
                    Completed
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#002E2C]">
                    {metrics.completedPrints}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
