import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

export const DNSC_CENTER = { lat: 7.3015, lng: 125.6833 } as const;

export type AppRole = "student" | "vendor" | "superadmin";
export type ShopApprovalStatus = "pending" | "verified" | "suspended";
export type ShopTier = "standard" | "premium";

export interface PrintShop {
  id: string;
  ownerId?: string;
  slug: string;
  name: string;
  initials: string;
  address: string;
  description: string;
  waitTime: number;
  status: "online" | "offline";
  approvalStatus: ShopApprovalStatus;
  lat: number;
  lng: number;
  isFlagship?: boolean;
  hours: string;
  services: string[];
  tier: ShopTier;
  email?: string;
  phone?: string;
}

export interface PrintShopRecord {
  id: string;
  owner_id: string | null;
  shop_name: string;
  slug: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  wait_time: number | null;
  online: boolean | null;
  status: ShopApprovalStatus | null;
  tier: ShopTier | null;
  hours: string | null;
  services: string[] | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
}

const supabaseUrl = `https://${projectId}.supabase.co`;
const publicClient = createClient(supabaseUrl, publicAnonKey);

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function toInitials(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "PF";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "P").join("");
}

export function normalizePrintShop(record: PrintShopRecord): PrintShop {
  const name = record.shop_name.trim();
  const latitude = Number(record.latitude ?? DNSC_CENTER.lat);
  const longitude = Number(record.longitude ?? DNSC_CENTER.lng);
  const waitTime = Number(record.wait_time ?? 15);
  const approvalStatus = record.status ?? "pending";
  const tier = record.tier ?? "standard";
  const online = Boolean(record.online) && approvalStatus === "verified";

  return {
    id: record.id,
    ownerId: record.owner_id ?? undefined,
    slug: record.slug || slugify(name),
    name,
    initials: toInitials(name),
    address: record.address ?? "Address pending",
    description:
      record.description ?? "Verified print partner on the PrintFlow network.",
    waitTime,
    status: online ? "online" : "offline",
    approvalStatus,
    lat: Number.isFinite(latitude) ? latitude : DNSC_CENTER.lat,
    lng: Number.isFinite(longitude) ? longitude : DNSC_CENTER.lng,
    hours: record.hours ?? "Hours pending",
    services: record.services ?? [],
    tier,
    email: record.email ?? undefined,
    phone: record.phone ?? undefined,
  };
}

export function toPrintLocation(shop: PrintShop) {
  return {
    id: shop.id,
    name: shop.name,
    waitTime: shop.waitTime,
    status: shop.status,
    lat: shop.lat,
    lng: shop.lng,
  };
}

export function buildShopSlug(shopName: string) {
  return slugify(shopName);
}

export async function fetchPublicPrintShops() {
  try {
    const { data, error } = await publicClient
      .from("print_shops")
      .select(
        "id, owner_id, shop_name, slug, description, address, latitude, longitude, wait_time, online, status, tier, hours, services, email, phone, created_at",
      )
      .eq("status", "verified")
      .eq("online", true)
      .order("tier", { ascending: false })
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error("fetchPublicPrintShops failed:", {
        message: error?.message,
        details: error?.details,
      });
      return [] as PrintShop[];
    }

    return data.map((record) => normalizePrintShop(record as PrintShopRecord));
  } catch (error) {
    console.error("fetchPublicPrintShops threw:", {
      message: error instanceof Error ? error.message : String(error),
      details:
        error instanceof Error
          ? (error as Error & { details?: string }).details
          : undefined,
    });
    return [] as PrintShop[];
  }
}

export async function fetchPublicPrintShopBySlug(slug: string) {
  if (!slug.trim()) {
    return undefined;
  }

  const { data, error } = await publicClient
    .from("print_shops")
    .select(
      "id, owner_id, shop_name, slug, description, address, latitude, longitude, wait_time, online, status, tier, hours, services, email, phone, created_at",
    )
    .eq("slug", slug)
    .eq("status", "verified")
    .eq("online", true)
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  return normalizePrintShop(data as PrintShopRecord);
}

export async function fetchMyPrintShop(accessToken: string) {
  const client = createClient(supabaseUrl, publicAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const {
    data: { user },
  } = await client.auth.getUser(accessToken);

  if (!user) {
    return undefined;
  }

  const { data, error } = await client
    .from("print_shops")
    .select(
      "id, owner_id, shop_name, slug, description, address, latitude, longitude, wait_time, online, status, tier, hours, services, email, phone, created_at",
    )
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  return normalizePrintShop(data as PrintShopRecord);
}
