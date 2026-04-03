import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './routes/_main';

// Page imports
import DashboardPage from './routes/_main.dashboard._index';
import InventoryPage from './routes/_main.inventory._index';
import FridgePage from './routes/_main.fridge._index';
import MealPage from './routes/_main.meal._index';
import SharePage from './routes/_main.share._index';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'inventory',
        element: <InventoryPage />,
      },
      {
        path: 'fridge',
        element: <FridgePage />,
      },
      {
        path: 'meal',
        element: <MealPage />,
      },
      {
        path: 'share',
        element: <SharePage />,
      },
    ],
  },
]);
