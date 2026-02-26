export type SessionType = 'keynote' | 'conference' | 'workshop' | 'panel' | 'networking' | 'break';

export interface Session {
  id: string;
  time: string;
  endTime: string;
  title: string;
  speaker?: string;
  speakerRole?: string;
  location: string;
  type: SessionType;
  track?: string;
  description?: string;
  /**
   * Número total de cupos disponibles para esta sesión.
   */
  capacity?: number;
  /**
   * Para sesiones virtuales: URL de la videollamada o streaming.
   */
  url?: string;
}

export interface DaySchedule {
  date: string;
  label: string;
  subtitle: string;
  sessions: Session[];
}

export const agendaData: DaySchedule[] = [
  {
    date: "2025-10-01",
    label: "Día 1",
    subtitle: "Miércoles 1 de Octubre — Inauguración y Conferencias Magistrales",
    sessions: [
      {
        id: "d1-1",
        time: "07:30",
        endTime: "08:30",
        title: "Registro y Acreditación",
        location: "Hall Principal — Sede 4",
        type: "break",
      },
      {
        id: "d1-2",
        time: "08:30",
        endTime: "09:30",
        title: "Ceremonia de Inauguración",
        speaker: "Comité Organizador CONIITI",
        speakerRole: "Universidad Católica de Colombia",
        location: "Auditorio Principal",
        type: "keynote",
        description: "Apertura oficial del XI Congreso Internacional de Innovación y Tendencias en Ingeniería.",
        url: "https://meet.example.com/inauguracion", // transmisión virtual
      },

      {
        id: "d1-3",
        time: "09:30",
        endTime: "10:30",
        title: "Inteligencia Artificial y el Futuro de la Ingeniería",
        speaker: "Ph.D. Julio Emilio Torres",
        speakerRole: "Consultor / CSIC — España",
        location: "Auditorio Principal",
        type: "keynote",
        track: "IA & Innovación",
        description: "Conferencia magistral sobre el impacto de la IA en los procesos de ingeniería y las tendencias emergentes.",
      },
      {
        id: "d1-4",
        time: "10:30",
        endTime: "11:00",
        title: "Coffee Break & Networking",
        location: "Zona de Exposiciones",
        type: "networking",
      },
      {
        id: "d1-5",
        time: "11:00",
        endTime: "12:00",
        title: "Transformación Digital en la Industria Latinoamericana",
        speaker: "Dr. Rubén Fuentes Fernández",
        speakerRole: "Investigador / GRASIA — España",
        location: "Auditorio Principal",
        type: "conference",
        track: "Transformación Digital",
      },
      {
        id: "d1-6",
        time: "12:00",
        endTime: "13:30",
        title: "Almuerzo Libre",
        location: "Zona gastronómica",
        type: "break",
      },
      {
        id: "d1-7",
        time: "13:30",
        endTime: "15:00",
        title: "Presentación de Artículos — Sesión 1",
        speaker: "Autores seleccionados",
        location: "Salas A, B y C",
        type: "conference",
        track: "Ponencias",
        description: "Presentación paralela de artículos aprobados en múltiples tracks temáticos.",
      },
      {
        id: "d1-8",
        time: "15:00",
        endTime: "16:30",
        title: "Workshop: Diseño de Soluciones con IoT",
        speaker: "Ing. Antonio José Madrid Ramos",
        speakerRole: "Coordinador / PROES — España",
        location: "Laboratorio de Innovación",
        type: "workshop",
        track: "IoT",
        capacity: 30, // máximo 30 asistentes presenciales
      },
      {
        id: "d1-9",
        time: "16:30",
        endTime: "17:30",
        title: "Networking & Exposición de Proyectos",
        location: "Hall de Exposiciones",
        type: "networking",
      },
    ],
  },
  {
    date: "2025-10-02",
    label: "Día 2",
    subtitle: "Jueves 2 de Octubre — Conferencias y Workshops",
    sessions: [
      {
        id: "d2-1",
        time: "08:00",
        endTime: "08:30",
        title: "Registro y Coffee",
        location: "Hall Principal",
        type: "break",
      },
      {
        id: "d2-2",
        time: "08:30",
        endTime: "09:30",
        title: "Ingeniería Sostenible y Ciudades Inteligentes",
        speaker: "Arq. Francisco Pardo Campo",
        speakerRole: "Director / PROES LATAM — España",
        location: "Auditorio Principal",
        type: "keynote",
        track: "Ciudades Inteligentes",
        url: "https://meet.example.com/ciudades-inteligentes",
      },

      {
        id: "d2-3",
        time: "09:30",
        endTime: "11:00",
        title: "Presentación de Artículos — Sesión 2",
        speaker: "Autores seleccionados",
        location: "Salas A, B y C",
        type: "conference",
        track: "Ponencias",
      },
      {
        id: "d2-4",
        time: "11:00",
        endTime: "11:30",
        title: "Coffee Break",
        location: "Zona de Exposiciones",
        type: "break",
      },
      {
        id: "d2-5",
        time: "11:30",
        endTime: "13:00",
        title: "Workshop: Machine Learning Aplicado",
        speaker: "Por confirmar",
        location: "Laboratorio de Innovación",
        type: "workshop",
        track: "Machine Learning",
        capacity: 25,
      },

      {
        id: "d2-6",
        time: "13:00",
        endTime: "14:30",
        title: "Almuerzo Libre",
        location: "Zona gastronómica",
        type: "break",
      },
      {
        id: "d2-7",
        time: "14:30",
        endTime: "15:30",
        title: "Panel: Innovación y Emprendimiento en Ingeniería",
        speaker: "Panel de expertos",
        speakerRole: "Industria y Academia",
        location: "Auditorio Principal",
        type: "panel",
        track: "Emprendimiento",
        description: "Mesa redonda con emprendedores y académicos sobre las oportunidades de innovación.",
      },
      {
        id: "d2-8",
        time: "15:30",
        endTime: "17:00",
        title: "Presentación de Artículos — Sesión 3",
        speaker: "Autores seleccionados",
        location: "Salas A, B y C",
        type: "conference",
        track: "Ponencias",
      },
      {
        id: "d2-9",
        time: "19:00",
        endTime: "22:00",
        title: "Cena de Gala & Networking",
        location: "Por confirmar",
        type: "networking",
        description: "Evento social para fortalecer redes de contacto entre participantes y conferencistas.",
      },
    ],
  },
  {
    date: "2025-10-03",
    label: "Día 3",
    subtitle: "Viernes 3 de Octubre — Workshops y Clausura",
    sessions: [
      {
        id: "d3-1",
        time: "08:00",
        endTime: "08:30",
        title: "Registro y Coffee",
        location: "Hall Principal",
        type: "break",
      },
      {
        id: "d3-2",
        time: "08:30",
        endTime: "10:00",
        title: "Workshop: Ciberseguridad en Infraestructura Crítica",
        speaker: "Por confirmar",
        location: "Laboratorio de Innovación",
        type: "workshop",
        track: "Ciberseguridad",
        capacity: 20,
      },

      {
        id: "d3-3",
        time: "10:00",
        endTime: "11:00",
        title: "Presentación de Artículos — Sesión 4",
        speaker: "Autores seleccionados",
        location: "Salas A y B",
        type: "conference",
        track: "Ponencias",
      },
      {
        id: "d3-4",
        time: "11:00",
        endTime: "11:30",
        title: "Coffee Break",
        location: "Zona de Exposiciones",
        type: "break",
      },
      {
        id: "d3-5",
        time: "11:30",
        endTime: "12:30",
        title: "Conferencia de Cierre: Tendencias 2026 en Ingeniería",
        speaker: "Por confirmar",
        speakerRole: "País Invitado — España",
        location: "Auditorio Principal",
        type: "keynote",
        track: "Tendencias",
      },
      {
        id: "d3-6",
        time: "12:30",
        endTime: "13:30",
        title: "Ceremonia de Clausura y Premiaciones",
        speaker: "Comité Organizador",
        speakerRole: "Universidad Católica de Colombia",
        location: "Auditorio Principal",
        type: "keynote",
        description: "Entrega de premios a mejores artículos y reconocimientos especiales. Cierre oficial del XI CONIITI.",
      },
      {
        id: "d3-7",
        time: "13:30",
        endTime: "15:00",
        title: "Almuerzo de Cierre & Despedida",
        location: "Zona gastronómica",
        type: "networking",
      },
    ],
  },
];
