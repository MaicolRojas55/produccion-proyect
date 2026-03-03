import type { Role } from "@/auth/types";

export type Audience = "todos" | "profesores" | "estudiantes";

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  title: string;
  description?: string;
  audience: Audience;
  createdByUserId: string;
  attendees: string[]; // userIds
  createdByRole: Role;
  createdAt: string;
}

