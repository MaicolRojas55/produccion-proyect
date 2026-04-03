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
  onVerQr?: (sessionId: string, date: string, time: string, endTime: string, title: string) => void
}

const typeConfig: Record<SessionType, { icon: typeof Mic; label: string; accent: string; bg: string }> = {
  keynote: { icon: Mic, label: 'Keynote', accent: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  conference: { icon: MessageSquare, label: 'Conferencia', accent: 'text-sky-600', bg: 'bg-sky-50 border-sky-200' },
  workshop: { icon: Wrench, label: 'Workshop', accent: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  panel: { icon: Users, label: 'Panel', accent: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  networking: { icon: Users, label: 'Networking', accent: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  break: { icon: Coffee, label: 'Receso', accent: 'text-slate-400', bg: 'bg-slate-50 border-slate-200' },
}

/** Animated traffic-light indicator for seat availability */
function CapacityLight({ available, capacity }: { available: number; capacity: number }) {
  const pct = available / capacity
  const isRed = available <= 0
  const isYellow = !isRed && pct <= 0.25
  const isGreen = !isRed && !isYellow

  return (
    <div className="flex items-center gap-2" title={`${available} cupos disponibles de ${capacity}`}>
      {/* Traffic light housing */}
      <div className="flex flex-col items-center gap-0.5 bg-slate-800 rounded-full px-1.5 py-2 shadow-inner">
        <span
          className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
            isRed ? 'bg-red-500 shadow-[0_0_6px_2px_rgba(239,68,68,0.8)] animate-pulse' : 'bg-red-900/30'
          }`}
        />
        <span
          className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
            isYellow ? 'bg-yellow-400 shadow-[0_0_6px_2px_rgba(250,204,21,0.8)] animate-pulse' : 'bg-yellow-900/30'
          }`}
        />
        <span
          className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
            isGreen ? 'bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.8)] animate-pulse' : 'bg-green-900/30'
          }`}
        />
      </div>
      <span className={`text-xs font-semibold ${isRed ? 'text-red-600' : isYellow ? 'text-yellow-600' : 'text-green-600'}`}>
        {isRed ? 'Sin cupos' : isYellow ? `¡Solo ${available}!` : `${available} cupos`}
      </span>
    </div>
  )
}

const SessionCard = ({
  sessionId, time, endTime, title, speaker, speakerRole, location,
  type, track, description, capacity, url, index,
  isLoggedIn, isInscribed, sessionDate, totalInscriptions = 0, onInscribe, onVerQr
}: SessionCardProps) => {
  const available = capacity !== undefined ? Math.max(0, capacity - totalInscriptions) : null
  const isVirtual = !!url
  const config = typeConfig[type]
  const Icon = config.icon
  const isBreak = type === 'break'

  return (
    <div
      className={`group relative flex gap-3 animate-fade-in-up`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Timeline dot */}
      <div className="flex flex-col items-center pt-2.5 shrink-0">
        <div className={`w-2.5 h-2.5 rounded-full border-2 ${isBreak ? 'border-slate-300 bg-slate-100' : 'border-purple-500 bg-purple-500'} z-10`} />
        <div className="w-px flex-1 bg-border mt-1" />
      </div>

      {/* Time column */}
      <div className="w-16 shrink-0 pt-1.5 text-right">
        <span className="font-heading font-bold text-xs text-foreground">{time}</span>
        <span className="block text-xs text-muted-foreground/70">{endTime}</span>
      </div>

      {/* Card body */}
      <div className={`flex-1 mb-3 rounded-xl border transition-all duration-300 ${
        isBreak
          ? 'bg-slate-50/60 border-slate-200/60 py-3 px-4'
          : 'bg-card border-border hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5 p-4'
      }`}>
        {isBreak ? (
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-muted-foreground">{title}</span>
            {location && <span className="text-xs text-muted-foreground/60 ml-auto flex items-center gap-1"><MapPin className="w-3 h-3" />{location}</span>}
          </div>
        ) : (
          <>
            {/* Header row: type badge + track + capacity light */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.accent}`}>
                  <Icon className="w-3 h-3" />
                  {config.label}
                </span>
                {track && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full border">{track}</span>
                )}
              </div>
              {capacity != null && available !== null && (
                <CapacityLight available={available} capacity={capacity} />
              )}
            </div>

            {/* Title */}
            <h3 className="font-heading font-bold text-sm md:text-base text-foreground leading-snug mb-1.5">{title}</h3>

            {/* Meta row: speaker + location */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {speaker && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 shrink-0 text-purple-500" />
                  <span className="font-medium text-foreground/80">{speaker}</span>
                  {speakerRole && <span>— {speakerRole}</span>}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />{location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" />{time}–{endTime}
              </span>
            </div>

            {/* Description (collapsed by default) */}
            {description && (
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
            )}

            {/* Actions */}
            {!isBreak && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {isVirtual ? (
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition">
                    Ingresar <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </a>
                ) : isLoggedIn === undefined || isLoggedIn === false ? (
                  <Button asChild size="sm" className="h-7 text-xs">
                    <Link to="/auth?redirect=/agenda">Iniciar sesión</Link>
                  </Button>
                ) : isInscribed ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Inscrito
                    </span>
                    <Button asChild variant="outline" size="sm" className="h-7 text-xs"><Link to="/student">Mi espacio</Link></Button>
                    {sessionDate && onVerQr && (
                      <Button variant="secondary" size="sm" className="h-7 text-xs gap-1.5"
                        onClick={() => onVerQr(sessionId, sessionDate, time, endTime, title)}>
                        <QrCode className="w-3.5 h-3.5" /> Ver QR
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button size="sm" className="h-7 text-xs"
                    onClick={() => onInscribe?.(sessionId)}
                    disabled={available !== null && available <= 0}>
                    {available !== null && available <= 0 ? 'Agotado' : 'Inscribirse'}
                  </Button>
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
