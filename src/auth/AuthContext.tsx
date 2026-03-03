import { createContext, useEffect, useMemo, useState } from "react";
import type { Role, User } from "./types";
import { clearSession, loadSession, loadUsers, saveSession, saveUsers } from "./storage";
import { getDeviceId } from "@/device/device";
import { issueOtp, verifyAndConsumeOtp } from "@/otp/otp";

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  nombre: string;
  email: string;
  telefono?: string;
  password: string;
  role: Role;
};

type AuthContextValue = {
  user: User | null;
  login: (input: LoginInput) => { ok: true; user: User } | { ok: false; reason: "INVALID" };
  register: (
    input: RegisterInput,
  ) => { ok: true; userId: string } | { ok: false; reason: "EMAIL_TAKEN" };
  requestActivationOtp: (userId: string) => { ok: true; otpSimulado: string } | { ok: false };
  activateAccount: (input: { userId: string; otp: string }) => { ok: true } | { ok: false };
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

function newId() {
  const c = crypto as unknown as { randomUUID?: () => string };
  return c?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function normalizeRole(role: string | undefined): "profesor" | "estudiante" {
  return role === "profesor" ? "profesor" : "estudiante";
}

function loadUserFromSession(): User | null {
  const session = loadSession();
  if (!session) return null;
  const users = loadUsers();
  const u = users.find((x) => x.id === session.userId) ?? null;
  if (!u) return null;
  return { ...u, role: normalizeRole(u.role) };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUserFromSession);

  useEffect(() => {
    getDeviceId();
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      login: ({ email, password }) => {
        const users = loadUsers();
        let u =
          users.find(
            (x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password,
          ) ?? null;
        if (!u) return { ok: false, reason: "INVALID" };
        u = { ...u, role: normalizeRole(u.role) };
        if (u.role === "estudiante" && !u.activated) {
          return { ok: false, reason: "INVALID" };
        }
        saveSession({ userId: u.id });
        setUser(u);
        return { ok: true, user: u };
      },
      register: ({ nombre, email, telefono, password, role }) => {
        const users = loadUsers();
        const exists = users.some((x) => x.email.toLowerCase() === email.trim().toLowerCase());
        if (exists) return { ok: false, reason: "EMAIL_TAKEN" };
        const deviceId = getDeviceId();
        const roleNorm = normalizeRole(role);
        const u: User = {
          id: newId(),
          nombre: nombre.trim(),
          email: email.trim(),
          password,
          role: roleNorm,
          telefono: telefono?.trim() || undefined,
          activated: roleNorm === "profesor" ? true : false,
          primaryDeviceId: roleNorm === "estudiante" ? deviceId : undefined,
          createdAt: new Date().toISOString(),
        };
        saveUsers([...users, u]);
        if (roleNorm === "profesor") {
          saveSession({ userId: u.id });
          setUser(u);
        }
        return { ok: true, userId: u.id };
      },
      requestActivationOtp: (userId) => {
        const users = loadUsers();
        const u = users.find((x) => x.id === userId) ?? null;
        if (!u) return { ok: false };
        const rec = issueOtp({ purpose: "activate_account", userId, ttlSeconds: 5 * 60 });
        return { ok: true, otpSimulado: rec.otp };
      },
      activateAccount: ({ userId, otp }) => {
        const ok = verifyAndConsumeOtp({ purpose: "activate_account", userId, otp }).ok;
        if (!ok) return { ok: false };
        const users = loadUsers();
        const updated = users.map((u) => (u.id === userId ? { ...u, activated: true } : u));
        saveUsers(updated);
        saveSession({ userId });
        const u = updated.find((x) => x.id === userId) ?? null;
        if (u) setUser({ ...u, role: normalizeRole(u.role) });
        return { ok: true };
      },
      logout: () => {
        clearSession();
        setUser(null);
      },
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

