import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../lib/auth-context';

export function ProtectedRoute() {
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

  // Redirect based on user type
  const isShopRoute = location.pathname.startsWith('/shop');
  const isStudentRoute = location.pathname === '/' || 
                         location.pathname.startsWith('/settings') || 
                         location.pathname.startsWith('/status') || 
                         (location.pathname.startsWith('/profile') && !location.pathname.startsWith('/shop'));

  // If shop user tries to access student routes, redirect to shop dashboard
  if (user.userType === 'shop' && isStudentRoute) {
    return <Navigate to="/shop" replace />;
  }

  // If student user tries to access shop routes, redirect to student home
  if (user.userType === 'student' && isShopRoute) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}