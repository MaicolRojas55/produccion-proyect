/**
 * API Client para conectar con el backend FastAPI
 *
 * Maneja todas las llamadas HTTP, autenticación y errores
 * El token JWT se almacena en localStorage bajo la clave 'pp_session_v1'
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TOKEN_STORAGE_KEY = 'pp_session_v1'

// ============= TIPOS DE AUTENTICACIÓN =============

export interface RegisterRequest {
  full_name: string
  email: string
  password: string
  role: string
}

export interface RegisterResponse {
  message: string
  email_sent: boolean
  otp_id: string
}

export interface VerifyOTPRequest {
  email: string
  code: string
}

export interface VerifyOTPResponse {
  message: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface ResendOTPRequest {
  email: string
}

export interface ResendOTPResponse {
  message: string
  email_sent: boolean
  otp_id: string
}

export interface User {
  id?: string
  _id?: string
  full_name: string
  email: string
  role: 'super_admin' | 'web_master' | 'usuario_registrado'
  is_verified: boolean
  is_active: boolean
  created_at?: string
}

// ============= TIPOS DE ENTIDADES =============

export interface Conference {
  _id?: string
  id?: string
  title: string
  description?: string
  start_at: string
  end_at: string
  location?: string
  capacity?: number
  created_by_user_id?: string
}

export interface StatsOverview {
  users_total: number
  users_by_role: {
    super_admin: number
    web_master: number
    usuario_registrado: number
  }
  users_verified: number
  conferences: number
  agenda_sessions: number
  speakers: number
  calendar_events: number
  student_agenda_items: number
  session_inscriptions: number
  attendance_records: number
}

export interface Speaker {
  _id?: string
  name: string
  title: string
  bio: string
  photo_url?: string
}

export interface Session {
  _id?: string
  title: string
  description: string
  day: string
  start_time: string
  end_time: string
  location: string
  capacity?: number
  speaker_id?: string
}

export interface CalendarEvent {
  _id?: string
  title: string
  description?: string
  start_at: string
  end_at: string
  audience: 'todos' | 'registrados' | 'staff'
  is_announcement: boolean
}

export interface AttendanceRecord {
  _id?: string
  user_id: string
  conference_id: string
  checked_at: string
  qr_token: string
}

// ============= MANEJO DE ERRORES =============

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }

  isUnauthorized(): boolean {
    return this.status === 401
  }

  isForbidden(): boolean {
    return this.status === 403
  }

  isNotFound(): boolean {
    return this.status === 404
  }

  isNetworkError(): boolean {
    return this.status === 0
  }
}

// ============= API CLIENT =============

class ApiClient {
  /**
   * Obtener token JWT del localStorage
   */
  getToken(): string | null {
    try {
      const sessionData = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (!sessionData) return null
      const session = JSON.parse(sessionData)
      return session.token || null
    } catch {
      return null
    }
  }

  /**
   * Guardar token JWT en localStorage
   */
  private setToken(token: string): void {
    try {
      const sessionData = {
        token,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(sessionData))
    } catch {
      console.error('Error guardando token')
    }
  }

  /**
   * Limpiar token del localStorage
   */
  private clearToken(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }

  /**
   * Realizar una petición HTTP genérica
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit & { requiresAuth?: boolean } = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const { requiresAuth = false, ...requestOptions } = options

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(requestOptions.headers as Record<string, string>)
    }

    // Agregar token si se requiere autenticación
    if (requiresAuth) {
      const token = this.getToken()
      if (!token) {
        throw new ApiError(
          401,
          'No hay sesión activa. Por favor inicia sesión.'
        )
      }
      headers['Authorization'] = `Bearer ${token}`
    }

    const config: RequestInit = {
      ...requestOptions,
      headers
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: 'Error desconocido' }))

        const errorMessage =
          typeof errorData.detail === 'string'
            ? errorData.detail
            : `Error ${response.status}`

        throw new ApiError(response.status, errorMessage, errorData)
      }

      // Algunos endpoints retornan texto vacío
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return await response.json()
      }
      return {} as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      if (error instanceof TypeError) {
        throw new ApiError(
          0,
          'Error de conexión. Verifica tu conexión a internet.'
        )
      }

      throw new ApiError(
        0,
        error instanceof Error ? error.message : 'Error desconocido'
      )
    }
  }

  // ============= AUTENTICACIÓN =============

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/token', {
      method: 'POST',
      body: JSON.stringify(data)
    })

    // Guardar token
    if (response.access_token) {
      this.setToken(response.access_token)
    }

    return response
  }

  async verifyOTP(email: string, code: string): Promise<VerifyOTPResponse> {
    // El endpoint espera query params
    const queryString = new URLSearchParams({ email, code }).toString()
    return this.request<VerifyOTPResponse>(`/auth/verify-otp?${queryString}`, {
      method: 'POST'
    })
  }

  async resendOTP(email: string): Promise<ResendOTPResponse> {
    const queryString = new URLSearchParams({ email }).toString()
    return this.request<ResendOTPResponse>(`/auth/resend-otp?${queryString}`, {
      method: 'POST'
    })
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me', {
      requiresAuth: true
    })
  }

  logout(): void {
    this.clearToken()
  }

  // ============= USUARIOS =============

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users/', {
      requiresAuth: true
    })
  }

  async getUser(userId: string): Promise<User> {
    return this.request<User>(`/users/${userId}`, {
      requiresAuth: true
    })
  }

  async updateUser(
    userId: string,
    data: { role: User['role'] }
  ): Promise<User> {
    return this.request<User>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      requiresAuth: true
    })
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}`, {
      method: 'DELETE',
      requiresAuth: true
    })
  }

  async getStatsOverview(): Promise<StatsOverview> {
    return this.request<StatsOverview>('/stats/overview', {
      requiresAuth: true
    })
  }

  // ============= CONFERENCIAS =============

  async getConferences(): Promise<Conference[]> {
    return this.request<Conference[]>('/conferences/')
  }

  async getConference(conferenceId: string): Promise<Conference> {
    return this.request<Conference>(`/conferences/${conferenceId}`)
  }

  async createConference(data: Conference): Promise<Conference> {
    return this.request<Conference>('/conferences/', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true
    })
  }

  async updateConference(
    conferenceId: string,
    data: Partial<Conference>
  ): Promise<Conference> {
    return this.request<Conference>(`/conferences/${conferenceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth: true
    })
  }

  async deleteConference(conferenceId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/conferences/${conferenceId}`, {
      method: 'DELETE',
      requiresAuth: true
    })
  }

  // ============= CONFERENCISTAS =============

  async getSpeakers(): Promise<Speaker[]> {
    return this.request<Speaker[]>('/speakers/')
  }

  async getSpeaker(speakerId: string): Promise<Speaker> {
    return this.request<Speaker>(`/speakers/${speakerId}`)
  }

  async createSpeaker(data: Speaker): Promise<Speaker> {
    return this.request<Speaker>('/speakers/', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true
    })
  }

  async updateSpeaker(
    speakerId: string,
    data: Partial<Speaker>
  ): Promise<Speaker> {
    return this.request<Speaker>(`/speakers/${speakerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth: true
    })
  }

  async deleteSpeaker(speakerId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/speakers/${speakerId}`, {
      method: 'DELETE',
      requiresAuth: true
    })
  }

  // ============= SESIONES DE AGENDA =============

  async getSessions(): Promise<Session[]> {
    return this.request<Session[]>('/sessions/')
  }

  async getSessionsAgenda(): Promise<Session[]> {
    return this.request<Session[]>('/sessions/agenda')
  }

  async getSession(sessionId: string): Promise<Session> {
    return this.request<Session>(`/sessions/${sessionId}`)
  }

  async createSession(data: Session): Promise<Session> {
    return this.request<Session>('/sessions/', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true
    })
  }

  async updateSession(
    sessionId: string,
    data: Partial<Session>
  ): Promise<Session> {
    return this.request<Session>(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth: true
    })
  }

  async deleteSession(sessionId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/sessions/${sessionId}`, {
      method: 'DELETE',
      requiresAuth: true
    })
  }

  // ============= EVENTOS CALENDARIO =============

  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return this.request<CalendarEvent[]>('/calendar/', {
      requiresAuth: true
    })
  }

  async getCalendarEvent(eventId: string): Promise<CalendarEvent> {
    return this.request<CalendarEvent>(`/calendar/${eventId}`, {
      requiresAuth: true
    })
  }

  async createCalendarEvent(data: CalendarEvent): Promise<CalendarEvent> {
    return this.request<CalendarEvent>('/calendar/', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true
    })
  }

  async updateCalendarEvent(
    eventId: string,
    data: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    return this.request<CalendarEvent>(`/calendar/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth: true
    })
  }

  async deleteCalendarEvent(eventId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/calendar/${eventId}`, {
      method: 'DELETE',
      requiresAuth: true
    })
  }

  // ============= AGENDA DE ESTUDIANTE =============

  async getStudentAgenda(): Promise<Conference[]> {
    return this.request<Conference[]>('/student-agenda/', {
      requiresAuth: true
    })
  }

  async addToStudentAgenda(conferenceId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      `/student-agenda/${conferenceId}`,
      {
        method: 'POST',
        requiresAuth: true
      }
    )
  }

  async removeFromStudentAgenda(
    conferenceId: string
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      `/student-agenda/${conferenceId}`,
      {
        method: 'DELETE',
        requiresAuth: true
      }
    )
  }

  // ============= INSCRIPCIONES A SESIONES =============

  async getAgendaInscriptions(): Promise<Session[]> {
    return this.request<Session[]>('/agenda-inscriptions/', {
      requiresAuth: true
    })
  }

  async enrollInSession(sessionId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      `/agenda-inscriptions/${sessionId}`,
      {
        method: 'POST',
        requiresAuth: true
      }
    )
  }

  async cancelSessionEnrollment(
    sessionId: string
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      `/agenda-inscriptions/${sessionId}`,
      {
        method: 'DELETE',
        requiresAuth: true
      }
    )
  }

  async getSessionEnrollmentCount(sessionId: string): Promise<number> {
    return this.request<number>(
      `/agenda-inscriptions/session/${sessionId}/count`
    )
  }

  // ============= ASISTENCIA =============

  async getAttendance(): Promise<AttendanceRecord[]> {
    return this.request<AttendanceRecord[]>('/attendance/', {
      requiresAuth: true
    })
  }

  async registerConferenceAttendance(conferenceId: string): Promise<{
    message: string
    qr_token: string
  }> {
    return this.request<{ message: string; qr_token: string }>(
      `/attendance/conference/${conferenceId}`,
      {
        method: 'POST',
        requiresAuth: true
      }
    )
  }

  async registerSessionAttendance(sessionId: string): Promise<{
    message: string
    qr_token: string
  }> {
    return this.request<{ message: string; qr_token: string }>(
      `/attendance/session/${sessionId}`,
      {
        method: 'POST',
        requiresAuth: true
      }
    )
  }

  // ============= UTILIDADES =============

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      requiresAuth: true
    })
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true
    })
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth: true
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      requiresAuth: true
    })
  }
}

export const apiClient = new ApiClient()
