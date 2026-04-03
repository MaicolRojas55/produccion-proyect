import { useState, useCallback } from "react";

export interface DateItem { id: string; label: string; date: string; icon: string; }
export interface SpeakerItem { id: string; name: string; role: string; img: string; bio: string; track: string; }
export interface MemoryItem { id: string; year: string; title: string; desc: string; }
export interface AuthorItem { id: string; name: string; paper: string; }
export interface ContactInfo { address: string; email: string; phone: string; mapUrl: string; }

export interface HomeContent {
  heroSubtitle: string;
  heroNotice: string;
  featuredCountry: { name: string; flag: string; description: string };
  comite: { title: string; description: string; members: string[] };
  fechasImportantes: DateItem[];
  memorias: MemoryItem[];
  conferencistas: SpeakerItem[];
  autores: AuthorItem[];
  noticias: { title: string; content: string; date: string }[];
  contacto: ContactInfo;
  galleryImages: { url: string; alt: string; span?: string }[];
}

const DEFAULT_CONTENT: HomeContent = {
  heroSubtitle: "El Congreso Internacional e-Commerce e Impacto con Inteligencia Emocional e Innovación de TI",
  heroNotice: "Participa de conferencias, talleres y red de contactos líder en innovación tecnológica y negocios digitales.",
  featuredCountry: {
    name: "España",
    flag: "🇪🇸",
    description: "País invitado de honor con destacados investigadores y conferencistas de universidades e institutos líderes en tecnología e innovación."
  },
  comite: {
    title: "Nuestro Comité Organizador",
    description: "Profesionales de alto nivel dedicados a hacer el CONIITI una realidad extraordinaria.",
    members: ["Juan Pérez", "Ana María López", "Dr. Carlos Santayana"]
  },
  fechasImportantes: [
    { id: "1", label: "Cierre Call for Papers", date: "15 Agosto", icon: "Calendar" },
    { id: "2", label: "Publicación de Aprobados", date: "01 Septiembre", icon: "Check" },
    { id: "3", label: "Incio Congreso", date: "25 Octubre", icon: "Calendar" }
  ],
  memorias: [
    { id: "1", year: "2023", title: "Innovación Post-Pandemia", desc: "Abordajes técnicos tras la adopción remota masiva." },
    { id: "2", year: "2022", title: "IA Generativa Temprana", desc: "El inicio de la explosión web AI." },
  ],
  conferencistas: [
    { id: "1", name: "Dr. Alan Turing", role: "Keynote Speaker", img: "/placeholder.jpg", bio: "Experto en ciencias de computación e inteligencia artificial.", track: "Main Track" },
    { id: "2", name: "Grace Hopper", role: "Workshop Lead", img: "/placeholder.jpg", bio: "Pionera en compiladores.", track: "Tech Track" }
  ],
  autores: [
    { id: "1", name: "Ricardo Fuentes", paper: "Arquitecturas Hexagonales en React" },
    { id: "2", name: "Silvia Romero", paper: "Optimización de Bases de Datos NoSQL" }
  ],
  noticias: [
    { title: "¡Ampliamos Fecha de Recepción!", date: "2024-04-01", content: "El plazo para envío de artículos científicos se amplía hasta el 15 de Agosto." }
  ],
  contacto: {
    address: "Auditorio Sede Central, Cra. Principal #12-34",
    email: "contacto@coniiti.edu.co",
    phone: "+57 (601) 555-1234",
    mapUrl: "https://www.google.com/maps/embed/v1"
  },
  galleryImages: [
    { url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87", alt: "Conferencia", span: "md:col-span-2 md:row-span-2" },
    { url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87", alt: "Panel" },
    { url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87", alt: "Networking" },
    { url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87", alt: "Taller", span: "md:col-span-2" }
  ]
};

const STORAGE_KEY = "con_home_content_v2";

export function getHomeContent(): HomeContent {
  if (typeof window === "undefined") return DEFAULT_CONTENT;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_CONTENT;
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONTENT, ...parsed }; // Merging allowed properties explicitly
  } catch {
    return DEFAULT_CONTENT;
  }
}

export function saveHomeContent(content: HomeContent) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  }
}

export function useHomeContent() {
  const [content, setContent] = useState<HomeContent>(getHomeContent);

  const updateContent = useCallback((newContent: Partial<HomeContent>) => {
    setContent(prev => {
      const merged = { ...prev, ...newContent };
      saveHomeContent(merged);
      return merged;
    });
  }, []);

  return { content, updateContent };
}
