import type { Session, User } from "./types";

const USERS_KEY = "pp_users_v1";
const SESSION_KEY = "pp_session_v1";

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadUsers(): User[] {
  const users = safeParseJson<User[]>(localStorage.getItem(USERS_KEY));
  return Array.isArray(users) ? users : [];
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function loadSession(): Session | null {
  return safeParseJson<Session>(localStorage.getItem(SESSION_KEY));
}

export function saveSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

