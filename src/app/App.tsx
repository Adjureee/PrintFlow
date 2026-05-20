import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './lib/auth-context';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}