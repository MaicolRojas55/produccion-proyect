import { useState } from "react";
import { agendaData, DaySchedule } from "@/data/agendaData";

const AGENDA_KEY = "con_agenda_data_v1";

export function getEditableAgenda(): DaySchedule[] {
  if (typeof window === "undefined") return agendaData;
  const raw = window.localStorage.getItem(AGENDA_KEY);
  if (!raw) return agendaData;
  try {
    return JSON.parse(raw);
  } catch {
    return agendaData;
  }
}

export function saveEditableAgenda(data: DaySchedule[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AGENDA_KEY, JSON.stringify(data));
  }
}

export function useEditableAgenda() {
  const [agenda, setAgenda] = useState<DaySchedule[]>(getEditableAgenda);

  const updateAgenda = (newAgenda: DaySchedule[]) => {
    setAgenda(newAgenda);
    saveEditableAgenda(newAgenda);
  };

  return { agenda, updateAgenda };
}
