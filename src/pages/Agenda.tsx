import { useState, useMemo, useCallback, useEffect } from 'react'
import { agendaData } from '@/data/agendaData'
import AgendaHero from '@/components/AgendaHero'
import DayTabContent from '@/components/DayTabContent'
import { AppNavbar } from '@/components/AppNavbar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Mail, MapPin, Phone, QrCode, Copy, Clock, Filter, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/auth/useAuth'
import { isRegisteredUserRole } from '@/auth/types'
import {
  loadAgendaInscriptions,
  saveAgendaInscriptions
} from '@/conference/storage'
import type { AgendaInscription } from '@/conference/types'
import {
  getStudentQrPayloadForConference,
  isQrWindowOpen,
  minutesUntilQrOpens
} from '@/studentQr/studentQr'
import type { User } from '@/auth/types'

function newId() {
  const c = crypto as unknown as { randomUUID?: () => string }
  return (
    c?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`
  )
}

type QrModalSession = {
  sessionId: string
  date: string
  time: string
  endTime: string
  title: string
}

function AgendaQrModalContent({
  sessionId,
  date,
  time,
  endTime,
  user
}: {
  sessionId: string
  date: string
  time: string
  endTime: string
  user: User
}) {
  const startAt = `${date}T${time}:00`
  const endAt = `${date}T${endTime}:00`
  const qrOpen = isQrWindowOpen(startAt, endAt)
  const minutesLeft = minutesUntilQrOpens(startAt)
  const payload = qrOpen
    ? getStudentQrPayloadForConference(user, sessionId)
    : null
  const qrJson = payload ? JSON.stringify(payload, null, 2) : ''

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
        <p className="font-medium text-amber-800 dark:text-amber-200">
          Aviso: este QR no puede ser leído ni usado hasta 10 minutos antes del
          inicio de la sesión.
        </p>
      </div>

      {qrOpen && payload ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            QR activo. Muestra este código al profesor para registrar tu
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
              }}
            >
              <Copy className="h-4 w-4 mr-1.5" />
              Copiar
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-muted/50 border border-border p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            {minutesLeft > 0 ? (
              <>
                <strong>El QR aún no está activo.</strong>
                <br />
                Se activará 10 minutos antes del inicio (aproximadamente en{' '}
                {minutesLeft} min).
              </>
            ) : (
              <>Esta sesión ya finalizó. El QR ya no está disponible.</>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const Agenda = () => {
  const [activeDay, setActiveDay] = useState(0)
  const [tick, setTick] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Filtros
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('all')

  const [qrModalSession, setQrModalSession] = useState<QrModalSession | null>(
    null
  )

  const inscriptionsList = useMemo(() => {
    void tick
    return loadAgendaInscriptions()
  }, [tick])

  const totalInscriptionsCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    inscriptionsList.forEach((i) => {
      counts[i.sessionId] = (counts[i.sessionId] || 0) + 1
    })
    return counts
  }, [inscriptionsList])

  const myInscriptions = useMemo(() => {
    if (!user) return {}
    const list = inscriptionsList.filter((i) => i.userId === user.id)
    const map: Record<string, boolean> = {}
    list.forEach((i) => {
      map[i.sessionId] = true
    })
    return map
  }, [inscriptionsList, user])

  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>()
    agendaData.forEach((day) =>
      day.sessions.forEach((s) => {
        if (s.location) locs.add(s.location)
      })
    )
    return Array.from(locs).sort()
  }, [])

  const uniqueSpeakers = useMemo(() => {
    const spks = new Set<string>()
    agendaData.forEach((day) =>
      day.sessions.forEach((s) => {
        if (s.speaker && s.speaker !== 'Por confirmar') spks.add(s.speaker)
      })
    )
    return Array.from(spks).sort()
  }, [])

  const filteredDayData = useMemo(() => {
    const currentDay = agendaData[activeDay]
    if (!currentDay) return null

    const filteredSessions = currentDay.sessions.filter((s) => {
      if (selectedLocation !== 'all' && s.location !== selectedLocation)
        return false
      if (selectedType !== 'all' && s.type !== selectedType) return false
      if (selectedSpeaker !== 'all' && s.speaker !== selectedSpeaker)
        return false
      return true
    })

    return { ...currentDay, sessions: filteredSessions }
  }, [activeDay, selectedLocation, selectedType, selectedSpeaker])

  const canInscribe = user && isRegisteredUserRole(user.role)
  const currentUserId = canInscribe ? user.id : null

  const onVerQr = useCallback(
    (
      sessionId: string,
      date: string,
      time: string,
      endTime: string,
      title: string
    ) => {
      setQrModalSession({ sessionId, date, time, endTime, title })
    },
    []
  )

  const onInscribe = useCallback(
    (sessionId: string) => {
      if (!user) return
      const all = loadAgendaInscriptions()
      const exists = all.some(
        (i) => i.userId === user.id && i.sessionId === sessionId
      )
      if (exists) return
      const item: AgendaInscription = {
        id: newId(),
        userId: user.id,
        sessionId,
        createdAt: new Date().toISOString()
      }
      saveAgendaInscriptions([...all, item])
      setTick((t) => t + 1)
    },
    [user]
  )

  return (
    <div className="min-h-screen bg-background pt-16">
      <AppNavbar variant="dark" />

      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          {/* Title or something if needed */}
        </div>
      </header>

      <div className="absolute left-4 top-16 z-10">
        <Link
          to="/"
          className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center"
        >
          ← Volver al inicio
        </Link>
      </div>

      <AgendaHero />

      <section className="container mx-auto px-4 -mt-6 relative z-20">
        <div className="bg-card rounded-xl shadow-[var(--shadow-card)] border border-border overflow-hidden mb-6">
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-foreground font-heading font-semibold">
                <Filter className="w-4 h-4" />
                Filtrar Agenda
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger className="w-full md:w-[180px] h-9 text-xs">
                    <SelectValue placeholder="Lugar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los lugares</SelectItem>
                    {uniqueLocations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full md:w-[180px] h-9 text-xs">
                    <SelectValue placeholder="Tipo de sesión" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cualquier tipo</SelectItem>
                    <SelectItem value="keynote">Keynote</SelectItem>
                    <SelectItem value="conference">Conferencia</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="panel">Panel</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedSpeaker}
                  onValueChange={setSelectedSpeaker}
                >
                  <SelectTrigger className="w-full md:w-[180px] h-9 text-xs">
                    <SelectValue placeholder="Conferencista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Cualquier conferencista</SelectItem>
                    {uniqueSpeakers.map((spk) => (
                      <SelectItem key={spk} value={spk}>
                        {spk}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(selectedLocation !== 'all' ||
                  selectedType !== 'all' ||
                  selectedSpeaker !== 'all') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setSelectedLocation('all')
                      setSelectedType('all')
                      setSelectedSpeaker('all')
                    }}
                    title="Limpiar filtros"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="flex border-b border-border">
            {agendaData.map((day, i) => (
              <button
                key={day.date}
                onClick={() => setActiveDay(i)}
                className={`flex-1 px-4 py-4 text-center font-heading font-bold text-sm md:text-base transition-all duration-200 ${
                  activeDay === i
                    ? 'bg-primary text-primary-foreground shadow-inner'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span className="block">{day.label}</span>
                <span className="block text-xs font-body font-normal opacity-80 mt-0.5">
                  {day.date.split('-').reverse().slice(0, 2).join('/')}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 md:p-8">
            {filteredDayData && (
              <DayTabContent
                day={filteredDayData}
                inscriptions={myInscriptions}
                inscriptionCounts={totalInscriptionsCounts}
                currentUserId={currentUserId}
                onInscribe={canInscribe ? onInscribe : undefined}
                onVerQr={canInscribe ? onVerQr : undefined}
              />
            )}
            {filteredDayData?.sessions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No hay sesiones que coincidan con los filtros aplicados.</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSelectedLocation('all')
                    setSelectedType('all')
                    setSelectedSpeaker('all')
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {qrModalSession && user && (
        <Dialog
          open={!!qrModalSession}
          onOpenChange={(open) => !open && setQrModalSession(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                QR de asistencia — {qrModalSession.title}
              </DialogTitle>
            </DialogHeader>
            <AgendaQrModalContent
              sessionId={qrModalSession.sessionId}
              date={qrModalSession.date}
              time={qrModalSession.time}
              endTime={qrModalSession.endTime}
              user={user}
            />
          </DialogContent>
        </Dialog>
      )}

      <section className="container mx-auto px-4 py-10">
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          {[
            { label: 'Keynote', color: 'bg-secondary/20 border-secondary' },
            { label: 'Conferencia', color: 'bg-sky-light border-sky' },
            { label: 'Workshop', color: 'bg-accent/20 border-accent' },
            { label: 'Panel', color: 'bg-primary/10 border-primary' },
            { label: 'Networking', color: 'bg-gold-light/40 border-gold' },
            { label: 'Receso', color: 'bg-muted border-border' }
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full border ${item.color}`} />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="font-heading font-bold text-lg mb-3">
                XI <span className="text-secondary">CONIITI</span> 2025
              </h3>
              <p className="text-primary-foreground/70 leading-relaxed">
                Congreso Internacional de Innovación y Tendencias en Ingeniería.
                Universidad Católica de Colombia.
              </p>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-3">Contacto</h4>
              <div className="space-y-2 text-primary-foreground/70">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-secondary" />
                  <span>coniiti@ucatolica.edu.co</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-secondary" />
                  <span>(601) 4433700 Ext. 3130/60/90</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-3">Ubicación</h4>
              <div className="flex items-start gap-2 text-primary-foreground/70">
                <MapPin className="w-4 h-4 text-secondary mt-0.5" />
                <span>
                  Carrera 13 # 47 – 30, Bogotá
                  <br />
                  Centro de Convenciones, Sede 4
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-primary-foreground/10 mt-8 pt-6 text-center text-xs text-primary-foreground/50">
            © 2025 CONIITI — Universidad Católica de Colombia. Todos los
            derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Agenda
