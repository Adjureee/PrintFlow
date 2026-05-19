import { projectId } from "../../../utils/supabase/info";
import { supabase } from "./supabase-client";
import {
  orderStore,
  type Order,
  type OrderStatus,
  type PrintSettings,
} from "./store";

const FUNCTIONS_BASE = `https://${projectId}.supabase.co/functions/v1/server`;

export type OrderFetchState =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "not_found";

export interface OrderRow {
  id: string;
  student_name: string;
  student_id: string;
  file_name: string;
  file_url: string | null;
  cloudinary_public_id: string | null;
  location: string;
  shop_id?: string | null;
  settings: PrintSettings;
  gcash_ref_number: string;
  total_amount: number;
  status: OrderStatus;
  claim_code: string;
  created_at: string;
  user_id?: string | null;
}

function mapRowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    studentName: row.student_name,
    studentId: row.student_id,
    fileName: row.file_name,
    fileUrl: row.file_url ?? "",
    location: row.location,
    settings: row.settings,
    gcashRefNumber: row.gcash_ref_number,
    totalAmount: Number(row.total_amount),
    status: row.status,
    createdAt: new Date(row.created_at),
    claimCode: row.claim_code,
  };
}

/** Direct Supabase query (requires `orders` table + RLS). */
async function fetchOrderFromTable(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapRowToOrder(data as OrderRow);
}

/** Edge function fallback when table/RLS unavailable. */
async function fetchOrderViaFunction(
  accessToken: string,
  orderId: string,
): Promise<Order | null> {
  const response = await fetch(
    `${FUNCTIONS_BASE}/orders/${encodeURIComponent(orderId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const payload = (await response.json()) as {
    order?: OrderRow;
    error?: string;
  };

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load order");
  }

  return payload.order ? mapRowToOrder(payload.order) : null;
}

export async function fetchOrderById(
  orderId: string,
  accessToken?: string | null,
): Promise<Order | null> {
  const trimmedId = orderId.trim();
  if (!trimmedId) {
    return null;
  }

  try {
    const fromDb = await fetchOrderFromTable(trimmedId);
    if (fromDb) {
      return fromDb;
    }
  } catch (err) {
    console.warn("Supabase orders table fetch failed, trying API:", err);
  }

  if (accessToken) {
    try {
      const fromApi = await fetchOrderViaFunction(accessToken, trimmedId);
      if (fromApi) {
        return fromApi;
      }
    } catch (err) {
      console.warn("Orders edge function fetch failed, using mock store:", err);
    }
  }

  return orderStore.getOrderById(trimmedId) ?? null;
}

export interface CreateOrderInput {
  studentName: string;
  studentId: string;
  fileName: string;
  fileUrl: string;
  cloudinaryPublicId?: string;
  location: string;
  shopId?: string | null;
  settings: PrintSettings;
  gcashRefNumber: string;
  totalAmount: number;
  userId?: string;
}

export async function createOrder(
  input: CreateOrderInput,
  accessToken?: string | null,
): Promise<Order> {
  const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const claimCode = `CLAIM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const row: OrderRow = {
    id,
    student_name: input.studentName,
    student_id: input.studentId,
    file_name: input.fileName,
    file_url: input.fileUrl,
    cloudinary_public_id: input.cloudinaryPublicId ?? null,
    location: input.location,
    shop_id: input.shopId ?? null,
    settings: input.settings,
    gcash_ref_number: input.gcashRefNumber,
    total_amount: input.totalAmount,
    status: "awaiting-verification",
    claim_code: claimCode,
    created_at: new Date().toISOString(),
    user_id: input.userId ?? null,
  };

  try {
    const { data, error } = await supabase
      .from("orders")
      .insert(row)
      .select()
      .single();

    if (!error && data) {
      return mapRowToOrder(data as OrderRow);
    }
  } catch (err) {
    console.warn("Supabase insert failed, trying edge function:", err);
  }

  if (accessToken) {
    try {
      const response = await fetch(`${FUNCTIONS_BASE}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ order: row }),
      });

      const payload = (await response.json()) as {
        order?: OrderRow;
        error?: string;
      };

      if (response.ok && payload.order) {
        return mapRowToOrder(payload.order);
      }
    } catch (err) {
      console.warn("Orders edge function create failed:", err);
    }
  }

  return orderStore.createOrder({
    studentName: input.studentName,
    studentId: input.studentId,
    fileName: input.fileName,
    fileUrl: input.fileUrl,
    location: input.location,
    shopId: input.shopId ?? null,
    settings: input.settings,
    gcashRefNumber: input.gcashRefNumber,
    totalAmount: input.totalAmount,
    status: "awaiting-verification",
  });
}
