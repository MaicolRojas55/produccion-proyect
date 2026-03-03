import { useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, LogOut, Plus, Users } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import { loadEvents, saveEvents } from "@/calendar/storage";
import type { Audience, CalendarEvent } from "@/calendar/types";

function ymd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function newId() {
  const c = crypto as unknown as { randomUUID?: () => string };
  return c?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function CalendarPage() {
  const { user, logout } = useAuth();
  const [selected, setSelected] = useState<Date>(new Date());
  const [eventsVersion, setEventsVersion] = useState(0);
  const [open, setOpen] = useState(false);

  const selectedKey = useMemo(() => ymd(selected), [selected]);

  const allEvents = useMemo(() => {
    void eventsVersion;
    return loadEvents();
  }, [eventsVersion]);

  const visibleEvents = useMemo(() => {
    if (!user) return [];
    const dayEvents = allEvents.filter((e) => e.date === selectedKey);
    if (user.role === "profesor") return dayEvents;
    return dayEvents.filter((e) => e.audience === "todos" || e.audience === "estudiantes");
  }, [allEvents, selectedKey, user]);

  const isProfesor = user?.role === "profesor";

  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [audience, setAudience] = useState<Audience>("todos");
  const [description, setDescription] = useState("");

  const createEvent = () => {
    if (!user) return;
    const next: CalendarEvent = {
      id: newId(),
      date: selectedKey,
      title: title.trim() || "Evento",
      startTime,
      endTime,
      audience,
      description: description.trim() || undefined,
      createdByUserId: user.id,
      createdByRole: user.role,
      attendees: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [...allEvents, next].sort((a, b) =>
      `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`),
    );
    saveEvents(updated);
    setEventsVersion((v) => v + 1);
    setOpen(false);
    setTitle("");
    setDescription("");
  };

  const toggleAttend = (eventId: string) => {
    if (!user) return;
    const updated = allEvents.map((e) => {
      if (e.id !== eventId) return e;
      const has = e.attendees.includes(user.id);
      return {
        ...e,
        attendees: has ? e.attendees.filter((x) => x !== user.id) : [...e.attendees, user.id],
      };
    });
    saveEvents(updated);
    setEventsVersion((v) => v + 1);
  };

  const removeEvent = (eventId: string) => {
    const updated = allEvents.filter((e) => e.id !== eventId);
    saveEvents(updated);
    setEventsVersion((v) => v + 1);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="font-heading font-black">Calendario</div>
              <div className="text-xs text-muted-foreground">
                {user.nombre} ·{" "}
                <span className="capitalize">{user.role}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={user.role === "profesor" ? "secondary" : "outline"} className="capitalize">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              {user.role}
            </Badge>
            <Button variant="secondary" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-5 p-4">
            <Calendar mode="single" selected={selected} onSelect={(d) => d && setSelected(d)} />

            {isProfesor && (
              <div className="mt-4">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Nuevo evento</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label>Título</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Clase de matemáticas" />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="grid gap-2">
                          <Label>Inicio</Label>
                          <Input value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="08:00" />
                        </div>
                        <div className="grid gap-2">
                          <Label>Fin</Label>
                          <Input value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="09:00" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Audiencia</Label>
                        <Select value={audience} onValueChange={(v) => setAudience(v as Audience)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="estudiantes">Solo estudiantes</SelectItem>
                            <SelectItem value="profesores">Solo profesores</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Descripción (opcional)</Label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalles del evento..." />
                      </div>

                      <Button onClick={createEvent}>Guardar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </Card>

          <Card className="lg:col-span-7 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-heading font-black text-lg">Eventos del día</div>
                <div className="text-sm text-muted-foreground">{selectedKey}</div>
              </div>
              <Badge variant="outline">{visibleEvents.length} evento(s)</Badge>
            </div>

            <div className="mt-4 grid gap-3">
              {visibleEvents.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No hay eventos para este día.
                </div>
              ) : (
                visibleEvents.map((e) => {
                  const attending = user.role === "estudiante" && e.attendees.includes(user.id);
                  const audienceLabel =
                    e.audience === "todos" ? "Todos" : e.audience === "estudiantes" ? "Estudiantes" : "Profesores";
                  return (
                    <div key={e.id} className="rounded-lg border border-border p-4 hover:bg-muted/30 transition">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="font-heading font-bold">{e.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {e.startTime} – {e.endTime} · Audiencia: {audienceLabel}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {user.role === "estudiante" && (
                            <Button variant={attending ? "secondary" : "default"} onClick={() => toggleAttend(e.id)}>
                              {attending ? "Asistencia confirmada" : "Confirmar asistencia"}
                            </Button>
                          )}
                          {isProfesor && (
                            <Button variant="secondary" onClick={() => removeEvent(e.id)}>
                              Eliminar
                            </Button>
                          )}
                        </div>
                      </div>

                      {e.description && <p className="mt-3 text-sm text-muted-foreground">{e.description}</p>}

                      <div className="mt-3 text-xs text-muted-foreground">
                        Asistentes: {e.attendees.length}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

