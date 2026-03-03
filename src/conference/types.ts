export interface Conference {
  id: string;
  title: string;
  location?: string;
  startAt: string; // ISO
  endAt: string; // ISO
  createdByUserId: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  conferenceId: string;
  studentId: string;
  deviceId: string;
  markedAt: string;
}

export interface StudentAgendaItem {
  id: string;
  conferenceId: string;
  studentId: string;
  createdAt: string;
}

