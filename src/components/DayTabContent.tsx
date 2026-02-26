import { DaySchedule } from "@/data/agendaData";
import SessionCard from "./SessionCard";

interface DayTabContentProps {
  day: DaySchedule;
}

const DayTabContent = ({ day }: DayTabContentProps) => {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-6 font-body">{day.subtitle}</p>
      <div className="space-y-0">
        {day.sessions.map((session, index) => (
          <SessionCard key={session.id} {...session} index={index} />
        ))}
      </div>
    </div>
  );
};

export default DayTabContent;
