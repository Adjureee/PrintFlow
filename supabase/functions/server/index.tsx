<<<<<<< HEAD:supabase/functions/server/index.ts
// @ts-nocheck
import Groq from "npm:groq-sdk";
=======
>>>>>>> parent of 479bb38 (fixing some things):supabase/functions/server/index.tsx
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
<<<<<<< HEAD:supabase/functions/server/index.ts
import * as kv from "./kv_store.ts";

=======
import * as kv from "./kv_store.tsx";
>>>>>>> parent of 479bb38 (fixing some things):supabase/functions/server/index.tsx
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

    // ✨ FIX 1: Define normalizedRole so it doesn't crash on insert
    const normalizedRole =
      userType === "vendor" || userType === "shop" ? "vendor" : "student";

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
<<<<<<< HEAD:supabase/functions/server/index.ts
      user_metadata: { name, userType: normalizedRole },
      email_confirm: true,
    });

    if (error) {
      console.error("Signup error:", error);
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

    // Rollback if profile creation fails
    if (profileError) {
      console.error(
        "Profile creation failed, rolling back auth user:",
        profileError,
      );
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
=======
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
>>>>>>> parent of 479bb38 (fixing some things):supabase/functions/server/index.tsx
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

<<<<<<< HEAD:supabase/functions/server/index.ts
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

=======
    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
>>>>>>> parent of 479bb38 (fixing some things):supabase/functions/server/index.tsx
    if (authError || !user) {
      console.error('Auth error:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

<<<<<<< HEAD:supabase/functions/server/index.ts
    const { name, phone, address, studentId, shopLocation, waitTime } =
      await c.req.json();

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
=======
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
>>>>>>> parent of 479bb38 (fixing some things):supabase/functions/server/index.tsx

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

<<<<<<< HEAD:supabase/functions/server/index.ts
// Groq shop auto-reply (offline reservation bot)
app.post("/shop-chat", async (c) => {
=======
// Gemini shop auto-reply (offline reservation bot)
app.post("/make-server-73bd5aa5/shop-chat", async (c) => {
>>>>>>> parent of 479bb38 (fixing some things):supabase/functions/server/index.tsx
  try {
    const body = await c.req.json();
    const { shop_id, message, history } = body;

    if (!shop_id || !message) {
      return c.json(
        { error: "Missing required parameters: shop_id and message." },
        400,
      );
    }

    // ✨ FIX 2: Initialize Supabase securely inside the route
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );

    const { data: shopData, error: shopError } = await supabase
      .from("print_shops")
      .select("subscription_tier, name")
      .eq("id", shop_id)
      .single();

    if (shopError || !shopData) {
      console.error("Shop verification failed:", shopError);
      return c.json({ error: "Failed to verify shop authorization." }, 500);
    }

<<<<<<< HEAD:supabase/functions/server/index.ts
    if (shopData.subscription_tier !== "premium") {
      return c.json(
        { error: "Upgrade to Premium to unlock AI Auto-Reply." },
        403,
=======
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return c.json(
        {
          error: "Gemini API key not configured on server",
          fallback: true,
        },
        503,
>>>>>>> parent of 479bb38 (fixing some things):supabase/functions/server/index.tsx
      );
    }

    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY environment variable is missing.");
    }
    const groq = new Groq({ apiKey: groqApiKey });

    const systemPrompt = `You are a helpful customer service AI representing ${shopData.name} on the PrintFlow network. 
      You help students with printing inquiries and coordinate queue reservations. 
      Keep responses concise, friendly, and professional.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: message },
    ];

<<<<<<< HEAD:supabase/functions/server/index.ts
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama3-8b-8192",
      temperature: 0.6,
      max_tokens: 250,
=======
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
>>>>>>> parent of 479bb38 (fixing some things):supabase/functions/server/index.tsx
    });

    const reply = chatCompletion.choices[0]?.message?.content;

    if (!reply) {
      throw new Error("Received empty response from Groq API.");
    }

    return c.json({ reply });
  } catch (error) {
<<<<<<< HEAD:supabase/functions/server/index.ts
    console.error("Groq AI Integration Error:", error);
    return c.json(
      {
        error:
          "The AI assistant encountered a processing error. Please try again later.",
      },
=======
    console.error("shop-chat error:", error);
    return c.json(
      { error: "Failed to process chat", fallback: true },
>>>>>>> parent of 479bb38 (fixing some things):supabase/functions/server/index.tsx
      500,
    );
  }
});
// ✨ FIX 3: All the broken, floating Gemini JSON parser code has been safely deleted from here!

<<<<<<< HEAD:supabase/functions/server/index.ts
// Cloudinary signed upload
app.post("/server/cloudinary-sign", async (c) => {
=======
// Cloudinary signed upload (secrets never sent to browser)
app.post("/make-server-73bd5aa5/cloudinary-sign", async (c) => {
>>>>>>> parent of 479bb38 (fixing some things):supabase/functions/server/index.tsx
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

    return c.json({ signature, timestamp, cloudName, apiKey, folder });
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