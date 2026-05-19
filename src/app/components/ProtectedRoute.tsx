"use client";

import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../lib/auth-context";
import type { AppRole } from "../lib/print-shops";

interface ProtectedRouteProps {
  allowedRoles?: AppRole[];
}

function getFallbackPath(role: AppRole) {
  if (role === "superadmin") {
    return "/superadmin";
  }

  if (role === "vendor") {
    return "/shop";
  }

  return "/";
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getFallbackPath(user.role)} replace />;
  }

  return <Outlet />;
}
