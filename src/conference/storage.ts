import type { Attendance, Conference, StudentAgendaItem, AgendaInscription } from "./types";

const CONF_KEY = "pp_conferences_v1";
const ATT_KEY = "pp_attendance_v1";
const AGENDA_KEY = "pp_student_agenda_v1";
const AGENDA_INSCRIPTIONS_KEY = "pp_agenda_inscriptions_v1";

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadConferences(): Conference[] {
  const x = safeParseJson<Conference[]>(localStorage.getItem(CONF_KEY));
  return Array.isArray(x) ? x : [];
}

export function saveConferences(items: Conference[]) {
  localStorage.setItem(CONF_KEY, JSON.stringify(items));
}

export function loadAttendance(): Attendance[] {
  const x = safeParseJson<Attendance[]>(localStorage.getItem(ATT_KEY));
  return Array.isArray(x) ? x : [];
}

export function saveAttendance(items: Attendance[]) {
  localStorage.setItem(ATT_KEY, JSON.stringify(items));
}

export function loadStudentAgenda(): StudentAgendaItem[] {
  const x = safeParseJson<StudentAgendaItem[]>(localStorage.getItem(AGENDA_KEY));
  return Array.isArray(x) ? x : [];
}

export function saveStudentAgenda(items: StudentAgendaItem[]) {
  localStorage.setItem(AGENDA_KEY, JSON.stringify(items));
}

export function loadAgendaInscriptions(): AgendaInscription[] {
  const x = safeParseJson<AgendaInscription[]>(localStorage.getItem(AGENDA_INSCRIPTIONS_KEY));
  return Array.isArray(x) ? x : [];
}

export function saveAgendaInscriptions(items: AgendaInscription[]) {
  localStorage.setItem(AGENDA_INSCRIPTIONS_KEY, JSON.stringify(items));
}

