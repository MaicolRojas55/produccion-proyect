import { useAuth } from "./useAuth";
import type { Role } from "./types";

export function useRBAC() {
  const { user } = useAuth();

  const hasRole = (roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isSuperAdmin = user?.role === "super_admin";
  const isWebMaster = user?.role === "web_master";
  const isRegisteredUser = user?.role === "usuario_registrado";

  return {
    user,
    hasRole,
    isSuperAdmin,
    isWebMaster,
    isRegisteredUser,
  };
}
