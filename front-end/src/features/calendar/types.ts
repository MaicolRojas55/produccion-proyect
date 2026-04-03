import type { Role } from '@/features/auth/types'

export type Audience = 'todos' | 'staff' | 'registrados'

export interface CalendarEvent {
  id: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  title: string
  description?: string
  audience: Audience // "staff" = web_master/super_admin; "registrados" = usuarios registrados
  createdByUserId: string
  attendees: string[] // userIds
  createdByRole: Role
  createdAt: string
}
