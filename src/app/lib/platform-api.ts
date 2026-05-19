import { projectId } from "../../../utils/supabase/info";

const FUNCTIONS_BASE = `https://${projectId}.supabase.co/functions/v1/server`;

export interface VendorRegistrationInput {
  shopName: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  hours: string;
  services: string[];
  phone?: string;
  tier: "standard" | "premium";
  isOnline?: boolean;
}

export interface VendorDirectoryRow {
  userId: string;
  email: string;
  name: string;
  role: "student" | "vendor" | "superadmin";
  shopName: string;
  shopSlug: string;
  approvalStatus: "pending" | "verified" | "suspended";
  online: boolean;
  tier: "standard" | "premium";
  latitude: number | null;
  longitude: number | null;
  hours: string | null;
  services: string[];
  phone?: string | null;
  createdAt: string;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function registerVendorShop(
  accessToken: string,
  payload: VendorRegistrationInput,
) {
  const response = await fetch(`${FUNCTIONS_BASE}/vendor/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return parseJsonResponse<{ success: true }>(response);
}

export async function fetchVendorDirectory(accessToken: string) {
  const response = await fetch(`${FUNCTIONS_BASE}/admin/vendors`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return parseJsonResponse<{ vendors: VendorDirectoryRow[] }>(response);
}

export async function updateVendorStatus(
  accessToken: string,
  vendorId: string,
  action: "approve" | "suspend" | "delete",
) {
  const response = await fetch(`${FUNCTIONS_BASE}/admin/vendors/${vendorId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ action }),
  });

  return parseJsonResponse<{ success: true }>(response);
}
