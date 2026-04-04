import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Download,
  Globe,
  LogOut,
  Trash2,
  ShieldCheck,
  Users,
  Calendar,
  BarChart3,
  Sparkles,
  LayoutList
} from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { apiClient, ApiError, type StatsOverview } from '@/lib/api'

const ROLES_ALL = ['super_admin', 'web_master', 'usuario_registrado'] as const

function sessionUserId(u: unknown): string | undefined {
  if (!u || typeof u !== 'object') return undefined
  const o = u as { id?: string; _id?: string }
  return o.id || o._id
}

interface UserRow {
  id?: string
  _id?: string
  full_name: string
  email: string
  role: (typeof ROLES_ALL)[number]
  is_verified?: boolean
  is_activated?: boolean
}

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const isSuperAdmin = user?.role === 'super_admin'
  const isWebMaster = user?.role === 'web_master'

  const [stats, setStats] = useState<StatsOverview | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const [users, setUsers] = useState<UserRow[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  const loadStats = async () => {
    setStatsLoading(true)
    try {
      const data = await apiClient.getStatsOverview()
      setStats(data)
    } catch {
      setStats(null)
    } finally {
      setStatsLoading(false)
    }
  }

  const loadUsersData = async () => {
    setUsersLoading(true)
    setUsersError(null)
    try {
      const data = await apiClient.getUsers()
      setUsers(data as UserRow[])
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Error al cargar usuarios'
      setUsersError(message)
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    loadUsersData()
  }, [])

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await apiClient.updateUser(userId, {
        role: newRole as UserRow['role']
      })
      toast({ title: 'Rol actualizado' })
      loadUsersData()
      loadStats()
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Error al actualizar rol'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('¿Eliminar este usuario de forma permanente?')) return

    try {
      await apiClient.deleteUser(userId)
      toast({ title: 'Usuario eliminado' })
      loadUsersData()
      loadStats()
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Error al eliminar usuario'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    }
  }

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      users.map((u) => ({
        ID: u.id || u._id,
        Nombre: u.full_name,
        Email: u.email,
        Role: u.role,
        Verificado: (u.is_verified ?? u.is_activated) ? 'Sí' : 'No'
      }))
    )
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios')
    XLSX.writeFile(wb, 'Usuarios_Backup.xlsx')
    toast({ title: 'Backup exportado' })
  }

  const panelTitle = isSuperAdmin ? 'Panel Super Admin' : 'Panel Web Master'
  const panelHint = isSuperAdmin
    ? 'Estadísticas, usuarios y roles. Las reuniones se gestionan en el editor de contenido.'
    : 'Estadísticas y listado de usuarios (solo lectura de roles). Las reuniones se gestionan en el editor de contenido.'

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <span className="font-heading font-black text-lg tracking-tight">
                CONIITI
              </span>
            </Link>
            <div className="h-6 w-px bg-border max-sm:hidden" />
            <div className="leading-tight">
              <div className="font-heading font-black flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                {panelTitle}
              </div>
              <div className="text-xs text-muted-foreground">
                {user?.full_name || 'Staff'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-700 capitalize"
            >
              {user?.role?.replace(/_/g, ' ') || 'staff'}
            </Badge>
            {(isWebMaster || isSuperAdmin) && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/web-master">
                  <LayoutList className="h-4 w-4 mr-2" />
                  Editor de reuniones
                </Link>
              </Button>
            )}
            <Button variant="secondary" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resumen</h1>
          <p className="text-sm text-muted-foreground mt-1">{panelHint}</p>
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Estadísticas</h2>
          </div>
          {statsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse h-28 bg-muted/40" />
              ))}
            </div>
          ) : stats ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.users_total}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Verificados: {stats.users_verified}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Por rol</CardTitle>
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="text-xs space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Super Admin</span>
                    <span className="font-medium text-foreground">
                      {stats.users_by_role.super_admin}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Web Master</span>
                    <span className="font-medium text-foreground">
                      {stats.users_by_role.web_master}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Registrados</span>
                    <span className="font-medium text-foreground">
                      {stats.users_by_role.usuario_registrado}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Reuniones</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.conferences}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sesiones agenda API: {stats.agenda_sessions}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Actividad</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="text-xs space-y-1 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Calendario</span>
                    <span className="font-medium text-foreground">
                      {stats.calendar_events}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inscripciones</span>
                    <span className="font-medium text-foreground">
                      {stats.session_inscriptions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Asistencias</span>
                    <span className="font-medium text-foreground">
                      {stats.attendance_records}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No se pudieron cargar las estadísticas.
            </p>
          )}
        </section>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Usuarios</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {isSuperAdmin
                  ? 'Puedes cambiar roles y eliminar cuentas.'
                  : 'Listado informativo. Solo el Super Admin puede cambiar roles o eliminar cuentas.'}
              </p>
            </div>
            <Button onClick={exportToExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar a Excel
            </Button>
          </div>

          {usersError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {usersError}
            </div>
          )}

          {usersLoading ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Cargando usuarios…</p>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Verificado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-muted-foreground"
                        >
                          Sin usuarios
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((u) => {
                        const uid = (u.id || u._id) as string
                        return (
                          <TableRow key={uid}>
                            <TableCell className="font-medium">
                              {u.full_name}
                            </TableCell>
                            <TableCell className="text-sm">{u.email}</TableCell>
                            <TableCell>
                              {isSuperAdmin ? (
                                <Select
                                  value={u.role}
                                  onValueChange={(newRole) =>
                                    handleUpdateUserRole(uid, newRole)
                                  }
                                >
                                  <SelectTrigger className="w-[200px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ROLES_ALL.map((role) => (
                                      <SelectItem key={role} value={role}>
                                        <span className="capitalize">
                                          {role.replace(/_/g, ' ')}
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="capitalize"
                                >
                                  {u.role.replace(/_/g, ' ')}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  u.is_verified ?? u.is_activated
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {u.is_verified ?? u.is_activated ? 'Sí' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {isSuperAdmin ? (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteUser(uid)}
                                  disabled={uid === sessionUserId(user)}
                                  title={
                                    uid === sessionUserId(user)
                                      ? 'No puedes eliminarte a ti mismo'
                                      : 'Eliminar usuario'
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
