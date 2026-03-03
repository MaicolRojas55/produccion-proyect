import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, CheckCircle2, ClipboardPaste, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import { getDeviceId } from "@/device/device";
import { issueOtp, verifyAndConsumeOtp } from "@/otp/otp";
import { loadAttendance, loadConferences, loadStudentAgenda, saveAttendance, saveStudentAgenda } from "@/conference/storage";
import type { Attendance, Conference, StudentAgendaItem } from "@/conference/types";

function newId() {
  const c = crypto as unknown as { randomUUID?: () => string };
  return c?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function formatIsoShort(iso: string) {
  return new Date(iso).toLocaleString();
}

function parseQrPayload(raw: string): { conferenceId: string; timestamp: number } | null {
  try {
    const obj = JSON.parse(raw) as { conference_id?: string; timestamp?: number };
    if (!obj.conference_id || typeof obj.timestamp !== "number") return null;
    return { conferenceId: obj.conference_id, timestamp: obj.timestamp };
  } catch {
    return null;
  }
}

function isWithinTimeWindow(conf: Conference) {
  const now = Date.now();
  const start = new Date(conf.startAt).getTime();
  const end = new Date(conf.endAt).getTime();
  const early = start - 10 * 60 * 1000;
  const late = end + 5 * 60 * 1000;
  return now >= early && now <= late;
}

export default function StudentPortal() {
  const { user, logout } = useAuth();
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState<"disponibles" | "agendadas">("disponibles");

  const [scanOpen, setScanOpen] = useState(false);
  const [qrRaw, setQrRaw] = useState("");
  const [otpShown, setOtpShown] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpCtx, setOtpCtx] = useState<{ conferenceId: string } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const conferences = useMemo(() => {
    void tick;
    return loadConferences().sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [tick]);

  const agenda = useMemo(() => {
    void tick;
    return loadStudentAgenda();
  }, [tick]);

  const attendance = useMemo(() => {
    void tick;
    return loadAttendance();
  }, [tick]);

  if (!user) return null;
  if (user.role !== "estudiante") return null;

  const myAgendaIds = new Set(agenda.filter((a) => a.studentId === user.id).map((a) => a.conferenceId));
  const myAgendaItems = conferences.filter((c) => myAgendaIds.has(c.id));
  const availableItems = conferences.filter((c) => !myAgendaIds.has(c.id));

  const markAgenda = (conferenceId: string) => {
    const all = loadStudentAgenda();
    const exists = all.some((a) => a.studentId === user.id && a.conferenceId === conferenceId);
    if (exists) return;
    const item: StudentAgendaItem = {
      id: newId(),
      studentId: user.id,
      conferenceId,
      createdAt: nowIso(),
    };
    saveStudentAgenda([...all, item]);
    setTick((t) => t + 1);
  };

  const alreadyAttended = (conferenceId: string) => {
    return attendance.some((a) => a.studentId === user.id && a.conferenceId === conferenceId);
  };

  const registerAttendance = (conferenceId: string) => {
    const all = loadAttendance();
    const exists = all.some((a) => a.studentId === user.id && a.conferenceId === conferenceId);
    if (exists) return;
    const rec: Attendance = {
      id: newId(),
      conferenceId,
      studentId: user.id,
      deviceId: getDeviceId(),
      markedAt: nowIso(),
    };
    saveAttendance([...all, rec]);
    setTick((t) => t + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-muted grid place-items-center">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="font-heading font-black">Estudiante</div>
              <div className="text-xs text-muted-foreground">{user.nombre}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              OTP contextual
            </Badge>
            <Button variant="secondary" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="font-heading font-black text-xl">Reuniones disponibles</div>
            <div className="text-sm text-muted-foreground">
              Puedes agendar una reunión y, al iniciar, validar tu presencia con QR + OTP (simulado).
            </div>
          </div>

          <Dialog open={scanOpen} onOpenChange={setScanOpen}>
            <DialogTrigger asChild>
              <Button>
                <ClipboardPaste className="h-4 w-4 mr-2" />
                Escanear QR (pegar)
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Escaneo QR (simulado)</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Pega aquí el código del profesor</Label>
                  <Input value={qrRaw} onChange={(e) => setQrRaw(e.target.value)} placeholder='{"conference_id":"...","timestamp":...}' />
                  <div className="text-xs text-muted-foreground">
                    El QR es dinámico (60s). El OTP resultante dura 90s y es de un solo uso.
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setScanError(null);
                    const parsed = parseQrPayload(qrRaw);
                    if (!parsed) {
                      setScanError("QR inválido. Pega el JSON completo.");
                      return;
                    }
                    const ageMs = Date.now() - parsed.timestamp;
                    if (ageMs < 0 || ageMs > 60_000) {
                      setScanError("QR expirado. Pide al profesor uno nuevo (válido 60s).");
                      return;
                    }

                    const conf = loadConferences().find((c) => c.id === parsed.conferenceId) ?? null;
                    if (!conf) {
                      setScanError("Conferencia no encontrada.");
                      return;
                    }
                    if (!isWithinTimeWindow(conf)) {
                      setScanError("Fuera de la ventana de tiempo permitida.");
                      return;
                    }
                    if (alreadyAttended(parsed.conferenceId)) {
                      setScanError("Ya registraste asistencia para esta conferencia.");
                      return;
                    }

                    if (user.primaryDeviceId && user.primaryDeviceId !== getDeviceId()) {
                      setScanError("Este no es tu dispositivo principal.");
                      return;
                    }

                    const rec = issueOtp({
                      purpose: "conference_attendance",
                      userId: user.id,
                      conferenceId: parsed.conferenceId,
                      ttlSeconds: 90,
                    });
                    setOtpShown(rec.otp);
                    setOtpCtx({ conferenceId: parsed.conferenceId });
                  }}
                >
                  Generar OTP (simulado)
                </Button>
                {scanError && <div className="text-sm text-red-600">{scanError}</div>}

                {otpShown && otpCtx && (
                  <Card className="p-4 bg-muted/30">
                    <div className="text-sm font-semibold">OTP enviado (simulado)</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      WhatsApp/SMS (simulado): <span className="font-mono">{otpShown}</span>
                    </div>
                    <div className="grid gap-2 mt-3">
                      <Label>Ingresa el OTP</Label>
                      <Input value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="123456" />
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const ok = verifyAndConsumeOtp({
                            purpose: "conference_attendance",
                            userId: user.id,
                            conferenceId: otpCtx.conferenceId,
                            otp: otpInput,
                          }).ok;
                          if (!ok) return;
                          registerAttendance(otpCtx.conferenceId);
                          setScanOpen(false);
                          setQrRaw("");
                          setOtpShown(null);
                          setOtpInput("");
                          setOtpCtx(null);
                        }}
                      >
                        Validar y registrar asistencia
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "disponibles" | "agendadas")} className="grid gap-4">
          <TabsList className="grid grid-cols-2 w-full max-w-xl">
            <TabsTrigger value="disponibles">Disponibles ({availableItems.length})</TabsTrigger>
            <TabsTrigger value="agendadas">Mis agendadas ({myAgendaItems.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="disponibles">
            <div className="grid gap-4">
              {availableItems.length === 0 ? (
                <Card className="p-6 text-sm text-muted-foreground">No tienes reuniones disponibles para agendar.</Card>
              ) : (
                availableItems.map((c) => {
                  const attended = alreadyAttended(c.id);
                  return (
                    <Card key={c.id} className="p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="font-heading font-black text-lg">{c.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatIsoShort(c.startAt)} → {formatIsoShort(c.endAt)}
                            {c.location ? ` · ${c.location}` : ""}
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

                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button variant="secondary" onClick={() => markAgenda(c.id)}>
                            Agendar
                          </Button>
                          <Button onClick={() => setScanOpen(true)} disabled={attended}>
                            {attended ? "Ya registraste" : "Registrar asistencia (QR+OTP)"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="agendadas">
            <div className="grid gap-4">
              {myAgendaItems.length === 0 ? (
                <Card className="p-6 text-sm text-muted-foreground">Aún no has agendado reuniones.</Card>
              ) : (
                myAgendaItems.map((c) => {
                  const attended = alreadyAttended(c.id);
                  return (
                    <Card key={c.id} className="p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="font-heading font-black text-lg">{c.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatIsoShort(c.startAt)} → {formatIsoShort(c.endAt)}
                            {c.location ? ` · ${c.location}` : ""}
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

                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button onClick={() => setScanOpen(true)} disabled={attended}>
                            {attended ? "Ya registraste" : "Registrar asistencia (QR+OTP)"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

