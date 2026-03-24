import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import { isStaffRole } from "@/features/auth/types";

export default function AppGate() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (isStaffRole(user.role)) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/agenda" replace />;
}

