import { createBrowserRouter, Navigate } from 'react-router';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RootLayout } from './components/RootLayout';
import StudentHome from './pages/student/StudentHome';
import PrintSettings from './pages/student/PrintSettings';
import OrderStatus from './pages/student/OrderStatus';
import Profile from './pages/student/Profile';
import ChatAssistant from './pages/student/ChatAssistant';
import ShopHome from './pages/shop/ShopHome';
import ShopOrderDetail from './pages/shop/ShopOrderDetail';
import ShopProfile from './pages/shop/ShopProfile';
import ShopAnalytics from './pages/shop/ShopAnalytics';
import ShopNotifications from './pages/shop/ShopNotifications';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import PrintFlowPoster from './pages/poster/PrintFlowPoster';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: 'login',
        Component: Login,
      },
      {
        path: 'signup',
        Component: Signup,
      },
      {
        path: 'poster',
        Component: PrintFlowPoster,
      },
      {
        path: '/',
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            Component: StudentHome,
          },
          {
            path: 'settings',
            Component: PrintSettings,
          },
          {
            path: 'status',
            Component: OrderStatus,
          },
          {
            path: 'profile',
            Component: Profile,
          },
          {
            path: 'chat',
            Component: ChatAssistant,
          },
        ],
      },
      {
        path: 'shop',
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            Component: ShopHome,
          },
          {
            path: 'order/:orderId',
            Component: ShopOrderDetail,
          },
          {
            path: 'profile',
            Component: ShopProfile,
          },
          {
            path: 'analytics',
            Component: ShopAnalytics,
          },
          {
            path: 'notifications',
            Component: ShopNotifications,
          },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);