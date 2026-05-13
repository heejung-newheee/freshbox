import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import MainLayout from './routes/_main';
import { useAuthStore } from './stores/authStore';

import DashboardPage from './routes/_main.dashboard._index';
import InventoryPage from './routes/_main.inventory._index';
import FridgePage from './routes/_main.fridge._index';
import MealPage from './routes/_main.meal._index';
import SharePage from './routes/_main.share._index';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';

function ProtectedRoute() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px] text-gray-400">로딩 중...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'inventory', element: <InventoryPage /> },
          { path: 'fridge', element: <FridgePage /> },
          { path: 'meal', element: <MealPage /> },
          { path: 'share', element: <SharePage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
