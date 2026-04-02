import { Navigate, useLocation } from "react-router-dom";
import { useRBAC } from "./useRBAC";
import type { Role } from "./types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, hasRole } = useRBAC();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (!hasRole(allowedRoles)) {
    // Si no tiene permiso, lo enviamos al root. Podrías crear una página "/acceso-denegado"
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
