import { useMemo, useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  CalendarDays,
  CheckCircle2,
  Copy,
  Clock,
  Globe,
  LogOut,
  QrCode,
  ShieldCheck,
  Calendar
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import {
  loadAttendance,
  loadAgendaInscriptions,
  loadConferences,
  loadStudentAgenda,
  saveStudentAgenda
} from '@/conference/storage'
import type { Conference, StudentAgendaItem } from '@/conference/types'
import { agendaData } from '@/data/agendaData'
import {
  getStudentQrPayloadForConference,
  isQrWindowOpen,
  minutesUntilQrOpens,
  type StudentQrPayload
} from '@/studentQr/studentQr'

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

/** Convierte sesiones de la agenda (agendaData) en objetos tipo Conference para mostrar en el portal. */
function getAgendaSessionsAsConferences(userId: string): Conference[] {
  const inscriptions = loadAgendaInscriptions().filter(
    (i) => i.userId === userId
  )
  const sessionIds = new Set(inscriptions.map((i) => i.sessionId))
  const result: Conference[] = []
  for (const day of agendaData) {
    const date = day.date
    for (const session of day.sessions) {
      if (!sessionIds.has(session.id)) continue
      const startAt = `${date}T${session.time}:00`
      const endAt = `${date}T${session.endTime}:00`
      result.push({
        id: session.id,
        title: session.title,
        location: session.location,
        startAt,
        endAt,
        createdByUserId: '',
        createdAt: ''
      })
    }
  }
  return result.sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  )
}

export default function StudentPortal() {
  const { user, logout } = useAuth()
  const [tick, setTick] = useState(0)
  const [tab, setTab] = useState<'mis-conferencias' | 'disponibles'>(
    'mis-conferencias'
  )

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const conferences = useMemo(() => {
    void tick
    return loadConferences().sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    )
  }, [tick])

  const agenda = useMemo(() => {
    void tick
    return loadStudentAgenda()
  }, [tick])

  const attendance = useMemo(() => {
    void tick
    return loadAttendance()
  }, [tick])

  const agendaSessionsAsConferences = useMemo(() => {
    if (!user) return []
    void tick
    return getAgendaSessionsAsConferences(user.id)
  }, [user, tick])

  if (!user) return null
  // only registered users may view this page
  if (user.role !== 'usuario_registrado') return null

  const myAgendaIds = new Set(
    agenda.filter((a) => a.studentId === user.id).map((a) => a.conferenceId)
  )
  const myAgendaItemsFromConferences = conferences.filter((c) =>
    myAgendaIds.has(c.id)
  )
  const myAgendaItems = [
    ...myAgendaItemsFromConferences,
    ...agendaSessionsAsConferences
  ].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  )
  const availableItems = conferences.filter((c) => !myAgendaIds.has(c.id))

  const markAgenda = (conferenceId: string) => {
    const all = loadStudentAgenda()
    const exists = all.some(
      (a) => a.studentId === user.id && a.conferenceId === conferenceId
    )
    if (exists) return
    const item: StudentAgendaItem = {
      id: newId(),
      studentId: user.id,
      conferenceId,
      createdAt: nowIso()
    }
    saveStudentAgenda([...all, item])
    setTick((t) => t + 1)
  }

  const alreadyAttended = (conferenceId: string) => {
    return attendance.some(
      (a) => a.studentId === user.id && a.conferenceId === conferenceId
    )
  }

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
                <div className="font-heading font-black">Mi espacio</div>
                <div className="text-xs text-muted-foreground">{user.nombre}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              QR por conferencia
            </Badge>
            <Link to="/agenda">
              <Button variant="ghost" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                Agenda
              </Button>
            </Link>
            <Button variant="secondary" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid gap-6">
        {/* Agenda del evento: acceso directo */}
        <section>
          <h2 className="font-heading font-black text-xl mb-1">
            Agenda del evento
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Programa completo por días y sesiones. Inscríbete a las conferencias
            desde la agenda.
          </p>
          <Link to="/agenda">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Ver agenda completa
            </Button>
          </Link>
        </section>

        {/* 1) Primero: Mis conferencias en las que me registré */}
        <section>
          <h2 className="font-heading font-black text-xl mb-1">
            Mis conferencias
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Conferencias en las que te registraste. El QR de asistencia para
            cada una se activa solo 10 minutos antes del inicio.
          </p>

          {myAgendaItems.length === 0 ? (
            <Card className="p-6 text-muted-foreground">
              Aún no te has registrado en ninguna conferencia. Ve a la pestaña
              &quot;Disponibles&quot; para agendar.
            </Card>
          ) : (
            <div className="space-y-4">
              {myAgendaItems.map((c) => (
                <ConferenceQrCard
                  key={c.id}
                  conference={c}
                  user={user}
                  attended={alreadyAttended(c.id)}
                  refreshTrigger={tick}
                  onCopy={() => setTick((t) => t + 1)}
                />
              ))}
            </div>
          )}
        </section>

        {/* 2) Después: Reuniones disponibles para agendar */}
        <section>
          <h2 className="font-heading font-black text-xl mb-1">
            Reuniones disponibles
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Regístrate en las conferencias a las que quieras asistir. Luego
            podrás generar tu QR 10 min antes de cada una.
          </p>

          <Tabs
            value={tab}
            onValueChange={(v) =>
              setTab(v as 'mis-conferencias' | 'disponibles')
            }
            className="grid gap-4"
          >
            <TabsList className="grid grid-cols-2 w-full max-w-xl">
              <TabsTrigger value="mis-conferencias">
                Mis conferencias ({myAgendaItems.length})
              </TabsTrigger>
              <TabsTrigger value="disponibles">
                Disponibles ({availableItems.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mis-conferencias">
              <div className="grid gap-4">
                {myAgendaItems.length === 0 ? (
                  <Card className="p-6 text-sm text-muted-foreground">
                    Aún no has agendado reuniones.
                  </Card>
                ) : (
                  myAgendaItems.map((c) => {
                    const attended = alreadyAttended(c.id)
                    return (
                      <Card key={c.id} className="p-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div>
                            <div className="font-heading font-black text-lg">
                              {c.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatIsoShort(c.startAt)} →{' '}
                              {formatIsoShort(c.endAt)}
                              {c.location ? ` · ${c.location}` : ''}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="secondary">Agendada</Badge>
                              {attended && (
                                <Badge variant="outline">
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                  Asistencia registrada
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="disponibles">
              <div className="grid gap-4">
                {availableItems.length === 0 ? (
                  <Card className="p-6 text-sm text-muted-foreground">
                    No hay reuniones disponibles para agendar.
                  </Card>
                ) : (
                  availableItems.map((c) => {
                    const attended = alreadyAttended(c.id)
                    return (
                      <Card key={c.id} className="p-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div>
                            <div className="font-heading font-black text-lg">
                              {c.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatIsoShort(c.startAt)} →{' '}
                              {formatIsoShort(c.endAt)}
                              {c.location ? ` · ${c.location}` : ''}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {attended && (
                                <Badge variant="outline">
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                  Asistencia registrada
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="secondary"
                            onClick={() => markAgenda(c.id)}
                          >
                            Agendar
                          </Button>
                        </div>
                      </Card>
                    )
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  )
}

function ConferenceQrCard({
  conference,
  user,
  attended,
  refreshTrigger = 0,
  onCopy
}: {
  conference: Conference
  user: { id: string }
  attended: boolean
  refreshTrigger?: number
  onCopy: () => void
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const qrOpen = useMemo(() => {
    void refreshTrigger
    return isQrWindowOpen(conference.startAt, conference.endAt)
  }, [conference.startAt, conference.endAt, refreshTrigger])
  const minutesLeft = useMemo(
    () => minutesUntilQrOpens(conference.startAt),
    [conference.startAt, refreshTrigger]
  )

  const payload: StudentQrPayload | null = useMemo(() => {
    if (!qrOpen) return null
    return getStudentQrPayloadForConference(
      user as import('@/auth/types').User,
      conference.id
    )
  }, [user, conference.id, qrOpen])

  const qrJson = payload ? JSON.stringify(payload, null, 2) : ''

  return (
    <>
      <Card className="p-5 border-primary/20">
        <div className="flex flex-col gap-4">
          <div>
            <div className="font-heading font-black text-lg">
              {conference.title}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatIsoShort(conference.startAt)} →{' '}
              {formatIsoShort(conference.endAt)}
              {conference.location ? ` · ${conference.location}` : ''}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">Registrado</Badge>
              {attended && (
                <Badge variant="outline">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Asistencia registrada
                </Badge>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                <span className="font-heading font-bold text-sm">
                  QR para esta conferencia
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setModalOpen(true)}
                className="gap-2"
              >
                <QrCode className="h-4 w-4" />
                Ver QR
              </Button>
            </div>
            {!qrOpen && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {minutesLeft > 0
                  ? `Se activa 10 min antes del inicio (aprox. en ${minutesLeft} min)`
                  : 'Esta reunión ya finalizó.'}
              </p>
            )}
          </div>
        </div>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR de asistencia — {conference.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Aviso: este QR no puede ser leído ni usado hasta 10 minutos
                antes del inicio de la reunión.
              </p>
            </div>

            {qrOpen && payload ? (
              <div className="space-y-3">
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                  QR activado. Muestra este código al profesor para registrar tu
                  asistencia.
                </p>
                <div className="rounded-lg bg-muted p-4 flex items-center justify-between gap-3 border border-border">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-background border">
                      <QrCode className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span
                      className="font-mono font-bold text-sm truncate"
                      title={payload.qr_token}
                    >
                      {payload.qr_token}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(qrJson)
                      onCopy()
                    }}
                  >
                    <Copy className="h-4 w-4 mr-1.5" />
                    Copiar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  El profesor puede escanear este código o pegar el contenido
                  copiado para registrar tu asistencia.
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-muted/50 border border-border p-4 flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  {minutesLeft > 0 ? (
                    <>
                      <strong>El QR aún no está disponible.</strong>
                      <br />
                      Se activará 10 minutos antes del inicio (aproximadamente
                      en {minutesLeft} min). Vuelve a abrir este modal en ese
                      momento.
                    </>
                  ) : (
                    <>Esta reunión ya finalizó. El QR ya no está disponible.</>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
