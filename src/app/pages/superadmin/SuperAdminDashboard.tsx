import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Crown,
  Loader2,
  Shield,
  Slash,
  Trash2,
  Users,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../lib/auth-context";
import {
  fetchVendorDirectory,
  updateVendorStatus,
  type VendorDirectoryRow,
} from "../../lib/platform-api";

function StatusPill({
  value,
}: {
  value: VendorDirectoryRow["approvalStatus"];
}) {
  const classes = {
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    suspended: "bg-rose-50 text-rose-700 border-rose-200",
  } as const;

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[11px] font-bold ${classes[value]}`}
    >
      {value}
    </span>
  );
}

export default function SuperAdminDashboard() {
  const { user, accessToken, loading } = useAuth();
  const [vendors, setVendors] = useState<VendorDirectoryRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState(true);

  useEffect(() => {
    if (!accessToken || user?.role !== "superadmin") {
      return;
    }

    void fetchVendorDirectory(accessToken)
      .then((result) => setVendors(result.vendors))
      .catch((error) =>
        toast.error(
          error instanceof Error ? error.message : "Failed to load vendors",
        ),
      )
      .finally(() => setLoadingState(false));
  }, [accessToken, user?.role]);

  const stats = useMemo(() => {
    return {
      total: vendors.length,
      verified: vendors.filter((vendor) => vendor.approvalStatus === "verified")
        .length,
      suspended: vendors.filter(
        (vendor) => vendor.approvalStatus === "suspended",
      ).length,
      premium: vendors.filter((vendor) => vendor.tier === "premium").length,
    };
  }, [vendors]);

  if (loading) {
    return <div className="min-h-screen bg-white" />;
  }

  if (!user || user.role !== "superadmin") {
    return <Navigate to="/" replace />;
  }

  const mutateVendor = async (
    vendorId: string,
    action: "approve" | "suspend" | "delete",
  ) => {
    if (!accessToken) {
      return;
    }

    setBusyId(vendorId);
    try {
      await updateVendorStatus(accessToken, vendorId, action);
      toast.success(`Vendor ${action}d successfully`);
      const result = await fetchVendorDirectory(accessToken);
      setVendors(result.vendors);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Vendor action failed",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7FBFB] via-white to-[#E6F1F0]/60">
      <div className="sticky top-0 z-40 border-b border-[#80B9B6]/20 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00736D] to-[#002E2C] shadow-lg shadow-[#00736D]/20">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#80B9B6]">
                Super Admin Console
              </p>
              <h1 className="text-xl font-black text-[#002E2C]">
                Vendor quality control
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Registered", value: stats.total, icon: Users },
            { label: "Verified", value: stats.verified, icon: CheckCircle2 },
            { label: "Premium", value: stats.premium, icon: Shield },
            { label: "Suspended", value: stats.suspended, icon: Slash },
          ].map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-[#80B9B6]/20 bg-white/90 p-5 shadow-lg shadow-[#00736D]/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#80B9B6]">
                        {card.label}
                      </p>
                      <p className="mt-2 text-3xl font-black text-[#002E2C]">
                        {card.value}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E6F1F0] text-[#00736D]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card className="border-[#80B9B6]/20 bg-white/90 p-5 shadow-xl shadow-[#00736D]/10">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#00736D]" />
            <div>
              <h2 className="text-base font-black text-[#002E2C]">
                Registered print owners
              </h2>
              <p className="text-xs text-[#80B9B6]">
                Approve, suspend, or delete vendor accounts from one place.
              </p>
            </div>
          </div>

          {loadingState ? (
            <div className="flex items-center gap-2 px-3 py-8 text-sm text-[#80B9B6]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading vendors...
            </div>
          ) : vendors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#80B9B6]/30 bg-[#F7FBFB] px-4 py-8 text-center text-sm text-[#80B9B6]">
              No vendor accounts have been registered yet.
            </div>
          ) : (
            <div className="space-y-3">
              {vendors.map((vendor) => (
                <div
                  key={vendor.userId}
                  className="rounded-3xl border border-[#80B9B6]/20 bg-white px-4 py-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-black text-[#002E2C]">
                          {vendor.shopName}
                        </h3>
                        <StatusPill value={vendor.approvalStatus} />
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-bold ${vendor.tier === "premium" ? "bg-[#002E2C] text-white" : "bg-[#E6F1F0] text-[#00736D]"}`}
                        >
                          {vendor.tier}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-bold ${vendor.online ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                        >
                          {vendor.online ? "Online" : "Offline"}
                        </span>
                      </div>
                      <p className="text-xs text-[#80B9B6]">
                        {vendor.name} · {vendor.email}
                      </p>
                      <p className="text-xs text-[#80B9B6]">
                        {vendor.latitude?.toFixed(6) ?? "n/a"},{" "}
                        {vendor.longitude?.toFixed(6) ?? "n/a"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        onClick={() =>
                          void mutateVendor(vendor.userId, "approve")
                        }
                        disabled={busyId === vendor.userId}
                        className="gap-2 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          void mutateVendor(vendor.userId, "suspend")
                        }
                        disabled={busyId === vendor.userId}
                        className="gap-2 rounded-2xl border-amber-200 text-amber-700 hover:bg-amber-50"
                      >
                        <Slash className="h-4 w-4" /> Suspend
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() =>
                          void mutateVendor(vendor.userId, "delete")
                        }
                        disabled={busyId === vendor.userId}
                        className="gap-2 rounded-2xl"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
