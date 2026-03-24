import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
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
import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  CalendarDays,
  Copy,
  Download,
  Globe,
  LogOut,
  Plus,
  QrCode,
  Users
} from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { isStaffRole } from '@/features/auth/types'
import { getDeviceId } from '@/features/device/device'
import { loadUsers } from '@/features/auth/storage'
import {
  loadAttendance,
  loadConferences,
  saveAttendance,
  saveConferences
} from '@/features/conference/storage'
import type { Conference, Attendance } from '@/features/conference/types'
import {
  parseStudentQrPayload,
  verifyStudentQrToken
} from '@/features/student-qr/studentQr'

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
  const d = new Date(iso)
  return d.toLocaleString()
}

function toCsv(rows: string[][]) {
  const esc = (v: string) => `"${v.replaceAll('"', '""')}"`
  return rows.map((r) => r.map((x) => esc(x)).join(',')).join('\n')
}

/** Minutos antes del inicio de la reunión en que el QR del usuario registrado se considera válido para registrar asistencia. */
const MINUTES_BEFORE_CONFERENCE_QR_VALID = 10

function isWithinQrWindow(conf: Conference): { ok: boolean; message?: string } {
  const now = Date.now()
  const startMs = new Date(conf.startAt).getTime()
  const endMs = new Date(conf.endAt).getTime()
  const windowStart = startMs - MINUTES_BEFORE_CONFERENCE_QR_VALID * 60 * 1000
  const windowEnd = endMs + 5 * 60 * 1000 // 5 min después del fin
  if (now < windowStart) {
    const minLeft = Math.ceil((windowStart - now) / (60 * 1000))
    return {
      ok: false,
      message: `El QR solo es válido desde ${MINUTES_BEFORE_CONFERENCE_QR_VALID} minutos antes del inicio de esta reunión. Vuelve a intentar en ${minLeft} minuto(s) o más cerca de la hora de inicio.`
    }
  }
  if (now > windowEnd) {
    return {
      ok: false,
      message: 'Esta reunión ya finalizó. No se puede registrar asistencia.'
    }
  }
  return { ok: true }
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

export default function ProfessorDashboard() {
  const { user, logout } = useAuth()
  const [tick, setTick] = useState(0)
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

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const conferences = useMemo(() => {
    void tick
    const all = loadConferences()
    if (!user) return []
    if (user.role === 'web_master') return all
    return all.filter((c) => c.createdByUserId === user.id)
  }, [tick, user])

  const attendance = useMemo(() => {
    void tick
    return loadAttendance()
  }, [tick])

  const studentsById = useMemo(() => {
    const users = loadUsers()
    return new Map(
      users.filter((u) => u.role === 'usuario_registrado').map((u) => [u.id, u])
    )
  }, [])

  if (!user) return null
  if (!isStaffRole(user.role)) {
    return <Navigate to="/agenda" replace />
  }

  const confIds = new Set(conferences.map((c) => c.id))
  const myAttendance = attendance.filter((a) => confIds.has(a.conferenceId))
  const uniqueStudents = new Set(myAttendance.map((a) => a.studentId))

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <span className="font-heading font-black text-lg tracking-tight">CONIITI</span>
            </Link>
            <div className="h-6 w-px bg-border max-sm:hidden" aria-hidden="true" />
            
            <div className="flex items-center gap-2">
            <div className="leading-tight">
              <div className="font-heading font-black">
                {user.role === 'super_admin'
                  ? 'Panel reuniones (pruebas)'
                  : 'Dashboard Web Master'}
              </div>
              <div className="text-xs text-muted-foreground">
                {user.role === 'web_master'
                  ? 'Crear reuniones para probar QR y asistencia 10 min antes'
                  : user.nombre}
              </div>
            </div>
          </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              {user.role.replace('_', ' ')}
            </Badge>
            <Button variant="secondary" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid gap-6">
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
              Usuarios registrados únicos
            </div>
            <div className="text-3xl font-heading font-black">
              {uniqueStudents.size}
            </div>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="font-heading font-black text-xl">Tus reuniones</div>
            <div className="text-sm text-muted-foreground">
              Muestra QR dinámico para asistencia (simulado) y crea más
              reuniones.
            </div>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear reunión
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nueva reunión</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Título</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Conferencia 1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Ubicación</Label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Aula / Meet"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Inicio (ISO o fecha/hora)</Label>
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
                    const conf: Conference = {
                      id: newId(),
                      title: title.trim() || 'Reunión',
                      location: location.trim() || undefined,
                      startAt: startAt.trim() || nowIso(),
                      endAt: endAt.trim() || nowIso(),
                      createdByUserId: user.id,
                      createdAt: nowIso()
                    }
                    if (!title.trim()) {
                      setCreateError('Ponle un título a la reunión.')
                      return
                    }
                    if (
                      Number.isNaN(new Date(conf.startAt).getTime()) ||
                      Number.isNaN(new Date(conf.endAt).getTime())
                    ) {
                      setCreateError(
                        'Inicio/fin inválidos. Usa ISO (ej: 2026-03-03T10:00:00).'
                      )
                      return
                    }
                    const all = loadConferences()
                    saveConferences([...all, conf])
                    setTick((t) => t + 1)
                    setCreateOpen(false)
                    setTitle('')
                    setLocation('')
                    setStartAt('')
                    setEndAt('')
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
                    Aún no has creado reuniones.
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
                        {c.location ? (
                          <div className="text-xs text-muted-foreground">
                            {c.location}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatIsoShort(c.startAt)} → {formatIsoShort(c.endAt)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold">{count}</div>
                        <div className="text-xs text-muted-foreground">
                          {uniq} usuario(s) registrado(s) únicos
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => setDetailsFor(c)}
                          >
                            Ver detalle
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setReadQrFor(c)
                              setReadQrRaw('')
                              setReadQrError(null)
                              setReadQrSuccess(false)
                            }}
                          >
                            <QrCode className="h-4 w-4 mr-2" />
                            Leer QR del usuario registrado
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
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Registrar asistencia — Leer QR del usuario registrado
              </DialogTitle>
            </DialogHeader>
            {readQrFor && (
              <div className="grid gap-3">
                <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
                  <strong>Aviso:</strong> Solo podrás registrar asistencia
                  leyendo el QR del usuario registrado desde{' '}
                  <strong>10 minutos antes</strong> del inicio de esta reunión.
                  Fuera de ese horario el QR se considerará inválido.
                </div>
                <p className="text-sm text-muted-foreground">
                  Reunión: <strong>{readQrFor.title}</strong>. El usuario
                  registrado debe mostrar el{' '}
                  <strong>QR de esta conferencia</strong> (se activa 10 min
                  antes del inicio, en Mi espacio → Mis conferencias). Pega aquí
                  el código que te muestre el usuario registrado.
                </p>
                <div className="grid gap-2">
                  <Label>Código QR del usuario registrado</Label>
                  <Input
                    value={readQrRaw}
                    onChange={(e) => {
                      setReadQrRaw(e.target.value)
                      setReadQrError(null)
                      setReadQrSuccess(false)
                    }}
                    placeholder='{"student_id":"...","nombre":"...","email":"...","qr_token":"..."}'
                    className="font-mono text-xs"
                  />
                </div>
                <Button
                  onClick={() => {
                    setReadQrError(null)
                    setReadQrSuccess(false)
                    const windowCheck = isWithinQrWindow(readQrFor)
                    if (!windowCheck.ok) {
                      setReadQrError(
                        windowCheck.message ?? 'Fuera del horario permitido.'
                      )
                      return
                    }
                    const payload = parseStudentQrPayload(readQrRaw)
                    if (!payload) {
                      setReadQrError(
                        'Código inválido. Pide al usuario registrado que muestre su QR de identidad (Mi espacio).'
                      )
                      return
                    }
                    const studentUser = verifyStudentQrToken(payload)
                    if (!studentUser) {
                      setReadQrError(
                        'Token no válido o usuario registrado no encontrado. No se puede suplantar identidad.'
                      )
                      return
                    }
                    if (
                      payload.conference_id &&
                      payload.conference_id !== readQrFor.id
                    ) {
                      setReadQrError(
                        'Este QR es de otra reunión. El usuario registrado debe mostrar el QR correspondiente a esta conferencia.'
                      )
                      return
                    }
                    const all = loadAttendance()
                    const exists = all.some(
                      (a) =>
                        a.studentId === studentUser.id &&
                        a.conferenceId === readQrFor.id
                    )
                    if (exists) {
                      setReadQrError(
                        'Este usuario registrado ya tiene asistencia registrada en esta reunión.'
                      )
                      return
                    }
                    const rec: Attendance = {
                      id: newId(),
                      conferenceId: readQrFor.id,
                      studentId: studentUser.id,
                      deviceId: getDeviceId(),
                      markedAt: nowIso()
                    }
                    saveAttendance([...all, rec])
                    setTick((t) => t + 1)
                    setReadQrSuccess(true)
                    setReadQrRaw('')
                  }}
                >
                  Registrar asistencia
                </Button>
                {readQrError && (
                  <p className="text-sm text-destructive">{readQrError}</p>
                )}
                {readQrSuccess && (
                  <p className="text-sm text-green-600 font-medium">
                    Asistencia registrada correctamente.
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
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalle de asistencias</DialogTitle>
            </DialogHeader>
            {detailsFor && (
              <div className="grid gap-3">
                <div className="text-sm">
                  <span className="font-semibold">{detailsFor.title}</span>{' '}
                  <span className="text-muted-foreground">
                    ({formatIsoShort(detailsFor.startAt)} →{' '}
                    {formatIsoShort(detailsFor.endAt)})
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const confAtt = myAttendance.filter(
                        (a) => a.conferenceId === detailsFor.id
                      )
                      const rows: string[][] = [
                        [
                          'conference_id',
                          'conference_title',
                          'student_id',
                          'student_name',
                          'marked_at',
                          'device_id'
                        ],
                        ...confAtt.map((a) => [
                          a.conferenceId,
                          detailsFor.title,
                          a.studentId,
                          studentsById.get(a.studentId)?.nombre ?? '',
                          a.markedAt,
                          a.deviceId
                        ])
                      ]
                      downloadText(
                        `asistencia_${detailsFor.id}.csv`,
                        toCsv(rows)
                      )
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar CSV
                  </Button>
                </div>

                <Card className="p-3 bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-2">
                    Total:{' '}
                    {
                      myAttendance.filter(
                        (a) => a.conferenceId === detailsFor.id
                      ).length
                    }
                  </div>
                  <div className="grid gap-2 max-h-72 overflow-auto pr-1">
                    {myAttendance.filter(
                      (a) => a.conferenceId === detailsFor.id
                    ).length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        Aún no hay asistencias para esta reunión.
                      </div>
                    ) : (
                      myAttendance
                        .filter((a) => a.conferenceId === detailsFor.id)
                        .slice()
                        .sort((a, b) => a.markedAt.localeCompare(b.markedAt))
                        .map((a) => (
                          <div key={a.id} className="text-sm">
                            <span className="font-medium">
                              {studentsById.get(a.studentId)?.nombre ??
                                a.studentId}
                            </span>{' '}
                            <span className="text-muted-foreground">
                              · {new Date(a.markedAt).toLocaleString()}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Card className="p-4">
          <div className="font-heading font-black mb-2">
            Listado de usuarios registrados (simulado)
          </div>
          <div className="text-sm text-muted-foreground">
            Se considera asistencia cuando el staff lee el QR único del usuario
            registrado (evita suplantación).
          </div>
          <div className="mt-3 grid gap-2">
            {Array.from(uniqueStudents)
              .slice(0, 20)
              .map((id) => (
                <div key={id} className="text-sm">
                  {studentsById.get(id)?.nombre ?? id}
                </div>
              ))}
            {uniqueStudents.size === 0 && (
              <div className="text-sm text-muted-foreground">
                Aún no hay asistencias.
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
