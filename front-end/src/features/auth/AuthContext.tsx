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
  ) => Promise<
    | { ok: true; userId: string }
    | { ok: false; reason: string }
  >
  requestActivationOtp: (
    email: string
  ) => Promise<
    | { ok: true }
    | { ok: false; reason: string }
  >
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
          const currentUser = await apiClient.getCurrentUser()
          setUser(currentUser as User)
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
        const response = await apiClient.login({ email, password })

        // Token es guardado automáticamente por apiClient
        const currentUser = await apiClient.getCurrentUser()
        setUser(currentUser as User)

        return { ok: true, user: currentUser as User }
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
      | { ok: true; userId: string }
      | { ok: false; reason: string }
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
        return {
          ok: true,
          userId: response.otp_id
        }
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Error en registro'
        setError(message)

        if (
          err instanceof ApiError &&
          err.status === 400 &&
          /email already registered/i.test(message)
        ) {
          return { ok: false, reason: 'EMAIL_TAKEN' }
        }

        return { ok: false, reason: message }
      }
    },
    []
  )

  const requestActivationOtp = useCallback(
    async (
      email: string
    ): Promise<
      | { ok: true }
      | { ok: false; reason: string }
    > => {
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
