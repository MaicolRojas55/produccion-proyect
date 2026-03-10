import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";
import { isStaffRole } from "@/auth/types";

export default function AppGate() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (isStaffRole(user.role)) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/agenda" replace />;
}

