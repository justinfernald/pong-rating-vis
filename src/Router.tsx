import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { ErrorPage } from './routes/ErrorPage';
import { Root } from './routes/Root';
import { Player } from './routes/Player';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
  },
  {
    path: 'player/:id',
    element: <Player />,
  },
]);

export const Router = () => <RouterProvider router={router} />;
