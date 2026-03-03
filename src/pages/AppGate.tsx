import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/useAuth";

export default function AppGate() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return <Navigate to={user.role === "profesor" ? "/dashboard" : "/student"} replace />;
}

