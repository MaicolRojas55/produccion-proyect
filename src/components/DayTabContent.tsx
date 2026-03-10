import { DaySchedule, Session } from "@/data/agendaData";
import SessionCard from "./SessionCard";

export interface AgendaInscriptionInfo {
  code?: string | null;
}

interface DayTabContentProps {
  day: DaySchedule;
  inscriptions?: Record<string, boolean>;
  inscriptionCounts?: Record<string, number>;
  currentUserId?: string | null;
  onInscribe?: (sessionId: string) => void;
  onVerQr?: (sessionId: string, date: string, time: string, endTime: string, title: string) => void;
}

const DayTabContent = ({
  day,
  inscriptions = {},
  inscriptionCounts = {},
  currentUserId,
  onInscribe,
  onVerQr,
}: DayTabContentProps) => {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-6 font-body">{day.subtitle}</p>
      <div className="space-y-0">
        {day.sessions.map((session: Session, index: number) => {
          const totalInscriptions = inscriptionCounts[session.id] || 0;
          return (
            <SessionCard
              key={session.id}
              sessionId={session.id}
              index={index}
              sessionDate={day.date}
              isLoggedIn={currentUserId !== undefined && currentUserId !== null}
              isInscribed={!!currentUserId && !!inscriptions[session.id]}
              totalInscriptions={totalInscriptions}
              onInscribe={onInscribe}
              onVerQr={onVerQr}
              {...session}
            />
          );
        })}
      </div>
    </div>
  );
};

export default DayTabContent;
