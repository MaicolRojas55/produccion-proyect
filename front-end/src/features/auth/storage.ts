import type { Session, User } from "./types";

const USERS_KEY = "pp_users_v1";

// FIX: clave distinta a "pp_session_v1"
// api.ts usa "pp_auth_token_v1" para el JWT
// este archivo usa "pp_session_user_v1" para los datos del usuario
const SESSION_KEY = "pp_session_user_v1";

function getStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadUsers(): User[] {
  const storage = getStorage();
  if (!storage) return [];
  const users = safeParseJson<User[]>(storage.getItem(USERS_KEY));
  return Array.isArray(users) ? users : [];
}

export function saveUsers(users: User[]) {
  const storage = getStorage();
  if (storage) storage.setItem(USERS_KEY, JSON.stringify(users));
}

export function loadSession(): Session | null {
  const storage = getStorage();
  if (!storage) return null;
  return safeParseJson<Session>(storage.getItem(SESSION_KEY));
}

export function saveSession(session: Session) {
  const storage = getStorage();
  if (storage) storage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  const storage = getStorage();
  if (storage) storage.removeItem(SESSION_KEY);
}

