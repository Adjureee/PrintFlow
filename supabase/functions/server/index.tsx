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

Deno.serve(app.fetch);