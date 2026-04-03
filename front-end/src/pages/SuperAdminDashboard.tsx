import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Plus,
  QrCode,
  Users,
  Columns3,
  Image as ImageIcon,
  LayoutList,
  Check,
  Calendar,
  Save,
  ShieldCheck
} from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { getDeviceId } from '@/features/device/device'
import { loadUsers, saveUsers } from '@/features/auth/storage'
import {
  loadAttendance,
  loadConferences,
  saveAttendance,
  saveConferences
} from '@/features/conference/storage'
import type { Conference } from '@/features/conference/types'
import type { Role, User } from '@/features/auth/types'
import {
  parseStudentQrPayload,
  verifyStudentQrToken
} from '@/features/student-qr/studentQr'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEditableAgenda } from '@/features/agenda/storage'
import SessionCard from '@/components/shared/SessionCard'
import { Session, SessionType } from '@/data/agendaData'

type Tab =
  | 'reuniones'
  | 'admin'
  | 'cms_resumen'
  | 'cms_agenda'
  | 'cms_media'
  | 'cms_logs'

const ROLES: Role[] = ['super_admin', 'web_master', 'usuario_registrado']
const COLORS = ['#8b5cf6', '#eab308', '#3b82f6']
const AUDIT_LOGS = [
  {
    id: 1,
    date: '2024-04-01 10:20',
    user: 'webmaster@test.com',
    action: 'Edición',
    resource: 'Agenda Día 1'
  },
  {
    id: 2,
    date: '2024-04-01 09:15',
    user: 'webmaster@test.com',
    action: 'Subida de Logo',
    resource: 'sponsor_1.png'
  }
]

function newId() {
  const c = crypto as unknown as { randomUUID?: () => string }
  return (
    c?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`
  )
}
function nowIso() {
  return new Date().toISOString()
}
function formatIsoShort(iso: string) {
  return new Date(iso).toLocaleString()
}
function toCsv(rows: string[][]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  return rows.map((r) => r.map((x) => esc(x)).join(',')).join('\n')
}
function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const MINUTES_BEFORE = 10
function isWithinQrWindow(conf: Conference): { ok: boolean; message?: string } {
  const now = Date.now()
  const startMs = new Date(conf.startAt).getTime()
  const windowStart = startMs - MINUTES_BEFORE * 60 * 1000
  const windowEnd = new Date(conf.endAt).getTime() + 5 * 60 * 1000
  if (now < windowStart) {
    const minLeft = Math.ceil((windowStart - now) / 60000)
    return {
      ok: false,
      message: `QR válido desde ${MINUTES_BEFORE} min antes. Vuelve en ${minLeft} min.`
    }
  }
  if (now > windowEnd)
    return {
      ok: false,
      message: 'Reunión finalizada. No se puede registrar asistencia.'
    }
  return { ok: true }
}

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const isAdmin = user?.role === 'super_admin'
  const isWebMaster = user?.role === 'web_master'
  const [activeTab, setActiveTab] = useState<Tab>(
    isWebMaster ? 'cms_resumen' : 'reuniones'
  )
  const [tick, setTick] = useState(0)

  // --- QR state ---
  const [createOpen, setCreateOpen] = useState(false)
  const [readQrFor, setReadQrFor] = useState<Conference | null>(null)
  const [readQrRaw, setReadQrRaw] = useState('')
  const [readQrError, setReadQrError] = useState<string | null>(null)
  const [readQrSuccess, setReadQrSuccess] = useState(false)
  const [detailsFor, setDetailsFor] = useState<Conference | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')

  // --- Admin state ---
  const [allUsers, setAllUsers] = useState<User[]>([])

  // --- CMS state ---
  const { agenda, updateAgenda } = useEditableAgenda()
  const [selectedDayIdx, setSelectedDayIdx] = useState(0)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  )
  const [formData, setFormData] = useState<Partial<Session> | null>(null)
  const editor = useEditor({
    extensions: [StarterKit],
    content: formData?.description || '',
    onUpdate: ({ editor }) =>
      setFormData((prev) =>
        prev ? { ...prev, description: editor.getHTML() } : null
      )
  })
  useEffect(() => {
    if (editor && formData && formData.description !== editor.getHTML())
      editor.commands.setContent(formData.description || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionId])

  useEffect(() => {
    setAllUsers(loadUsers())
  }, [user])
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const conferences = useMemo(() => {
    void tick
    return loadConferences()
  }, [tick])
  const attendance = useMemo(() => {
    void tick
    return loadAttendance()
  }, [tick])
  const studentsById = useMemo(() => {
    return new Map(
      loadUsers()
        .filter((u) => u.role === 'usuario_registrado')
        .map((u) => [u.id, u])
    )
  }, [])

  const confIds = new Set(conferences.map((c) => c.id))
  const myAttendance = attendance.filter((a) => confIds.has(a.conferenceId))
  const uniqueStudents = new Set(myAttendance.map((a) => a.studentId))
  const activeDay = agenda[selectedDayIdx]
  const totalSessionsCount = agenda.reduce(
    (acc, d) => acc + d.sessions.length,
    0
  )

  const roleCounts: Record<string, number> = allUsers.reduce(
    (acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  const statData = ROLES.map((r) => ({
    name: r.replace('_', ' '),
    value: roleCounts[r] || 0
  }))

  const handleRoleChange = (userId: string, newRole: Role) => {
    const updated = allUsers.map((u) =>
      u.id === userId ? { ...u, role: newRole } : u
    )
    setAllUsers(updated)
    saveUsers(updated)
    toast({ title: 'Rol Actualizado' })
  }
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      allUsers.map((u) => ({
        ID: u.id,
        Nombre: u.nombre,
        Email: u.email,
        Role: u.role,
        Activado: u.activated ? 'Sí' : 'No'
      }))
    )
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios')
    XLSX.writeFile(wb, 'Usuarios_Backup.xlsx')
    toast({ title: 'Backup Exportado' })
  }
  const handleSelectSession = (id: string) => {
    const s = activeDay?.sessions.find((x) => x.id === id)
    if (s) {
      setSelectedSessionId(s.id)
      setFormData({ ...s })
    }
  }
  const handleSaveSession = () => {
    if (!formData || !selectedSessionId) return
    const newAgenda = [...agenda]
    const daySessions = [...newAgenda[selectedDayIdx].sessions]
    const sIdx = daySessions.findIndex((s) => s.id === selectedSessionId)
    if (sIdx > -1) {
      daySessions[sIdx] = { ...daySessions[sIdx], ...formData } as Session
      newAgenda[selectedDayIdx].sessions = daySessions
      updateAgenda(newAgenda)
      toast({ title: 'Agenda Guardada' })
    }
  }
  const handleCreateNewSession = () => {
    const newSession: Session = {
      id: newId(),
      time: '10:00',
      endTime: '11:00',
      title: 'Nueva Sesión',
      type: 'conference',
      location: 'Auditorio Principal',
      speaker: 'Por confirmar'
    }
    const newAgenda = [...agenda]
    newAgenda[selectedDayIdx].sessions.push(newSession)
    updateAgenda(newAgenda)
    setSelectedSessionId(newSession.id)
    setFormData(newSession)
    toast({ title: 'Sesión creada' })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
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
                {isAdmin ? 'Panel Super Admin' : 'Panel Web Master'}
              </div>
              <div className="text-xs text-muted-foreground">
                {user?.nombre}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={`capitalize ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'}`}
            >
              {isAdmin ? 'super_admin' : 'web_master'}
            </Badge>
            <Button variant="secondary" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid gap-6">
        {/* Tabs */}
        <div className="flex bg-white rounded-lg p-1 shadow-sm border overflow-x-auto w-full md:w-fit mb-4">
          {(
            [
              ...(isAdmin
                ? [{ key: 'reuniones', label: 'Reuniones y QR' }]
                : []),
              ...(isAdmin
                ? [
                    {
                      key: 'admin',
                      label: 'Administración Global',
                      icon: <ShieldCheck className="w-4 h-4" />
                    }
                  ]
                : []),
              {
                key: 'cms_resumen',
                label: 'Resumen CMS',
                icon: <Columns3 className="w-4 h-4" />
              },
              {
                key: 'cms_agenda',
                label: 'Editor de Agenda',
                icon: <LayoutList className="w-4 h-4" />
              },
              {
                key: 'cms_media',
                label: 'Media',
                icon: <ImageIcon className="w-4 h-4" />
              },
              {
                key: 'cms_logs',
                label: 'Auditoría',
                icon: <Check className="w-4 h-4" />
              }
            ] as { key: Tab; label: string; icon?: React.ReactNode }[]
          ).map((t) => (
            <Button
              key={t.key}
              variant={activeTab === t.key ? 'default' : 'ghost'}
              onClick={() => setActiveTab(t.key)}
              className="flex gap-1.5 items-center text-sm"
            >
              {t.icon}
              {t.label}
            </Button>
          ))}
        </div>

        {/* ---- REUNIONES TAB ---- */}
        {activeTab === 'reuniones' && isAdmin && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-5">
                <div className="text-sm text-muted-foreground">
                  Reuniones creadas
                </div>
                <div className="text-3xl font-heading font-black">
                  {conferences.length}
                </div>
              </Card>
              <Card className="p-5">
                <div className="text-sm text-muted-foreground">
                  Asistencias registradas
                </div>
                <div className="text-3xl font-heading font-black">
                  {myAttendance.length}
                </div>
              </Card>
              <Card className="p-5">
                <div className="text-sm text-muted-foreground">
                  Usuarios únicos
                </div>
                <div className="text-3xl font-heading font-black">
                  {uniqueStudents.size}
                </div>
              </Card>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-heading font-black text-xl">
                  Reuniones (Simulador QR)
                </div>
                <div className="text-sm text-muted-foreground">
                  Crea reuniones y registra asistencia por QR.
                </div>
              </div>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Reunión
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Nueva Reunión Simulada</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Título</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Ubicación</Label>
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label>Inicio (ISO)</Label>
                        <Input
                          value={startAt}
                          onChange={(e) => setStartAt(e.target.value)}
                          placeholder="2026-03-03T10:00:00"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Fin</Label>
                        <Input
                          value={endAt}
                          onChange={(e) => setEndAt(e.target.value)}
                          placeholder="2026-03-03T11:00:00"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setCreateError(null)
                        if (!title.trim()) {
                          setCreateError('Ponle un título.')
                          return
                        }
                        const conf: Conference = {
                          id: newId(),
                          title: title.trim(),
                          location: location.trim() || undefined,
                          startAt: startAt.trim() || nowIso(),
                          endAt: endAt.trim() || nowIso(),
                          createdByUserId: user!.id,
                          createdAt: nowIso()
                        }
                        if (isNaN(new Date(conf.startAt).getTime())) {
                          setCreateError('Fecha inválida.')
                          return
                        }
                        saveConferences([...loadConferences(), conf])
                        setTick((t) => t + 1)
                        setCreateOpen(false)
                      }}
                    >
                      Guardar
                    </Button>
                    {createError && (
                      <div className="text-sm text-red-600">{createError}</div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Card className="p-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Asistencias</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conferences.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">
                        Sin reuniones aún.
                      </TableCell>
                    </TableRow>
                  ) : (
                    conferences.map((c) => {
                      const count = myAttendance.filter(
                        (a) => a.conferenceId === c.id
                      ).length
                      const uniq = new Set(
                        myAttendance
                          .filter((a) => a.conferenceId === c.id)
                          .map((a) => a.studentId)
                      ).size
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">
                            {c.title}
                            {c.location && (
                              <div className="text-xs text-muted-foreground">
                                {c.location}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatIsoShort(c.startAt)} →{' '}
                            {formatIsoShort(c.endAt)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-semibold">{count}</div>
                            <div className="text-xs text-muted-foreground">
                              {uniq} único(s)
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setDetailsFor(c)}
                              >
                                Ver detalle
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setReadQrFor(c)
                                  setReadQrRaw('')
                                  setReadQrError(null)
                                  setReadQrSuccess(false)
                                }}
                              >
                                <QrCode className="h-4 w-4 mr-2" />
                                Leer QR
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* ---- ADMIN TAB ---- */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Administración Global del Sistema
              </h2>
              <Button onClick={exportToExcel} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar Usuarios (Excel)
              </Button>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <Card className="shadow-lg border-none bg-white/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Usuarios por Rol</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={statData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-none bg-white/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Distribución de Usuarios</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex justify-center">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={statData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label
                      >
                        {statData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle>Gestión de Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol Actual</TableHead>
                        <TableHead>Cambiar Rol</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">
                            {u.nombre}
                          </TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{u.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              defaultValue={u.role}
                              onValueChange={(val: Role) =>
                                handleRoleChange(u.id, val)
                              }
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLES.map((r) => (
                                  <SelectItem key={r} value={r}>
                                    {r}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ---- CMS RESUMEN ---- */}
        {activeTab === 'cms_resumen' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-gray-800">
              Panel CMS en Vivo
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-none bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardContent className="p-6">
                  <div className="text-sm opacity-90 mb-1">
                    Total Sesiones Reales
                  </div>
                  <div className="text-4xl font-black">
                    {totalSessionsCount}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <CardContent className="p-6">
                  <div className="text-sm opacity-90 mb-1">Días de Evento</div>
                  <div className="text-4xl font-black">{agenda.length}</div>
                </CardContent>
              </Card>
              <Card className="border-none bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                <CardContent className="p-6">
                  <div className="text-sm opacity-90 mb-1">Status Web</div>
                  <div className="text-4xl font-black">Sync</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ---- CMS AGENDA ---- */}
        {activeTab === 'cms_agenda' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
            <Card className="lg:col-span-3 shadow-sm border-none bg-white">
              <CardHeader className="py-4 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Días &amp; Sesiones</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCreateNewSession}
                  >
                    <Plus className="w-5 h-5 text-purple-600" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-4">
                <Select
                  value={String(selectedDayIdx)}
                  onValueChange={(v) => {
                    setSelectedDayIdx(Number(v))
                    setSelectedSessionId(null)
                  }}
                >
                  <SelectTrigger className="mb-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {agenda.map((d, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {activeDay?.sessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleSelectSession(s.id)}
                      className={`p-3 rounded-md cursor-pointer border text-sm transition-colors ${selectedSessionId === s.id ? 'bg-purple-100 border-purple-300' : 'hover:bg-slate-50'}`}
                    >
                      <div className="font-semibold text-gray-800 line-clamp-1">
                        {s.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {s.time} - {s.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {formData && selectedSessionId ? (
              <Card className="lg:col-span-5 shadow-lg border-none bg-white">
                <CardHeader className="border-b pb-4 mb-4">
                  <CardTitle className="text-xl flex items-center justify-between">
                    Editar Sesión
                    <Button
                      size="sm"
                      onClick={handleSaveSession}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Hora Inicio</label>
                      <Input
                        value={formData.time}
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Hora Fin</label>
                      <Input
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData({ ...formData, endTime: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Título</label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        Conferencista
                      </label>
                      <Input
                        value={formData.speaker || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, speaker: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Lugar</label>
                      <Input
                        value={formData.location || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Tipo</label>
                      <Select
                        value={formData.type}
                        onValueChange={(v: SessionType) =>
                          setFormData({ ...formData, type: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            'keynote',
                            'conference',
                            'workshop',
                            'panel',
                            'networking',
                            'break'
                          ].map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Track</label>
                      <Input
                        value={formData.track || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, track: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1 pt-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <div className="border rounded-lg overflow-hidden bg-white shadow-sm mt-1">
                      <div className="bg-slate-50 p-2 flex gap-2 border-b">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            editor?.chain().focus().toggleBold().run()
                          }
                          className={
                            editor?.isActive('bold') ? 'bg-slate-200' : ''
                          }
                        >
                          B
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            editor?.chain().focus().toggleItalic().run()
                          }
                          className={
                            editor?.isActive('italic') ? 'bg-slate-200' : ''
                          }
                        >
                          I
                        </Button>
                      </div>
                      <div className="p-3 min-h-[150px]">
                        <EditorContent
                          editor={editor}
                          className="prose prose-sm max-w-none focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-12 text-center text-gray-400 bg-slate-50 rounded-xl border border-dashed">
                <Calendar className="w-12 h-12 mb-4 text-gray-300" />
                <p>Selecciona una sesión para editarla.</p>
              </div>
            )}
            <div className="lg:col-span-4">
              <div className="sticky top-6">
                <h3 className="font-semibold text-gray-500 mb-4 flex items-center uppercase tracking-wide text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                  Vista Previa Vivo
                </h3>
                {formData ? (
                  <div className="pointer-events-none opacity-90 scale-[0.95] origin-top">
                    <SessionCard
                      sessionId={formData.id!}
                      index={0}
                      sessionDate={activeDay?.date}
                      isLoggedIn={false}
                      isInscribed={false}
                      totalInscriptions={0}
                      time={formData.time!}
                      endTime={formData.endTime!}
                      title={formData.title!}
                      type={formData.type!}
                      speaker={formData.speaker}
                      location={formData.location!}
                      track={formData.track}
                      description={formData.description}
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
                    <span className="text-gray-400 text-sm">
                      Previsualización
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ---- CMS MEDIA ---- */}
        {activeTab === 'cms_media' && (
          <Card className="shadow-lg border-none bg-white animate-in fade-in duration-300">
            <CardHeader>
              <CardTitle>Gestor de Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-64 bg-slate-50 relative overflow-hidden">
                <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500">Arrastra imágenes aquí</p>
                <Input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---- CMS LOGS ---- */}
        {activeTab === 'cms_logs' && (
          <Card className="shadow-lg border-none bg-white animate-in fade-in duration-300">
            <CardHeader>
              <CardTitle>Auditoría CMS</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Recurso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {AUDIT_LOGS.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.date}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell className="font-semibold text-blue-600">
                        {log.action}
                      </TableCell>
                      <TableCell>{log.resource}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* --- QR Dialogs --- */}
        <Dialog
          open={!!readQrFor}
          onOpenChange={(o) => {
            if (!o) {
              setReadQrFor(null)
              setReadQrRaw('')
              setReadQrError(null)
              setReadQrSuccess(false)
            }
          }}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar Asistencia — Leer QR</DialogTitle>
            </DialogHeader>
            {readQrFor && (
              <div className="grid gap-3">
                <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-800">
                  <strong>Aviso:</strong> El QR es válido desde 10 min antes del
                  inicio.
                </div>
                <Input
                  value={readQrRaw}
                  onChange={(e) => setReadQrRaw(e.target.value)}
                  placeholder='{"student_id":"..."}'
                  className="font-mono text-xs"
                />
                <Button
                  onClick={() => {
                    setReadQrError(null)
                    setReadQrSuccess(false)
                    const wk = isWithinQrWindow(readQrFor)
                    if (!wk.ok) {
                      setReadQrError(wk.message ?? 'Fuera de horario.')
                      return
                    }
                    const payload = parseStudentQrPayload(readQrRaw)
                    if (!payload) {
                      setReadQrError('Código inválido.')
                      return
                    }
                    const studentUser = verifyStudentQrToken(payload)
                    if (!studentUser) {
                      setReadQrError('Token inválido.')
                      return
                    }
                    if (
                      payload.conference_id &&
                      payload.conference_id !== readQrFor.id
                    ) {
                      setReadQrError('QR de otra reunión.')
                      return
                    }
                    const all = loadAttendance()
                    if (
                      all.some(
                        (a) =>
                          a.studentId === studentUser.id &&
                          a.conferenceId === readQrFor.id
                      )
                    ) {
                      setReadQrError('Asistencia duplicada.')
                      return
                    }
                    saveAttendance([
                      ...all,
                      {
                        id: newId(),
                        conferenceId: readQrFor.id,
                        studentId: studentUser.id,
                        deviceId: getDeviceId(),
                        markedAt: nowIso()
                      }
                    ])
                    setTick((t) => t + 1)
                    setReadQrSuccess(true)
                    setReadQrRaw('')
                  }}
                >
                  Registrar
                </Button>
                {readQrError && (
                  <p className="text-sm text-destructive">{readQrError}</p>
                )}
                {readQrSuccess && (
                  <p className="text-sm text-green-600 font-medium">
                    Asistencia registrada exitosamente.
                  </p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
        <Dialog
          open={!!detailsFor}
          onOpenChange={(o) => !o && setDetailsFor(null)}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalles de Reunión</DialogTitle>
            </DialogHeader>
            {detailsFor && (
              <Button
                variant="secondary"
                onClick={() => {
                  const confAtt = myAttendance.filter(
                    (a) => a.conferenceId === detailsFor.id
                  )
                  const rows = [
                    [
                      'conference_id',
                      'title',
                      'student_id',
                      'nombre',
                      'marked_at'
                    ],
                    ...confAtt.map((a) => [
                      a.conferenceId,
                      detailsFor.title,
                      a.studentId,
                      studentsById.get(a.studentId)?.nombre ?? '',
                      a.markedAt
                    ])
                  ]
                  downloadText(`asistencia_${detailsFor.id}.csv`, toCsv(rows))
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar CSV
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
