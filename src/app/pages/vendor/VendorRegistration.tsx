import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Sparkles,
  Store,
  Upload,
  Wand2,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { DNSC_CENTER, type PrintShop } from "../../lib/print-shops";
import { fetchMyPrintShop } from "../../lib/print-shops";
import { registerVendorShop } from "../../lib/platform-api";
import { useAuth } from "../../lib/auth-context";

const DEFAULT_SERVICES = "B&W Print, Color Print, Binding";

function pickInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "P")
    .join("");
}

function MapClickPicker({
  value,
  onPick,
}: {
  value: { lat: number; lng: number };
  onPick: (coords: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return (
    <Marker
      position={[value.lat, value.lng]}
      icon={L.divIcon({
        className: "custom-div-icon",
        html: `
          <div class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#00736D] shadow-lg shadow-[#00736D]/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 21s6-5.33 6-11a6 6 0 0 0-12 0c0 5.67 6 11 6 11z"></path>
              <circle cx="12" cy="10" r="2.5"></circle>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      })}
    />
  );
}

export default function VendorRegistration() {
  const navigate = useNavigate();
  const { user, accessToken, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [currentShop, setCurrentShop] = useState<PrintShop | undefined>();
  const [coordinates, setCoordinates] = useState({
    lat: DNSC_CENTER.lat,
    lng: DNSC_CENTER.lng,
  });
  const [form, setForm] = useState({
    shopName: "",
    description: "",
    address: "",
    hours: "Mon–Sat · 8:00 AM – 6:00 PM",
    phone: "",
    services: DEFAULT_SERVICES,
    tier: "standard" as "standard" | "premium",
  });

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    void fetchMyPrintShop(accessToken).then((shop) => {
      if (!shop) {
        return;
      }

      setCurrentShop(shop);
      setCoordinates({ lat: shop.lat, lng: shop.lng });
      setForm({
        shopName: shop.name,
        description: shop.description,
        address: shop.address,
        hours: shop.hours,
        phone: shop.phone ?? "",
        services: shop.services.join(", "),
        tier: shop.tier,
      });
    });
  }, [accessToken]);

  const selectedDisplay = useMemo(
    () => `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`,
    [coordinates.lat, coordinates.lng],
  );

  if (loading) {
    return <div className="min-h-screen bg-white" />;
  }

  if (!user || user.role !== "vendor") {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!accessToken) {
      toast.error("Please sign in again to continue.");
      return;
    }

    if (!form.shopName.trim() || !form.address.trim()) {
      toast.error("Shop name and address are required.");
      return;
    }

    const services = form.services
      .split(",")
      .map((service) => service.trim())
      .filter(Boolean);

    const latitude = Number(coordinates.lat);
    const longitude = Number(coordinates.lng);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      toast.error("Please choose a valid shop location on the map.");
      return;
    }

    setSaving(true);
    try {
      await registerVendorShop(accessToken, {
        shopName: form.shopName.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        latitude,
        longitude,
        hours: form.hours.trim(),
        services,
        phone: form.phone.trim() || undefined,
        tier: form.tier,
        isOnline: false,
      });

      toast.success("Vendor profile saved. Awaiting review.");
      navigate("/shop");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save vendor profile",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7FBFB] via-white to-[#E6F1F0]/50 pb-10">
      <div className="sticky top-0 z-40 border-b border-[#80B9B6]/20 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate("/shop")}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F1F0]"
          >
            <ArrowLeft className="h-4.5 w-4.5 text-[#00736D]" />
          </motion.button>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#80B9B6]">
              Print Shop Partner Registration
            </p>
            <h1 className="text-lg font-black text-[#002E2C]">
              Claim your vendor profile
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-[#80B9B6]/20 bg-white/90 shadow-xl shadow-[#00736D]/10">
          <div className="border-b border-[#80B9B6]/15 bg-gradient-to-r from-[#E6F1F0] to-white px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-black text-[#002E2C]">
              <MapPin className="h-4 w-4 text-[#00736D]" />
              Drop a pin on your exact shop location
            </div>
            <p className="mt-1 text-xs text-[#00736D]">
              Click the map to save latitude and longitude directly into
              Supabase.
            </p>
          </div>

          <div className="h-[420px]">
            <MapContainer
              center={[coordinates.lat, coordinates.lng]}
              zoom={16}
              style={{ width: "100%", height: "100%" }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickPicker value={coordinates} onPick={setCoordinates} />
            </MapContainer>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[#80B9B6]/15 px-5 py-4 text-xs text-[#80B9B6]">
            <span>Selected location</span>
            <span className="font-mono text-[#002E2C]">{selectedDisplay}</span>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-[#80B9B6]/20 bg-[#002E2C] p-5 text-white shadow-xl shadow-[#002E2C]/25">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles className="h-5 w-5 text-[#80B9B6]" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#80B9B6]">
                  Premium Partner
                </p>
                <h2 className="text-lg font-black">Freemium monetization</h2>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/8 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#80B9B6]">
                  Standard
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Basic map listing, manual replies, and partner visibility.
                </p>
              </div>
              <div className="rounded-2xl bg-[#E6F1F0]/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white">
                  Premium
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Groq AI auto-reply, offline reservation support, and priority
                  placement.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-[#80B9B6]/20 bg-white/90 p-5 shadow-xl shadow-[#00736D]/10">
            <div className="mb-4 flex items-center gap-2 text-sm font-black text-[#002E2C]">
              <Store className="h-4 w-4 text-[#00736D]" />
              Partner details
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop name</Label>
                <Input
                  id="shopName"
                  name="shopName"
                  value={form.shopName}
                  onChange={handleChange}
                  placeholder="Your print shop name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Street, barangay, city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Shop description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Tell students what you print best"
                  className="min-h-[96px]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+63 ..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours</Label>
                  <Input
                    id="hours"
                    name="hours"
                    value={form.hours}
                    onChange={handleChange}
                    placeholder="Mon–Sat · 8:00 AM – 6:00 PM"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="services">Services</Label>
                <Input
                  id="services"
                  name="services"
                  value={form.services}
                  onChange={handleChange}
                  placeholder="Comma separated services"
                />
              </div>

              <div className="space-y-2">
                <Label>Plan</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      value: "standard",
                      title: "Standard",
                      description: "Map listing only",
                      accent: "border-slate-200",
                    },
                    {
                      value: "premium",
                      title: "Premium",
                      description: "Groq AI auto-reply",
                      accent: "border-[#00736D]",
                    },
                  ].map((plan) => (
                    <button
                      key={plan.value}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          tier: plan.value as "standard" | "premium",
                        }))
                      }
                      className={`rounded-2xl border px-4 py-4 text-left transition-all ${form.tier === plan.value ? `${plan.accent} bg-[#E6F1F0]/60 shadow-md` : "border-[#80B9B6]/20 bg-white hover:border-[#00736D]/30"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-black text-[#002E2C]">
                          {plan.title}
                        </p>
                        {form.tier === plan.value && (
                          <CheckCircle2 className="h-4 w-4 text-[#00736D]" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[#80B9B6]">
                        {plan.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-[#80B9B6]/30 bg-[#F7FBFB] p-4 text-xs text-[#00736D]">
                The selected map pin will be stored as latitude and longitude in
                your print_shops row.
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full gap-2 rounded-2xl bg-gradient-to-r from-[#00736D] to-[#002E2C] py-6 font-black text-white shadow-lg shadow-[#00736D]/30"
              >
                {saving ? (
                  <Upload className="h-4 w-4 animate-pulse" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {saving
                  ? "Saving partner profile..."
                  : currentShop
                    ? "Update partner profile"
                    : "Create partner profile"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
