/**
 * El problema original:
 * - Las conferencias se guardaban en localStorage EN PARALELO al backend
 * - Esto causaba datos desactualizados, duplicados y pérdida de datos
 *   si el usuario limpiaba el navegador
 * - El apiClient ya tenía todos los métodos para CRUD en el backend
 *
 * La solución:
 * - Se elimina todo el acceso a localStorage para conferencias
 * - Las inscripciones de agenda (AgendaInscription) se mantienen en localStorage
 *   porque son datos locales del usuario (no requieren servidor)
 * - Todo lo demás (Conference, Attendance) debe venir del apiClient
 *
 * IMPORTANTE: Si algún componente usaba loadConferences() / saveConferences(),
 * reemplázalo por: apiClient.getConferences() / apiClient.createConference()
 */

import type { AgendaInscription } from "./types";

// ─── CONFERENCIAS ────────────────────────────────────────────────────────────
// ELIMINADO: loadConferences(), saveConferences()
// Usa apiClient.getConferences() y apiClient.createConference() en su lugar.
//
// Ejemplo de migración en un componente:
//
//   ANTES:
//     const conferences = loadConferences()
//
//   DESPUÉS:
//     const [conferences, setConferences] = useState<Conference[]>([])
//     useEffect(() => {
//       apiClient.getConferences().then(setConferences).catch(console.error)
//     }, [])

// ─── INSCRIPCIONES DE AGENDA (se mantienen locales) ──────────────────────────
// Estas son inscripciones locales del usuario a sesiones de la agenda estática.
// No requieren servidor porque son preferencias personales de visualización.

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

// ─── EXPORTACIONES ELIMINADAS (no borres si otro módulo las importa) ─────────
// Si ves un error de "loadConferences is not exported", busca el componente
// que lo importa y reemplázalo por apiClient.getConferences()

export type { AgendaInscription };
