export type Role = "profesor" | "estudiante";

export interface User {
  id: string;
  nombre: string;
  email: string;
  password: string;
  role: Role;
  telefono?: string;
  activated?: boolean;
  primaryDeviceId?: string;
  createdAt: string;
  meta?: Record<string, string>;
}

export interface Session {
  userId: string;
}

