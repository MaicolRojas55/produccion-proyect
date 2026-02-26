import { SessionType } from "@/data/agendaData";
import { Clock, MapPin, User, Mic, Wrench, Users, Coffee, MessageSquare, ArrowRight } from "lucide-react";
import { useState } from "react";

interface SessionCardProps {
  time: string;
  endTime: string;
  title: string;
  speaker?: string;
  speakerRole?: string;
  location: string;
  type: SessionType;
  track?: string;
  description?: string;
  /** Número total de cupos si la sesión presencial está limitada */
  capacity?: number;
  /** Enlace a reunión remota, si aplica */
  url?: string;
  index: number;
}

const typeConfig: Record<SessionType, { icon: typeof Mic; label: string; className: string }> = {
  keynote: {
    icon: Mic,
    label: "Keynote",
    className: "bg-secondary/20 border-secondary text-secondary-foreground",
  },
  conference: {
    icon: MessageSquare,
    label: "Conferencia",
    className: "bg-sky-light border-sky text-foreground",
  },
  workshop: {
    icon: Wrench,
    label: "Workshop",
    className: "bg-accent/20 border-accent text-accent-foreground",
  },
  panel: {
    icon: Users,
    label: "Panel",
    className: "bg-primary/10 border-primary text-foreground",
  },
  networking: {
    icon: Users,
    label: "Networking",
    className: "bg-gold-light/40 border-gold text-foreground",
  },
  break: {
    icon: Coffee,
    label: "Receso",
    className: "bg-muted border-border text-muted-foreground",
  },
};

const SessionCard = ({
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
}: SessionCardProps) => {
  // si hay un límite, mantengo un contador local de cupos disponibles
  const [available, setAvailable] = useState<number | null>(
    capacity ?? null
  );
  const isVirtual = !!url;
  const config = typeConfig[type];
  const Icon = config.icon;
  const isBreak = type === "break";

  return (
    <div
      className={`group relative flex gap-4 md:gap-6 animate-fade-in-up`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Timeline */}
      <div className="flex flex-col items-center pt-1">
        <div
          className={`w-3 h-3 rounded-full border-2 ${
            isBreak ? "border-muted-foreground bg-muted" : "border-secondary bg-secondary"
          } z-10`}
        />
        <div className="w-px flex-1 bg-border" />
      </div>

      {/* Time column */}
      <div className="w-20 md:w-24 shrink-0 pt-0.5">
        <span className="font-heading font-bold text-sm text-foreground">{time}</span>
        <span className="block text-xs text-muted-foreground">{endTime}</span>
      </div>

      {/* Card */}
      <div
        className={`flex-1 mb-4 rounded-lg border p-4 md:p-5 transition-all duration-300 ${
          isBreak
            ? "bg-muted/50 border-border"
            : "bg-card border-border hover:shadow-[var(--shadow-hover)] hover:border-secondary/40"
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
            isBreak ? "text-sm text-muted-foreground" : "text-base md:text-lg text-foreground"
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
        </div>

        {description && (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
            {description}
          </p>
        )}

        {/* sólo mostramos controles para sesiones que no sean receso */}
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
              <div className="mt-3 text-sm">
                {available !== null ? (
                  available > 0 ? (
                    <span className="font-medium">Cupos disponibles: {available}</span>
                  ) : (
                    <span className="text-red-600 font-bold">Agotado</span>
                  )
                ) : (
                  <span className="font-medium">Cupo libre</span>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setAvailable((prev) =>
                      prev !== null ? Math.max(prev - 1, 0) : prev
                    )
                  }
                  className="mt-2 inline-flex items-center px-3 py-1.5 text-sm font-medium rounded bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  Registrarse
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SessionCard;
