/**
 * QR único del usuario registrado: se genera una sola vez y contiene su información
 * para que el staff (web master) lo lea y registre asistencia (evita plagio/suplantación).
 */
import { loadUsers, saveUsers } from '@/features/auth/storage'
import type { User } from '@/features/auth/types'

const QR_TOKEN_KEY = 'qrToken'

function randomToken(): string {
  const c = crypto as unknown as { randomUUID?: () => string }
  const u = c?.randomUUID?.()
  if (u) return u
  return `${Date.now()}_${Math.random().toString(36).slice(2, 15)}`
}

export interface StudentQrPayload {
  student_id: string
  nombre: string
  email: string
  qr_token: string
  /** Si viene, el QR es válido solo para esta conferencia (y solo en ventana 10 min antes). */
  conference_id?: string
}

export function getOrCreateStudentQrPayload(
  user: User
): StudentQrPayload | null {
  const users = loadUsers()
  const u = users.find((x) => x.id === user.id)
  if (!u) return null
  let token = u.meta?.[QR_TOKEN_KEY]
  if (!token) {
    token = randomToken()
    const updated = users.map((x) =>
      x.id === user.id
        ? { ...x, meta: { ...x.meta, [QR_TOKEN_KEY]: token } }
        : x
    )
    saveUsers(updated)
  }
  return {
    student_id: u.id,
    nombre: u.nombre,
    email: u.email,
    qr_token: token
  }
}

export function getStudentQrPayloadIfExists(
  user: User
): StudentQrPayload | null {
  const users = loadUsers()
  const u = users.find((x) => x.id === user.id)
  if (!u?.meta?.[QR_TOKEN_KEY]) return null
  return {
    student_id: u.id,
    nombre: u.nombre,
    email: u.email,
    qr_token: u.meta[QR_TOKEN_KEY]
  }
}

export function parseStudentQrPayload(raw: string): StudentQrPayload | null {
  try {
    const obj = JSON.parse(raw) as Record<string, unknown>
    if (
      typeof obj.student_id !== 'string' ||
      typeof obj.qr_token !== 'string' ||
      typeof obj.nombre !== 'string' ||
      typeof obj.email !== 'string'
    )
      return null
    const payload: StudentQrPayload = {
      student_id: obj.student_id,
      nombre: obj.nombre,
      email: obj.email,
      qr_token: obj.qr_token
    }
    if (typeof obj.conference_id === 'string')
      payload.conference_id = obj.conference_id
    return payload
  } catch {
    return null
  }
}

export function verifyStudentQrToken(payload: StudentQrPayload): User | null {
  const users = loadUsers()
  const u = users.find((x) => x.id === payload.student_id)
  if (!u) return null
  if (u.meta?.[QR_TOKEN_KEY] !== payload.qr_token) return null
  return u
}

/** Payload para mostrar QR vinculado a una conferencia (solo válido en ventana 10 min antes). */
export function getStudentQrPayloadForConference(
  user: User,
  conferenceId: string
): StudentQrPayload | null {
  const base =
    getStudentQrPayloadIfExists(user) ?? getOrCreateStudentQrPayload(user)
  if (!base) return null
  return { ...base, conference_id: conferenceId }
}

/** Ventana en ms: 10 min antes del inicio hasta 5 min después del fin. */
const MINUTES_BEFORE = 10
const MINUTES_AFTER = 5

export function isQrWindowOpen(startAt: string, endAt: string): boolean {
  const now = Date.now()
  const start = new Date(startAt).getTime()
  const end = new Date(endAt).getTime()
  const windowStart = start - MINUTES_BEFORE * 60 * 1000
  const windowEnd = end + MINUTES_AFTER * 60 * 1000
  return now >= windowStart && now <= windowEnd
}

/** Minutos restantes para que se abra la ventana del QR (0 si ya está abierta o ya pasó). */
export function minutesUntilQrOpens(startAt: string): number {
  const now = Date.now()
  const start = new Date(startAt).getTime()
  const windowStart = start - MINUTES_BEFORE * 60 * 1000
  if (now >= windowStart) return 0
  return Math.ceil((windowStart - now) / (60 * 1000))
}
