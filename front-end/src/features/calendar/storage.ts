import type { CalendarEvent } from "./types";

const EVENTS_KEY = "pp_calendar_events_v1";

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadEvents(): CalendarEvent[] {
  const events = safeParseJson<CalendarEvent[]>(localStorage.getItem(EVENTS_KEY));
  return Array.isArray(events) ? events : [];
}

export function saveEvents(events: CalendarEvent[]) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

