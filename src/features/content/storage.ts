import { useState, useEffect } from "react";

const CONTENT_KEY = "pp_home_content_v1";

export interface HomeContent {
  hero: {
    title: string;
    subtitle: string;
    date: string;
  };
  impact: { value: string; label: string }[];
  speakers: { name: string; role: string; country: string }[];
  gallery: string[];
}

const defaultContent: HomeContent = {
  hero: {
    title: "XI CONIITI 2026",
    subtitle: "Décimo Primer Congreso Internacional de Innovación y Tendencias en Ingeniería",
    date: "Inicio del evento: 1 al 3 de octubre de 2026"
  },
  impact: [
    { value: '35', label: 'Conferencistas' },
    { value: '5', label: 'Ofertas de Workshops' },
    { value: '452 +', label: 'Participantes del Evento' }
  ],
  speakers: [
    { name: 'Ph. D. Julio Emilio Torres', role: 'Consultor / CSIC', country: 'España' },
    { name: 'Dr. Rubén Fuentes Fernández', role: 'Invest. / GRASIA', country: 'España' },
    { name: 'Ing. Antonio Jose Madrid Ramos', role: 'Coordinador / PROES', country: 'España' },
    { name: 'Arq. Francisco Pardo Campo', role: 'Director / PROES LATAM', country: 'España' }
  ],
  gallery: ["Galería 1", "Galería 2", "Galería 3", "Galería 4", "Galería 5", "Galería 6", "Galería 7", "Galería 8"]
};

export function getHomeContent(): HomeContent {
  const raw = typeof window !== "undefined" ? window.localStorage.getItem(CONTENT_KEY) : null;
  if (!raw) return defaultContent;
  try {
    const parsed = JSON.parse(raw);
    return { ...defaultContent, ...parsed }; // Merge to ensure all keys exist
  } catch {
    return defaultContent;
  }
}

export function saveHomeContent(content: HomeContent) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
  }
}

// Hook that listens to changes
export function useHomeContent() {
  const [content, setContent] = useState<HomeContent>(getHomeContent);

  const updateContent = (newContent: HomeContent) => {
    setContent(newContent);
    saveHomeContent(newContent);
  };

  return { content, updateContent };
}
