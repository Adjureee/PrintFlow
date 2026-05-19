// @ts-nocheck

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import Groq from "npm:groq-sdk";
import * as kv from "./kv_store.ts";
const app = new Hono();

type AppRole = "student" | "vendor" | "superadmin";

function normalizeRoleInput(role: unknown): AppRole {
  if (role === "student" || role === "vendor" || role === "superadmin") {
    return role;
  }

  // Legacy compatibility for old role names used in earlier clients.
  if (role === "shop") {
    return "vendor";
  }

  if (role === "admin") {
    return "superadmin";
  }

  return "student";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") || "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
  );
}

async function getAuthorizedUser(
  c: Parameters<typeof app.use>[1] extends (...args: infer A) => any
    ? A[0]
    : never,
) {
  const accessToken = c.req.header("Authorization")?.split(" ")[1];

  if (!accessToken) {
    return {
      accessToken: null,
      user: null,
      errorResponse: c.json({ error: "Unauthorized" }, 401),
    };
  }

  const supabase = getServiceClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return {
      accessToken,
      user: null,
      errorResponse: c.json({ error: "Unauthorized" }, 401),
    };
  }

  return { accessToken, user, errorResponse: null as Response | null };
}

function getUserRole(user: { user_metadata?: Record<string, unknown> }) {
  return (
    ((user.user_metadata?.role || user.user_metadata?.userType) as
      | AppRole
      | undefined) ?? "student"
  );
}

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey", "x-client-info"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/server/health", (c) => {
  return c.json({ status: "ok" });
});

// Signup endpoint
app.post("/server/signup", async (c) => {
  try {
    const { email, password, name, role, userType } = await c.req.json();
    const normalizedRole = normalizeRoleInput(role ?? userType);

    if (!email || !password || !name) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const supabase = getServiceClient();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
        role: normalizedRole,
        subscription_tier:
          normalizedRole === "vendor" ? "standard" : "standard",
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.error("Signup error:", error);

      // Handle specific error codes
      if (
        error.message.includes("already been registered") ||
        error.code === "email_exists"
      ) {
        return c.json(
          {
            error:
              "An account with this email already exists. Please sign in instead.",
          },
          422,
        );
      }

      return c.json({ error: error.message }, 400);
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        email,
        name,
        role: normalizedRole,
        subscription_tier:
          normalizedRole === "vendor" ? "standard" : "standard",
      },
      { onConflict: "id" },
    );

    // ✨ THE FIX: Rollback if profile creation fails!
    if (profileError) {
      console.error(
        "Profile creation failed, rolling back auth user:",
        profileError,
      );
      // Delete the user from auth.users so they aren't permanently stuck
      await supabase.auth.admin.deleteUser(data.user.id);

      return c.json(
        {
          error: "Failed to set up user profile. Please try signing up again.",
        },
        500,
      );
    }

    return c.json({
      success: true,
      message: "Account created successfully. Please sign in.",
    });
  } catch (error) {
    console.error("Signup error during account creation:", error);
    return c.json(
      { error: "Failed to create account. Please try again." },
      500,
    );
  }
});

// Update profile endpoint
app.post("/server/update-profile", async (c) => {
  try {
    const auth = await getAuthorizedUser(c);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const { accessToken, user } = auth;
    const supabase = getServiceClient();

    // Get profile data from request
    const { name, phone, address, studentId, shopLocation, waitTime, role } =
      await c.req.json();

    // Update user metadata
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        name: name || user.user_metadata?.name,
        phone: phone || user.user_metadata?.phone || "",
        address: address || user.user_metadata?.address || "",
        studentId: studentId || user.user_metadata?.studentId || "",
        shopLocation: shopLocation || user.user_metadata?.shopLocation || "",
        waitTime: waitTime || user.user_metadata?.waitTime || "",
        role: role || getUserRole(user),
      },
    });

    if (error) {
      console.error("Profile update error:", error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({
      success: true,
      message: "Profile updated successfully",
      user: data.user,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// Vendor registration endpoint
app.post("/server/vendor/register", async (c) => {
  try {
    const auth = await getAuthorizedUser(c);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const { user } = auth;
    if (getUserRole(user) !== "vendor" && getUserRole(user) !== "superadmin") {
      return c.json({ error: "Only vendor accounts can register shops" }, 403);
    }

    const body = await c.req.json();
    const shopName = String(body?.shopName ?? "").trim();
    const address = String(body?.address ?? "").trim();
    const description = String(body?.description ?? "").trim();
    const hours = String(body?.hours ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const tier = body?.tier === "premium" ? "premium" : "standard";
    const latitude = Number(body?.latitude);
    const longitude = Number(body?.longitude);
    const services = Array.isArray(body?.services) ? body.services : [];

    if (
      !shopName ||
      !address ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return c.json(
        { error: "Shop name, address, and map pin are required" },
        400,
      );
    }

    const supabase = getServiceClient();
    const slug = slugify(shopName);

    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        name: shopName,
        role: "vendor",
        subscription_tier: tier,
      },
      { onConflict: "id" },
    );

    const existingShop = await supabase
      .from("print_shops")
      .select("id, status")
      .eq("owner_id", user.id)
      .maybeSingle();

    const status =
      existingShop.data?.status === "suspended" ? "suspended" : "verified";
    const online = body?.isOnline !== false && status === "verified";

    const { error } = await supabase.from("print_shops").upsert(
      {
        owner_id: user.id,
        shop_name: shopName,
        slug,
        description: description || "Partner print shop on PrintFlow.",
        address,
        latitude,
        longitude,
        wait_time: Number(body?.waitTime ?? 15),
        online,
        status,
        tier,
        hours: hours || "Hours pending",
        services,
        phone: phone || null,
        email: user.email,
      },
      { onConflict: "owner_id" },
    );

    if (error) {
      console.error("Vendor registration error:", error);
      return c.json({ error: error.message }, 400);
    }

    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        name: shopName,
        role: "vendor",
        shopLocation: address,
        waitTime: String(body?.waitTime ?? 15),
      },
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Vendor registration error:", error);
    return c.json({ error: "Failed to save vendor profile" }, 500);
  }
});

// Super admin vendor directory
app.get("/server/admin/vendors", async (c) => {
  try {
    const auth = await getAuthorizedUser(c);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const { user } = auth;
    if (getUserRole(user) !== "superadmin") {
      return c.json({ error: "Forbidden" }, 403);
    }

    const supabase = getServiceClient();
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    const vendorUsers = (users?.users ?? []).filter((candidate) => {
      const role = getUserRole(candidate);
      return role === "vendor";
    });

    const ownerIds = vendorUsers.map((candidate) => candidate.id);
    const { data: shops } = await supabase
      .from("print_shops")
      .select(
        "owner_id, shop_name, slug, status, online, tier, latitude, longitude, hours, services, phone",
      )
      .in(
        "owner_id",
        ownerIds.length > 0
          ? ownerIds
          : ["00000000-0000-0000-0000-000000000000"],
      );

    const shopByOwner = new Map(
      (shops ?? []).map((shop) => [shop.owner_id, shop]),
    );

    return c.json({
      vendors: vendorUsers.map((candidate) => {
        const shop = shopByOwner.get(candidate.id);
        return {
          userId: candidate.id,
          email: candidate.email ?? "",
          name: String(candidate.user_metadata?.name ?? "Vendor"),
          role: getUserRole(candidate),
          shopName: String(
            shop?.shop_name ?? candidate.user_metadata?.name ?? "Vendor",
          ),
          shopSlug: String(shop?.slug ?? ""),
          approvalStatus: shop?.status ?? "pending",
          online: Boolean(shop?.online),
          tier: shop?.tier ?? "standard",
          latitude: shop?.latitude ?? null,
          longitude: shop?.longitude ?? null,
          hours: shop?.hours ?? null,
          services: shop?.services ?? [],
          phone: shop?.phone ?? null,
          createdAt: candidate.created_at,
        };
      }),
    });
  } catch (error) {
    console.error("Vendor directory error:", error);
    return c.json({ error: "Failed to load vendors" }, 500);
  }
});

// Super admin vendor status actions
app.post("/server/admin/vendors/:vendorId", async (c) => {
  try {
    const auth = await getAuthorizedUser(c);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const { user } = auth;
    if (getUserRole(user) !== "superadmin") {
      return c.json({ error: "Forbidden" }, 403);
    }

    const vendorId = c.req.param("vendorId");
    const { action } = await c.req.json();
    const supabase = getServiceClient();

    if (!vendorId || !action) {
      return c.json({ error: "Missing vendor action" }, 400);
    }

    if (action === "delete") {
      await supabase.from("print_shops").delete().eq("owner_id", vendorId);
      await supabase.from("profiles").delete().eq("id", vendorId);
      const { error } = await supabase.auth.admin.deleteUser(vendorId);

      if (error) {
        return c.json({ error: error.message }, 400);
      }

      return c.json({ success: true });
    }

    const nextStatus = action === "approve" ? "verified" : "suspended";
    const nextOnline = action === "approve";

    const { error } = await supabase
      .from("print_shops")
      .update({ status: nextStatus, online: nextOnline })
      .eq("owner_id", vendorId);

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    const existingUser = await supabase.auth.admin.getUserById(vendorId);
    await supabase.auth.admin.updateUserById(vendorId, {
      user_metadata: {
        ...(existingUser.data.user?.user_metadata ?? {}),
        role: "vendor",
        vendorStatus: nextStatus,
      },
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Vendor action error:", error);
    return c.json({ error: "Failed to update vendor" }, 500);
  }
});

// Groq shop auto-reply (offline reservation bot)
app.post("/server/shop-chat", async (c) => {
  try {
    const auth = await getAuthorizedUser(c);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const { user } = auth;

    const groqKey = Deno.env.get("GROQ_API_KEY");

    if (!groqKey) {
      return c.json(
        {
          error: "AI provider API key not configured on server (GROQ_API_KEY)",
          fallback: true,
        },
        503,
      );
    }

    const body = await c.req.json();
    const shopId = String(body?.shop?.shopId ?? body?.shopId ?? "").trim();
    const shopSlug = String(body?.shop?.slug ?? body?.shopSlug ?? "").trim();
    const messages = body?.messages;

    if (
      (!shopId && !shopSlug) ||
      !Array.isArray(messages) ||
      messages.length === 0
    ) {
      return c.json(
        { error: "shopId or shopSlug and messages are required" },
        400,
      );
    }

    const supabase = getServiceClient();
    let shopQuery = supabase
      .from("print_shops")
      .select(
        "id, owner_id, shop_name, slug, description, address, latitude, longitude, wait_time, online, status, tier, hours, services, email, phone",
      );

    shopQuery = shopId
      ? shopQuery.eq("id", shopId)
      : shopQuery.eq("slug", shopSlug);

    const { data: shop, error: shopError } = await shopQuery.maybeSingle();

    if (shopError || !shop) {
      return c.json({ error: "Requested shop not found" }, 404);
    }

    if (shop.tier !== "premium") {
      return c.json(
        {
          error:
            "Groq AI reservations require a Premium subscription for this shop.",
          requiredTier: "premium",
        },
        403,
      );
    }

    const systemInstruction = `You are the Groq-powered reservation assistant for "${shop.shop_name}", a premium partner print shop on the PrintFlow platform at Davao del Norte State College (DNSC), Philippines.

Shop details:
- Status: ${shop.status}
- Address: ${shop.address}
- Hours: ${shop.hours}
- Typical wait: ~${shop.wait_time} minutes
- Services: ${(shop.services || []).join(", ")}

Your role:
- Help students reserve a print pickup slot while the shop owner is away or the shop is offline.
- Be warm, concise, and professional. Use Philippine English context (₱ pricing only if asked; default to reservation flow).
- Ask for pickup date/time if not provided. Confirm reservations clearly.
- Never invent shop policies beyond standard print services listed above.
- If the shop is online, still assist but mention they may also walk in.

Respond ONLY with valid JSON matching this schema:
{
  "message": "string (your reply to the student, plain text)",
  "reservationConfirmed": boolean,
  "pickupTime": "string or null (e.g. 1:00 PM)",
  "pickupDate": "string or null (e.g. Today, Tomorrow, April 20)"
}

Set reservationConfirmed to true only when the student has agreed to a specific pickup time and you have confirmed it.`;

    const groq = new Groq({ apiKey: groqKey });
    const completion = await groq.chat.completions.create({
      model: Deno.env.get("GROQ_MODEL") || "llama3-8b-8192",
      messages: [
        { role: "system", content: systemInstruction },
        ...messages.map((m: { role: string; text: string }) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text,
        })),
      ],
      max_tokens: 512,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const rawText = completion.choices[0]?.message?.content ?? "";

    if (!rawText) {
      return c.json(
        { error: "AI assistant temporarily unavailable", fallback: true },
        502,
      );
    }

    const extractJsonText = (text: string) => {
      const trimmed = text.trim();

      const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (fenced?.[1]) {
        return fenced[1].trim();
      }

      const start = trimmed.indexOf("{");
      if (start < 0) {
        return trimmed;
      }

      let depth = 0;
      let inString = false;
      let escaped = false;

      for (let i = start; i < trimmed.length; i += 1) {
        const char = trimmed[i];

        if (escaped) {
          escaped = false;
          continue;
        }

        if (char === "\\") {
          escaped = inString;
          continue;
        }

        if (char === '"') {
          inString = !inString;
          continue;
        }

        if (inString) {
          continue;
        }

        if (char === "{") {
          depth += 1;
        } else if (char === "}") {
          depth -= 1;
          if (depth === 0) {
            return trimmed.slice(start, i + 1);
          }
        }
      }

      return trimmed.slice(start);
    };

    let parsed: {
      message?: string;
      reservationConfirmed?: boolean;
      pickupTime?: string | null;
      pickupDate?: string | null;
    };

    try {
      parsed = JSON.parse(extractJsonText(rawText));
    } catch {
      console.error("Failed to parse AI JSON:", rawText);
      return c.json(
        {
          message:
            "I'm having trouble formatting my response. Could you repeat your preferred pickup time?",
          reservationConfirmed: false,
          pickupTime: null,
          pickupDate: null,
        },
        200,
      );
    }

    if (!parsed?.message) {
      return c.json(
        {
          message:
            "I'm having trouble formatting my response. Could you repeat your preferred pickup time?",
          reservationConfirmed: false,
          pickupTime: null,
          pickupDate: null,
        },
        200,
      );
    }

    return c.json({
      message: parsed.message ?? "How can I help with your print reservation?",
      reservationConfirmed: Boolean(parsed.reservationConfirmed),
      pickupTime: parsed.pickupTime ?? null,
      pickupDate: parsed.pickupDate ?? null,
    });
  } catch (error) {
    console.error("shop-chat error:", error);
    return c.json({ error: "Failed to process chat", fallback: true }, 500);
  }
});

// Cloudinary signed upload (secrets never sent to browser)
app.post("/server/cloudinary-sign", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME");
    const apiKey = Deno.env.get("CLOUDINARY_API_KEY");
    const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET");
    const folder =
      Deno.env.get("CLOUDINARY_UPLOAD_FOLDER") ?? "printflow/documents";

    if (!cloudName || !apiKey || !apiSecret) {
      return c.json(
        { error: "Cloudinary is not configured on the server" },
        503,
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-1",
      encoder.encode(paramsToSign),
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return c.json({
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder,
    });
  } catch (error) {
    console.error("cloudinary-sign error:", error);
    return c.json({ error: "Failed to sign upload" }, 500);
  }
});

// Fetch single order
app.get("/server/orders/:orderId", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const orderId = c.req.param("orderId");
    if (!orderId?.trim()) {
      return c.json({ error: "Order ID is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId.trim())
      .maybeSingle();

    if (error) {
      console.error("Order fetch error:", error);
      return c.json({ error: error.message }, 500);
    }

    if (!data) {
      return c.json({ error: "Order not found" }, 404);
    }

    return c.json({ order: data });
  } catch (error) {
    console.error("GET order error:", error);
    return c.json({ error: "Failed to fetch order" }, 500);
  }
});

// Create order
app.post("/server/orders", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const order = body?.order;

    if (!order?.id || !order?.student_name) {
      return c.json({ error: "Invalid order payload" }, 400);
    }

    const row = {
      ...order,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("orders")
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error("Order insert error:", error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ order: data }, 201);
  } catch (error) {
    console.error("POST order error:", error);
    return c.json({ error: "Failed to create order" }, 500);
  }
});

Deno.serve(app.fetch);
