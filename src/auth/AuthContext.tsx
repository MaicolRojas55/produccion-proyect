import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { Role, User } from './types'
import {
  clearSession,
  loadSession,
  loadUsers,
  saveSession,
  saveUsers
} from './storage'
import { getDeviceId } from '@/device/device'
import { issueOtp, verifyAndConsumeOtp } from '@/otp/otp'

type LoginInput = {
  email: string
  password: string
}

type RegisterInput = {
  nombre: string
  email: string
  telefono?: string
  password: string
  // role is ignored by the implementation; all registrations
  // become "usuario_registrado" automatically
  role?: Role
}

type AuthContextValue = {
  user: User | null
  login: (
    input: LoginInput
  ) => { ok: true; user: User } | { ok: false; reason: 'INVALID' }
  register: (
    input: RegisterInput
  ) => { ok: true; userId: string } | { ok: false; reason: 'EMAIL_TAKEN' }
  requestActivationOtp: (
    userId: string
  ) => { ok: true; otpSimulado: string } | { ok: false }
  activateAccount: (input: {
    userId: string
    otp: string
  }) => { ok: true } | { ok: false }
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function newId() {
  const c = crypto as unknown as { randomUUID?: () => string }
  return (
    c?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`
  )
}

function normalizeRole(role: string | undefined): User['role'] {
  if (
    role === 'super_admin' ||
    role === 'web_master' ||
    role === 'usuario_registrado'
  )
    return role as User['role']
  // map legacy roles to modern equivalents
  if (role === 'superadmin' || role === 'admin') return 'super_admin'
  if (role === 'webmaster' || role === 'profesor') return 'web_master'
  if (role === 'estudiante') return 'usuario_registrado'
  return 'usuario_registrado'
}

function loadUserFromSession(): User | null {
  const session = loadSession()
  if (!session) return null
  const users = loadUsers()
  const u = users.find((x) => x.id === session.userId) ?? null
  if (!u) return null
  return { ...u, role: normalizeRole(u.role) }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUserFromSession)

  useEffect(() => {
    getDeviceId()
    // App.tsx is now responsible for injecting test admin users directly.
  }, [])

  const login = useCallback(
    ({
      email,
      password
    }: LoginInput):
      | { ok: true; user: User }
      | { ok: false; reason: 'INVALID' } => {
      const users = loadUsers()
      console.log('Available users:', users)
      let u =
        users.find(
          (x) =>
            x.email.toLowerCase() === email.trim().toLowerCase() &&
            x.password === password
        ) ?? null
      if (!u) {
        console.log('No user found with email:', email)
        return { ok: false, reason: 'INVALID' }
      }
      u = { ...u, role: normalizeRole(u.role) }
      // registered users must be activated before login
      if (u.role === 'usuario_registrado' && !u.activated) {
        console.log('User not activated:', u)
        return { ok: false, reason: 'INVALID' }
      }
      saveSession({ userId: u.id })
      setUser(u)
      return { ok: true, user: u }
    },
    []
  )

  const register = useCallback(
    ({
      nombre,
      email,
      telefono,
      password,
      role
    }: RegisterInput):
      | { ok: true; userId: string }
      | { ok: false; reason: 'EMAIL_TAKEN' } => {
      const users = loadUsers()
      const exists = users.some(
        (x) => x.email.toLowerCase() === email.trim().toLowerCase()
      )
      if (exists) return { ok: false, reason: 'EMAIL_TAKEN' }
      const deviceId = getDeviceId()
      // for this page all new users are 'usuario_registrado'
      const roleNorm: Role = 'usuario_registrado'
      const u: User = {
        id: newId(),
        nombre: nombre.trim(),
        email: email.trim(),
        password,
        role: roleNorm,
        telefono: telefono?.trim() || undefined,
        activated: false, // will activate via OTP
        primaryDeviceId:
          roleNorm === 'usuario_registrado' ? deviceId : undefined,
        createdAt: new Date().toISOString()
      }
      saveUsers([...users, u])
      // no immediate login for registered users; they will sign in after activation
      return { ok: true, userId: u.id }
    },
    []
  )

  const requestActivationOtp = useCallback(
    (userId: string): { ok: true; otpSimulado: string } | { ok: false } => {
      const users = loadUsers()
      const u = users.find((x) => x.id === userId) ?? null
      if (!u) return { ok: false }
      const rec = issueOtp({
        purpose: 'activate_account',
        userId,
        ttlSeconds: 5 * 60
      })
      return { ok: true, otpSimulado: rec.otp }
    },
    []
  )

  const activateAccount = useCallback(
    ({ userId, otp }: { userId: string; otp: string }) => {
      const ok = verifyAndConsumeOtp({
        purpose: 'activate_account',
        userId,
        otp
      }).ok
      if (!ok) return { ok: false }
      const users = loadUsers()
      const updated = users.map((u) =>
        u.id === userId ? { ...u, activated: true } : u
      )
      saveUsers(updated)
      saveSession({ userId })
      const u = updated.find((x) => x.id === userId) ?? null
      if (u) setUser({ ...u, role: normalizeRole(u.role) })
      return { ok: true }
    },
    []
  )

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login,
      register,
      requestActivationOtp,
      activateAccount,
      logout
    }),
    [user, login, register, requestActivationOtp, activateAccount, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
