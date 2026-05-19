// @ts-nocheck

import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.ts";
const app = new Hono();

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
    const { email, password, name, userType } = await c.req.json();

    if (!email || !password || !name || !userType) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType },
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

<<<<<<< HEAD
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

=======
>>>>>>> parent of e99a495 (finalizing pt.1)
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
    const accessToken = c.req.header("Authorization")?.split(" ")[1];

    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );

    // Verify user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get profile data from request
    const { name, phone, address, studentId, shopLocation, waitTime } =
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

// Groq shop auto-reply (offline reservation bot)
app.post("/server/shop-chat", async (c) => {
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
    const shop = body?.shop;
    const messages = body?.messages;

    if (!shop?.name || !Array.isArray(messages) || messages.length === 0) {
      return c.json({ error: "shop and messages are required" }, 400);
    }

    const systemInstruction = `You are the Offline Auto-Reply assistant for "${shop.name}", a campus print shop on the PrintFlow platform at Davao del Norte State College (DNSC), Philippines.

Shop details:
- Status: ${shop.status}
- Address: ${shop.address}
- Hours: ${shop.hours}
- Typical wait: ~${shop.waitTime} minutes
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

    let rawText = "";

    if (groqKey) {
      try {
        const groqRes = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
              model: "llama-3.1-8b-instant",
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
            }),
          },
        );

        if (!groqRes.ok) {
          const errText = await groqRes.text();
          console.error("Groq API error:", groqRes.status, errText);
        } else {
          const groqData = await groqRes.json();
          rawText = groqData?.choices?.[0]?.message?.content ?? "";
        }
      } catch (e) {
        console.error("Groq request failed:", e);
      }
    }

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
