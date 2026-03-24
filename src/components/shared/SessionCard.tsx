import { SessionType } from '@/data/agendaData'
import {
  Clock,
  MapPin,
  User,
  Mic,
  Wrench,
  Users,
  Coffee,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  QrCode
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface SessionCardProps {
  sessionId: string
  time: string
  endTime: string
  title: string
  speaker?: string
  speakerRole?: string
  location: string
  type: SessionType
  track?: string
  description?: string
  capacity?: number
  url?: string
  index: number
  isLoggedIn?: boolean
  isInscribed?: boolean
  totalInscriptions?: number
  sessionDate?: string
  onInscribe?: (sessionId: string) => void
  onVerQr?: (
    sessionId: string,
    date: string,
    time: string,
    endTime: string,
    title: string
  ) => void
}

const typeConfig: Record<
  SessionType,
  { icon: typeof Mic; label: string; className: string }
> = {
  keynote: {
    icon: Mic,
    label: 'Keynote',
    className: 'bg-secondary/20 border-secondary text-secondary-foreground'
  },
  conference: {
    icon: MessageSquare,
    label: 'Conferencia',
    className: 'bg-sky-light border-sky text-foreground'
  },
  workshop: {
    icon: Wrench,
    label: 'Workshop',
    className: 'bg-accent/20 border-accent text-accent-foreground'
  },
  panel: {
    icon: Users,
    label: 'Panel',
    className: 'bg-primary/10 border-primary text-foreground'
  },
  networking: {
    icon: Users,
    label: 'Networking',
    className: 'bg-gold-light/40 border-gold text-foreground'
  },
  break: {
    icon: Coffee,
    label: 'Receso',
    className: 'bg-muted border-border text-muted-foreground'
  }
}

const SessionCard = ({
  sessionId,
  time,
  endTime,
  title,
  speaker,
  speakerRole,
  location,
  type,
  track,
  description,
  capacity,
  url,
  index,
  isLoggedIn,
  isInscribed,
  sessionDate,
  totalInscriptions = 0,
  onInscribe,
  onVerQr
}: SessionCardProps) => {
  const available = capacity !== undefined ? Math.max(0, capacity - totalInscriptions) : null
  const isVirtual = !!url
  const config = typeConfig[type]
  const Icon = config.icon
  const isBreak = type === 'break'

  return (
    <div
      className={`group relative flex gap-4 md:gap-6 animate-fade-in-up`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex flex-col items-center pt-1">
        <div
          className={`w-3 h-3 rounded-full border-2 ${
            isBreak
              ? 'border-muted-foreground bg-muted'
              : 'border-secondary bg-secondary'
          } z-10`}
        />
        <div className="w-px flex-1 bg-border" />
      </div>

      <div className="w-20 md:w-24 shrink-0 pt-0.5">
        <span className="font-heading font-bold text-sm text-foreground">
          {time}
        </span>
        <span className="block text-xs text-muted-foreground">{endTime}</span>
      </div>

      <div
        className={`flex-1 mb-4 rounded-lg border p-4 md:p-5 transition-all duration-300 ${
          isBreak
            ? 'bg-muted/50 border-border'
            : 'bg-card border-border hover:shadow-[var(--shadow-hover)] hover:border-secondary/40'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className}`}
            >
              <Icon className="w-3 h-3" />
              {config.label}
            </span>
            {track && (
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {track}
              </span>
            )}
          </div>
        </div>

        <h3
          className={`font-heading font-bold mb-1 ${
            isBreak
              ? 'text-sm text-muted-foreground'
              : 'text-base md:text-lg text-foreground'
          }`}
        >
          {title}
        </h3>

        {speaker && (
          <div className="flex items-center gap-1.5 text-sm mb-1">
            <User className="w-3.5 h-3.5 text-secondary" />
            <span className="font-medium text-foreground">{speaker}</span>
            {speakerRole && (
              <span className="text-muted-foreground">— {speakerRole}</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {time} - {endTime}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {location}
          </span>
          {capacity && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Capacidad: {capacity}
            </span>
          )}
        </div>

        {description && (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
            {description}
          </p>
        )}

        {!isBreak && (
          <>
            {isVirtual ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center px-4 py-2 text-sm font-semibold rounded bg-primary text-primary-foreground hover:bg-primary/90 transition"
              >
                Ingresar
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {isLoggedIn === undefined || isLoggedIn === false ? (
                  <Button asChild size="sm">
                    <Link to="/auth?redirect=/agenda">
                      Iniciar sesión para inscribirse
                    </Link>
                  </Button>
                ) : isInscribed ? (
                  <div className="flex flex-col gap-2">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Inscrito
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Para registrar tu asistencia presencial, entra a Mi
                      espacio y muestra tu QR 10 minutos antes del inicio de la
                      sesión.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-fit"
                      >
                        <Link to="/student">Ir a Mi espacio</Link>
                      </Button>
                      {sessionDate && onVerQr && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-fit gap-2"
                          onClick={() =>
                            onVerQr(
                              sessionId,
                              sessionDate,
                              time,
                              endTime,
                              title
                            )
                          }
                        >
                          <QrCode className="w-4 h-4" />
                          Ver QR
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => onInscribe?.(sessionId)}
                    disabled={available !== null && available <= 0}
                    className={available !== null && available <= 0 ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    {available !== null && available <= 0 ? 'Agotado' : 'Inscribirse'}
                  </Button>
                )}
                
                {capacity != null && available !== null && (
                  <span 
                    className={`text-sm font-semibold px-2 py-1 rounded-md border ${
                      available <= 0 
                        ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50' 
                        : available <= 5
                          ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50'
                          : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50'
                    }`}
                  >
                    {available <= 0
                      ? 'Sin cupo'
                      : available <= 5 
                        ? `¡Solo ${available} cupos!` 
                        : `${available} cupos libres`}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SessionCard
