import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

const supabaseUrl = `https://${projectId}.supabase.co`;

export interface VendorProfileRow {
  id: string;
  name: string;
  role: "vendor" | "superadmin" | "student";
  subscription_tier?: "standard" | "premium" | null;
}

export interface VendorShopRow {
  id: string;
  owner_id: string;
  shop_name: string;
  slug: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  wait_time: number;
  online: boolean;
  status: "pending" | "verified" | "suspended";
  tier: "standard" | "premium";
  hours: string;
  services: string[];
  email: string | null;
  phone: string | null;
  created_at: string;
}

export interface VendorOrderRow {
  id: string;
  student_name: string;
  student_id: string;
  file_name: string;
  location: string;
  total_amount: number;
  status: string;
  created_at: string;
  shop_id?: string | null;
}

export interface VendorCustomerSummary {
  name: string;
  studentId: string;
  orders: number;
  spent: number;
}

export interface VendorDailySummary {
  label: string;
  orders: number;
  revenue: number;
}

export interface VendorMetrics {
  pendingOrders: number;
  completedPrints: number;
  revenue: number;
  totalOrders: number;
  averageOrderValue: number;
  activeOrders: number;
}

export interface VendorDashboardData {
  profile: VendorProfileRow | null;
  shop: VendorShopRow | null;
  orders: VendorOrderRow[];
  metrics: VendorMetrics;
  daily: VendorDailySummary[];
  topCustomers: VendorCustomerSummary[];
}

function createAuthedClient(accessToken: string) {
  return createClient(supabaseUrl, publicAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

function toCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPeso(value: number) {
  return toCurrency(value).replace(/^PHP\s?/, "₱");
}

export async function fetchVendorProfile(accessToken: string, userId: string) {
  const client = createAuthedClient(accessToken);
  const { data, error } = await client
    .from("profiles")
    .select("id, name, role, subscription_tier")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("Vendor profile fetch failed:", error);
    return null;
  }

  return (data as VendorProfileRow | null) ?? null;
}

export async function fetchVendorShop(accessToken: string, userId: string) {
  const client = createAuthedClient(accessToken);
  const { data, error } = await client
    .from("print_shops")
    .select(
      "id, owner_id, shop_name, slug, description, address, latitude, longitude, wait_time, online, status, tier, hours, services, email, phone, created_at",
    )
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("Vendor shop fetch failed:", error);
    return null;
  }

  return data as VendorShopRow | null;
}

async function fetchOrdersByShopId(
  client: ReturnType<typeof createAuthedClient>,
  shopId: string,
) {
  return client
    .from("orders")
    .select(
      "id, student_name, student_id, file_name, location, total_amount, status, created_at, shop_id",
    )
    .eq("shop_id", shopId)
    .order("created_at", { ascending: false });
}

async function fetchOrdersByLocation(
  client: ReturnType<typeof createAuthedClient>,
  shopName: string,
) {
  return client
    .from("orders")
    .select(
      "id, student_name, student_id, file_name, location, total_amount, status, created_at, shop_id",
    )
    .eq("location", shopName)
    .order("created_at", { ascending: false });
}

export async function fetchVendorOrders(
  accessToken: string,
  shop: VendorShopRow,
) {
  const client = createAuthedClient(accessToken);

  const byShopId = await fetchOrdersByShopId(client, shop.id);
  if (!byShopId.error && (byShopId.data?.length ?? 0) > 0) {
    return (byShopId.data ?? []) as VendorOrderRow[];
  }

  const shopIdError = byShopId.error?.message ?? "";
  const shouldFallback = /shop_id|column|does not exist/i.test(shopIdError);
  if (byShopId.error && !shouldFallback) {
    throw new Error(shopIdError || "Failed to load vendor orders");
  }

  const byLocation = await fetchOrdersByLocation(client, shop.shop_name);
  if (byLocation.error) {
    throw new Error(byLocation.error.message);
  }

  return (byLocation.data ?? []) as VendorOrderRow[];
}

function normalizeStatus(status: string) {
  const lowered = status.toLowerCase();

  if (lowered === "awaiting-verification" || lowered === "pending") {
    return "pending";
  }

  if (lowered === "completed") {
    return "completed";
  }

  if (lowered === "printing" || lowered === "processing") {
    return "processing";
  }

  if (lowered === "ready") {
    return "ready";
  }

  return lowered;
}

export function buildVendorMetrics(orders: VendorOrderRow[]): VendorMetrics {
  const totalOrders = orders.length;
  const revenue = orders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0,
  );
  const completedPrints = orders.filter(
    (order) => normalizeStatus(order.status) === "completed",
  ).length;
  const pendingOrders = orders.filter((order) => {
    const status = normalizeStatus(order.status);
    return status === "pending" || status === "processing";
  }).length;
  const activeOrders = orders.filter((order) => {
    const status = normalizeStatus(order.status);
    return (
      status === "pending" || status === "processing" || status === "ready"
    );
  }).length;

  return {
    pendingOrders,
    completedPrints,
    revenue,
    totalOrders,
    averageOrderValue: totalOrders > 0 ? revenue / totalOrders : 0,
    activeOrders,
  };
}

export function buildVendorDailySummary(orders: VendorOrderRow[], days = 7) {
  const buckets = Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - index));
    const key = date.toISOString().slice(0, 10);

    return {
      key,
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      orders: 0,
      revenue: 0,
    };
  });

  for (const order of orders) {
    const key = new Date(order.created_at).toISOString().slice(0, 10);
    const bucket = buckets.find((entry) => entry.key === key);
    if (!bucket) {
      continue;
    }

    bucket.orders += 1;
    bucket.revenue += Number(order.total_amount || 0);
  }

  return buckets.map(({ key: _key, ...entry }) => entry);
}

export function buildTopCustomers(orders: VendorOrderRow[]) {
  const map = new Map<string, VendorCustomerSummary>();

  for (const order of orders) {
    const key = `${order.student_id}:${order.student_name}`;
    const existing = map.get(key);
    const spent = Number(order.total_amount || 0);

    if (existing) {
      existing.orders += 1;
      existing.spent += spent;
      continue;
    }

    map.set(key, {
      name: order.student_name,
      studentId: order.student_id,
      orders: 1,
      spent,
    });
  }

  return [...map.values()].sort((a, b) => b.spent - a.spent).slice(0, 5);
}

export async function fetchVendorDashboardData(
  accessToken: string,
  userId: string,
): Promise<VendorDashboardData> {
  const [profile, shop] = await Promise.all([
    fetchVendorProfile(accessToken, userId),
    fetchVendorShop(accessToken, userId),
  ]);

  if (!shop) {
    return {
      profile,
      shop: null,
      orders: [],
      metrics: {
        pendingOrders: 0,
        completedPrints: 0,
        revenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        activeOrders: 0,
      },
      daily: [],
      topCustomers: [],
    };
  }

  const orders = await fetchVendorOrders(accessToken, shop);
  const metrics = buildVendorMetrics(orders);
  const daily = buildVendorDailySummary(orders, 7);
  const topCustomers = buildTopCustomers(orders);

  return {
    profile,
    shop,
    orders,
    metrics,
    daily,
    topCustomers,
  };
}
