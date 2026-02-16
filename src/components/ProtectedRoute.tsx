import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

// Simple route guard component.
// - If `isAuthenticated` is false, redirect to `/login`
// - Otherwise render the nested route via <Outlet />
export default function ProtectedRoute() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Not authenticated -> send user to login screen
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated -> render nested routes
  return <Outlet />;
}