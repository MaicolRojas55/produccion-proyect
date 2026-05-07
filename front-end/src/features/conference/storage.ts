/**
 * BUG 5 FIX — front-end/src/features/conference/storage.ts
 *
 * Las conferencias ya no se guardan en localStorage.
 * Usa apiClient.getConferences() / apiClient.createConference() en su lugar.
 * Las inscripciones de agenda (AgendaInscription) se mantienen en localStorage
 * porque son preferencias locales del usuario.
 */

import type { AgendaInscription } from "./types";

// ─── INSCRIPCIONES DE AGENDA (se mantienen locales) ──────────────────────────

const AGENDA_INSCRIPTIONS_KEY = "pp_agenda_inscriptions_v1";

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadAgendaInscriptions(): AgendaInscription[] {
  const x = safeParseJson<AgendaInscription[]>(
    localStorage.getItem(AGENDA_INSCRIPTIONS_KEY)
  );
  return Array.isArray(x) ? x : [];
}

export function saveAgendaInscriptions(items: AgendaInscription[]) {
  localStorage.setItem(AGENDA_INSCRIPTIONS_KEY, JSON.stringify(items));
}

export type { AgendaInscription };

