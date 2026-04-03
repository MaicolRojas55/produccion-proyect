// API Client para conectar con el backend FastAPI
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: 'Error desconocido' }))
        throw new ApiError(
          response.status,
          errorData.detail || `Error ${response.status}`
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      // Error de red
      throw new ApiError(
        0,
        'Error de conexión. Verifica tu conexión a internet.'
      )
    }
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        role: data.role
      })
    })
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    return this.request<VerifyOTPResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        code: data.code
      })
    })
  }

  async resendOTP(data: ResendOTPRequest): Promise<ResendOTPResponse> {
    return this.request<ResendOTPResponse>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email
      })
    })
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/token', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password
      })
    })
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers: token
        ? {
            Authorization: `Bearer ${token}`
          }
        : undefined
    })
  }

  async getCurrentUser(token: string) {
    return this.get('/auth/me', token)
  }
}

export const apiClient = new ApiClient()
export { ApiError }
