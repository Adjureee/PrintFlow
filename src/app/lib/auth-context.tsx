"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

interface User {
  id: string;
  email: string;
  name: string;
  userType: "student" | "shop";
  phone?: string;
  address?: string;
  studentId?: string;
  shopLocation?: string;
  waitTime?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    userType: "student" | "shop",
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: {
    name?: string;
    phone?: string;
    address?: string;
    studentId?: string;
    shopLocation?: string;
    waitTime?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (data.session) {
        const { access_token, user: authUser } = data.session;
        setAccessToken(access_token);
        setUser({
          id: authUser.id,
          email: authUser.email || "",
          name: authUser.user_metadata?.name || "",
          userType: authUser.user_metadata?.userType || "student",
          phone: authUser.user_metadata?.phone,
          address: authUser.user_metadata?.address,
          studentId: authUser.user_metadata?.studentId,
          shopLocation: authUser.user_metadata?.shopLocation,
          waitTime: authUser.user_metadata?.waitTime,
        });
      }
    } catch (error) {
      console.error("Session check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        const { access_token, user: authUser } = data.session;
        const userData = {
          id: authUser.id,
          email: authUser.email || "",
          name: authUser.user_metadata?.name || "",
          userType: authUser.user_metadata?.userType || "student",
          phone: authUser.user_metadata?.phone,
          address: authUser.user_metadata?.address,
          studentId: authUser.user_metadata?.studentId,
          shopLocation: authUser.user_metadata?.shopLocation,
          waitTime: authUser.user_metadata?.waitTime,
        };

        setAccessToken(access_token);
        setUser(userData);

        return { success: true };
      }

      return { success: false, error: "No session returned" };
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: "Sign in failed. Please try again." };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    userType: "student" | "shop",
  ) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password, name, userType }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || "Sign up failed" };
      }

      return { success: true };
    } catch (error) {
      console.error("Sign up error:", error);
      return { success: false, error: "Sign up failed. Please try again." };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAccessToken(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const updateProfile = async (profileData: {
    name?: string;
    phone?: string;
    address?: string;
    studentId?: string;
    shopLocation?: string;
    waitTime?: string;
  }) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/update-profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(profileData),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || "Update failed" };
      }

      // Refresh the session to get updated user data
      await refreshUser();

      return { success: true };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        error: "Update profile failed. Please try again.",
      };
    }
  };

  const refreshUser = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw error;
      }

      if (data.session) {
        const { access_token, user: authUser } = data.session;
        setAccessToken(access_token);
        setUser({
          id: authUser.id,
          email: authUser.email || "",
          name: authUser.user_metadata?.name || "",
          userType: authUser.user_metadata?.userType || "student",
          phone: authUser.user_metadata?.phone,
          address: authUser.user_metadata?.address,
          studentId: authUser.user_metadata?.studentId,
          shopLocation: authUser.user_metadata?.shopLocation,
          waitTime: authUser.user_metadata?.waitTime,
        });
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
