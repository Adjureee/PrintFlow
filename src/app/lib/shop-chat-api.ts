import { projectId } from "../../../utils/supabase/info";

const FUNCTIONS_BASE = `https://${projectId}.supabase.co/functions/v1/server`;

export interface ShopChatMessage {
  role: "user" | "assistant";
  text: string;
}

export interface ShopChatContext {
  shopId: string;
  slug: string;
  name: string;
  status: "online" | "offline";
  tier: "standard" | "premium";
  address: string;
  hours: string;
  services: string[];
  waitTime: number;
}

export interface ShopChatReply {
  message: string;
  reservationConfirmed: boolean;
  pickupTime?: string | null;
  pickupDate?: string | null;
  fallback?: boolean;
}

export class ShopChatError extends Error {
  constructor(
    message: string,
    public status: number,
    public fallback = false,
  ) {
    super(message);
    this.name = "ShopChatError";
  }
}

export async function sendShopChatMessage(
  accessToken: string,
  shop: ShopChatContext,
  messages: ShopChatMessage[],
): Promise<ShopChatReply> {
  const response = await fetch(`${FUNCTIONS_BASE}/shop-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ shop, messages }),
  });

  const data = (await response.json()) as ShopChatReply & { error?: string };

  if (!response.ok) {
    throw new ShopChatError(
      data.error ?? "Failed to reach PrintFlow assistant",
      response.status,
      data.fallback === true || response.status === 503,
    );
  }

  return data;
}
