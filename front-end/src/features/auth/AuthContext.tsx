import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import type { Role, User } from './types'
import { getDeviceId } from '@/features/device/device'
import { apiClient, ApiError } from '@/lib/api'

/** Normaliza la respuesta de `/auth/me` para que siempre exista `id` (evita UX rota en Agenda). */
function mapBackendUser(data: unknown): User | null {
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  const rawId = o.id ?? o._id
  const id =
    typeof rawId === 'string'
      ? rawId
      : rawId !== undefined && rawId !== null
        ? String(rawId)
        : ''
  if (!id) return null

  const email = typeof o.email === 'string' ? o.email : ''
  const role = o.role as User['role']
  if (
    role !== 'super_admin' &&
    role !== 'web_master' &&
    role !== 'usuario_registrado'
  ) {
    return null
  }

  const full_name =
    typeof o.full_name === 'string'
      ? o.full_name
      : typeof o.nombre === 'string'
        ? o.nombre
        : undefined

  return {
    id,
    email,
    role,
    full_name,
    nombre: typeof o.nombre === 'string' ? o.nombre : undefined,
    activated: typeof o.activated === 'boolean' ? o.activated : undefined,
    meta:
      typeof o.meta === 'object' && o.meta !== null && !Array.isArray(o.meta)
        ? (o.meta as Record<string, string>)
        : undefined
  }
}

type LoginInput = {
  email: string
  password: string
}

type RegisterInput = {
  full_name: string
  email: string
  password: string
  role?: Role
}

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (
    input: LoginInput
  ) => Promise<{ ok: true; user: User } | { ok: false; reason: string }>
  register: (
    input: RegisterInput
  ) => Promise<{ ok: true; userId: string } | { ok: false; reason: string }>
  requestActivationOtp: (
    email: string
  ) => Promise<{ ok: true } | { ok: false; reason: string }>
  activateAccount: (input: {
    email: string
    otp: string
  }) => Promise<{ ok: true } | { ok: false; reason: string }>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar usuario del backend cuando la app inicia
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        getDeviceId()
        const token = apiClient.getToken()
        if (token) {
          const payload = await apiClient.getCurrentUser()
          const currentUser = mapBackendUser(payload)
          setUser(currentUser)
          if (!currentUser) apiClient.logout()
        }
      } catch (err) {
        console.log('No usuario autenticado al iniciar')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = useCallback(
    async ({
      email,
      password
    }: LoginInput): Promise<
      { ok: true; user: User } | { ok: false; reason: string }
    > => {
      try {
        setError(null)
        await apiClient.login({ email, password })

        // Token guardado por apiClient; perfil desde /auth/me
        const payload = await apiClient.getCurrentUser()
        const currentUser = mapBackendUser(payload)
        if (!currentUser) {
          apiClient.logout()
          return { ok: false, reason: 'Respuesta de usuario inválida' }
        }
        setUser(currentUser)

        return { ok: true, user: currentUser }
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Error de conexión'
        setError(message)
        return { ok: false, reason: message }
      }
    },
    []
  )

  const register = useCallback(
    async ({
      full_name,
      email,
      password,
      role = 'usuario_registrado'
    }: RegisterInput): Promise<
      { ok: true; userId: string } | { ok: false; reason: string }
    > => {
      try {
        setError(null)
        const response = await apiClient.register({
          full_name,
          email,
          password,
          role
        })

        // No hacer login automáticamente, requiere verificación OTP
        return { ok: true, userId: response.otp_id }
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Error en registro'
        setError(message)
        return { ok: false, reason: message }
      }
    },
    []
  )

  const requestActivationOtp = useCallback(
    async (
      email: string
    ): Promise<{ ok: true } | { ok: false; reason: string }> => {
      try {
        setError(null)
        await apiClient.resendOTP(email)
        return { ok: true }
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Error enviando OTP'
        setError(message)
        return { ok: false, reason: message }
      }
    },
    []
  )

  const activateAccount = useCallback(
    async ({
      email,
      otp
    }: {
      email: string
      otp: string
    }): Promise<{ ok: true } | { ok: false; reason: string }> => {
      try {
        setError(null)
        await apiClient.verifyOTP(email, otp)
        // Ahora puede hacer login
        return { ok: true }
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Error verificando OTP'
        setError(message)
        return { ok: false, reason: message }
      }
    },
    []
  )

  const logout = useCallback(() => {
    apiClient.logout()
    setUser(null)
    setError(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      error,
      login,
      register,
      requestActivationOtp,
      activateAccount,
      logout
    }),
    [
      user,
      isLoading,
      error,
      login,
      register,
      requestActivationOtp,
      activateAccount,
      logout
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth() must be used inside <AuthProvider>')
  return ctx
}
