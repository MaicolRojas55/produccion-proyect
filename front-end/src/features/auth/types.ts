// Application roles (registration only creates usuario_registrado).
//
// * super_admin: acceso completo al sistema.
// * web_master: puede crear salas/ponentes y editar horarios (staff role).
// * usuario_registrado: usuarios que se inscriben y pueden generar código/visualizar conferencias.
export type Role = 'super_admin' | 'web_master' | 'usuario_registrado'

export interface User {
  id: string
  // Backend usa full_name; nombre se mantiene por compatibilidad local.
  full_name?: string
  nombre?: string
  email: string
  role: Role
  telefono?: string
  activated?: boolean
  primaryDeviceId?: string
  password?: string
  createdAt?: string
  meta?: Record<string, string>
}

export interface Session {
  userId: string
}

/** Roles que tienen acceso al dashboard (salas, ponentes, configuración). */
export function isStaffRole(role: Role): boolean {
  return role === 'super_admin' || role === 'web_master'
}

/** Usuarios registrados que pueden inscribirse y ver conferencias. */
export function isRegisteredUserRole(role: Role): boolean {
  return role === 'usuario_registrado'
}
