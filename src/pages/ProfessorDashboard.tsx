import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, Copy, Download, LogOut, Plus, QrCode, Users } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import { getDeviceId } from "@/device/device";
import { loadUsers } from "@/auth/storage";
import { loadAttendance, loadConferences, saveConferences } from "@/conference/storage";
import type { Conference } from "@/conference/types";

function newId() {
  const c = crypto as unknown as { randomUUID?: () => string };
  return c?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function formatIsoShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function makeQrPayload(conferenceId: string) {
  return JSON.stringify({
    conference_id: conferenceId,
    timestamp: Date.now(),
    nonce: Math.random().toString(16).slice(2),
    device_hint: getDeviceId().slice(0, 8),
  });
}

function toCsv(rows: string[][]) {
  const esc = (v: string) => `"${v.replaceAll('"', '""')}"`;
  return rows.map((r) => r.map((x) => esc(x)).join(",")).join("\n");
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ProfessorDashboard() {
  const { user, logout } = useAuth();
  const [tick, setTick] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [qrOpenFor, setQrOpenFor] = useState<Conference | null>(null);
  const [detailsFor, setDetailsFor] = useState<Conference | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const conferences = useMemo(() => {
    void tick;
    const all = loadConferences();
    return user ? all.filter((c) => c.createdByUserId === user.id) : [];
  }, [tick, user]);

  const attendance = useMemo(() => {
    void tick;
    return loadAttendance();
  }, [tick]);

  const studentsById = useMemo(() => {
    const users = loadUsers();
    return new Map(users.filter((u) => u.role === "estudiante").map((u) => [u.id, u]));
  }, []);

  if (!user) return null;
  if (user.role !== "profesor") {
    return <Navigate to="/calendar" replace />;
  }

  const confIds = new Set(conferences.map((c) => c.id));
  const myAttendance = attendance.filter((a) => confIds.has(a.conferenceId));
  const uniqueStudents = new Set(myAttendance.map((a) => a.studentId));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="font-heading font-black">Dashboard Profesor</div>
              <div className="text-xs text-muted-foreground">{user.nombre}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              profesor
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
            <div className="text-sm text-muted-foreground">Reuniones creadas</div>
            <div className="text-3xl font-heading font-black">{conferences.length}</div>
          </Card>
          <Card className="p-5">
            <div className="text-sm text-muted-foreground">Asistencias registradas</div>
            <div className="text-3xl font-heading font-black">{myAttendance.length}</div>
          </Card>
          <Card className="p-5">
            <div className="text-sm text-muted-foreground">Estudiantes únicos</div>
            <div className="text-3xl font-heading font-black">{uniqueStudents.size}</div>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="font-heading font-black text-xl">Tus reuniones</div>
            <div className="text-sm text-muted-foreground">
              Muestra QR dinámico para asistencia (simulado) y crea más reuniones.
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
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Conferencia 1" />
                </div>
                <div className="grid gap-2">
                  <Label>Ubicación</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Aula / Meet" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Inicio (ISO o fecha/hora)</Label>
                    <Input value={startAt} onChange={(e) => setStartAt(e.target.value)} placeholder="2026-03-03T10:00:00" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Fin</Label>
                    <Input value={endAt} onChange={(e) => setEndAt(e.target.value)} placeholder="2026-03-03T11:00:00" />
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setCreateError(null);
                    const conf: Conference = {
                      id: newId(),
                      title: title.trim() || "Reunión",
                      location: location.trim() || undefined,
                      startAt: startAt.trim() || nowIso(),
                      endAt: endAt.trim() || nowIso(),
                      createdByUserId: user.id,
                      createdAt: nowIso(),
                    };
                    if (!title.trim()) {
                      setCreateError("Ponle un título a la reunión.");
                      return;
                    }
                    if (Number.isNaN(new Date(conf.startAt).getTime()) || Number.isNaN(new Date(conf.endAt).getTime())) {
                      setCreateError("Inicio/fin inválidos. Usa ISO (ej: 2026-03-03T10:00:00).");
                      return;
                    }
                    const all = loadConferences();
                    saveConferences([...all, conf]);
                    setTick((t) => t + 1);
                    setCreateOpen(false);
                    setTitle("");
                    setLocation("");
                    setStartAt("");
                    setEndAt("");
                  }}
                >
                  Guardar
                </Button>
                {createError && <div className="text-sm text-red-600">{createError}</div>}
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
                  const count = myAttendance.filter((a) => a.conferenceId === c.id).length;
                  const uniq = new Set(myAttendance.filter((a) => a.conferenceId === c.id).map((a) => a.studentId)).size;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.title}
                        {c.location ? <div className="text-xs text-muted-foreground">{c.location}</div> : null}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatIsoShort(c.startAt)} → {formatIsoShort(c.endAt)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold">{count}</div>
                        <div className="text-xs text-muted-foreground">{uniq} estudiante(s) únicos</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" onClick={() => setDetailsFor(c)}>
                            Ver detalle
                          </Button>
                          <Button variant="secondary" onClick={() => setQrOpenFor(c)}>
                            <QrCode className="h-4 w-4 mr-2" />
                            QR dinámico
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        <Dialog open={!!qrOpenFor} onOpenChange={(o) => !o && setQrOpenFor(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>QR dinámico (simulado)</DialogTitle>
            </DialogHeader>
            {qrOpenFor && (
              <div className="grid gap-3">
                <div className="text-sm text-muted-foreground">
                  Este código cambia cada segundo (validez 60s). El estudiante lo “escanea” pegándolo en su pantalla.
                </div>
                <Card className="p-4 bg-muted/30">
                  <pre className="text-xs whitespace-pre-wrap break-words font-mono">
                    {makeQrPayload(qrOpenFor.id)}
                  </pre>
                </Card>
                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      const text = makeQrPayload(qrOpenFor.id);
                      await navigator.clipboard.writeText(text);
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Tip: abre la vista Estudiante en otro navegador/ventana para simular dos dispositivos.
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={!!detailsFor} onOpenChange={(o) => !o && setDetailsFor(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalle de asistencias</DialogTitle>
            </DialogHeader>
            {detailsFor && (
              <div className="grid gap-3">
                <div className="text-sm">
                  <span className="font-semibold">{detailsFor.title}</span>{" "}
                  <span className="text-muted-foreground">({formatIsoShort(detailsFor.startAt)} → {formatIsoShort(detailsFor.endAt)})</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const confAtt = myAttendance.filter((a) => a.conferenceId === detailsFor.id);
                      const rows: string[][] = [
                        ["conference_id", "conference_title", "student_id", "student_name", "marked_at", "device_id"],
                        ...confAtt.map((a) => [
                          a.conferenceId,
                          detailsFor.title,
                          a.studentId,
                          studentsById.get(a.studentId)?.nombre ?? "",
                          a.markedAt,
                          a.deviceId,
                        ]),
                      ];
                      downloadText(`asistencia_${detailsFor.id}.csv`, toCsv(rows));
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar CSV
                  </Button>
                </div>

                <Card className="p-3 bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-2">
                    Total: {myAttendance.filter((a) => a.conferenceId === detailsFor.id).length}
                  </div>
                  <div className="grid gap-2 max-h-72 overflow-auto pr-1">
                    {myAttendance.filter((a) => a.conferenceId === detailsFor.id).length === 0 ? (
                      <div className="text-sm text-muted-foreground">Aún no hay asistencias para esta reunión.</div>
                    ) : (
                      myAttendance
                        .filter((a) => a.conferenceId === detailsFor.id)
                        .slice()
                        .sort((a, b) => a.markedAt.localeCompare(b.markedAt))
                        .map((a) => (
                          <div key={a.id} className="text-sm">
                            <span className="font-medium">{studentsById.get(a.studentId)?.nombre ?? a.studentId}</span>{" "}
                            <span className="text-muted-foreground">· {new Date(a.markedAt).toLocaleString()}</span>
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
          <div className="font-heading font-black mb-2">Listado de estudiantes (simulado)</div>
          <div className="text-sm text-muted-foreground">
            Se consideran “entraron” los que registraron asistencia por OTP contextual.
          </div>
          <div className="mt-3 grid gap-2">
            {Array.from(uniqueStudents).slice(0, 20).map((id) => (
              <div key={id} className="text-sm">
                {studentsById.get(id)?.nombre ?? id}
              </div>
            ))}
            {uniqueStudents.size === 0 && (
              <div className="text-sm text-muted-foreground">Aún no hay asistencias.</div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}

