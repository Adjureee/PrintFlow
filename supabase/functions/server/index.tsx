import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-73bd5aa5/health", (c) => {
  return c.json({ status: "ok" });
});

// Signup endpoint
app.post("/make-server-73bd5aa5/signup", async (c) => {
  try {
    const { email, password, name, userType } = await c.req.json();

    if (!email || !password || !name || !userType) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      
      // Handle specific error codes
      if (error.message.includes('already been registered') || error.code === 'email_exists') {
        return c.json({ error: 'An account with this email already exists. Please sign in instead.' }, 422);
      }
      
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      message: "Account created successfully. Please sign in." 
    });
  } catch (error) {
    console.error('Signup error during account creation:', error);
    return c.json({ error: "Failed to create account. Please try again." }, 500);
  }
});

// Update profile endpoint
app.post("/make-server-73bd5aa5/update-profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    );

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get profile data from request
    const { name, phone, address, studentId, shopLocation, waitTime } = await c.req.json();

    // Update user metadata
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          name: name || user.user_metadata?.name,
          phone: phone || user.user_metadata?.phone || '',
          address: address || user.user_metadata?.address || '',
          studentId: studentId || user.user_metadata?.studentId || '',
          shopLocation: shopLocation || user.user_metadata?.shopLocation || '',
          waitTime: waitTime || user.user_metadata?.waitTime || '',
        }
      }
    );

    if (error) {
      console.error('Profile update error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      message: "Profile updated successfully",
      user: data.user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// Gemini shop auto-reply (offline reservation bot)
app.post("/make-server-73bd5aa5/shop-chat", async (c) => {
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

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return c.json(
        {
          error: "Gemini API key not configured on server",
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

    const contents = messages.map(
      (m: { role: string; text: string }) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }),
    );

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
            responseMimeType: "application/json",
            responseSchema: {
              type: "object",
              properties: {
                message: { type: "string" },
                reservationConfirmed: { type: "boolean" },
                pickupTime: { type: "string" },
                pickupDate: { type: "string" },
              },
              required: ["message", "reservationConfirmed"],
            },
          },
        }),
      },
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      return c.json(
        { error: "AI assistant temporarily unavailable", fallback: true },
        502,
      );
    }

    const geminiData = await geminiRes.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let parsed: {
      message?: string;
      reservationConfirmed?: boolean;
      pickupTime?: string | null;
      pickupDate?: string | null;
    };

    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.error("Failed to parse Gemini JSON:", rawText);
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
    return c.json(
      { error: "Failed to process chat", fallback: true },
      500,
    );
  }
});

// Cloudinary signed upload (secrets never sent to browser)
app.post("/make-server-73bd5aa5/cloudinary-sign", async (c) => {
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
      return c.json({ error: "Cloudinary is not configured on the server" }, 503);
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
app.get("/make-server-73bd5aa5/orders/:orderId", async (c) => {
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
app.post("/make-server-73bd5aa5/orders", async (c) => {
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