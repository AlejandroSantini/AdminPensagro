import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  // TEMPORAL: hardcodear acceso para desarrollo
  const isDevelopment = true; // Cambiar a false cuando tengas el backend

  if (!isAuthenticated && !isDevelopment) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  return <>{children}</>;
}