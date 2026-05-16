import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getHomeContent, useHomeContent } from "@/features/content/storage";

import {
  Columns3,
  CalendarDays,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  ImageIcon,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiClient, ApiError, type Conference, type StatsOverview } from "@/lib/api";
import SessionCard from "@/components/shared/SessionCard";
import { SessionType, agendaData } from "@/data/agendaData";

const AGENDA_PUBLIC_DAY_COUNT = agendaData.length;
const AGENDA_PUBLIC_SESSION_TOTAL = agendaData.reduce(
  (acc, day) => acc + day.sessions.length,
  0,
);

function localInputToIso(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toISOString();
}

function isoToLocalInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatTimeHm(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
}

function dateFromIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function conferenceId(c: Conference): string {
  return (c._id || c.id || "") as string;
}

const GALLERY_SPAN_PRESETS: { id: string; label: string; span: string }[] = [
  { id: "normal", label: "Celda normal", span: "" },
  { id: "hero", label: "Destacada (2×2)", span: "md:col-span-2 md:row-span-2" },
  { id: "wide", label: "Ancha (2 columnas)", span: "md:col-span-2" },
];

function gallerySpanToPresetId(span?: string): string {
  const s = span ?? "";
  return GALLERY_SPAN_PRESETS.find((p) => p.span === s)?.id ?? "normal";
}

const EMPTY_REUNION = (): ReunionFormState => ({
  apiId: null,
  title: "",
  description: "",
  location: "",
  start_at: "",
  end_at: "",
  capacity: "",
  previewType: "conference",
  previewSpeaker: "",
  previewTrack: "",
});

type ReunionFormState = {
  apiId: string | null;
  title: string;
  description: string;
  location: string;
  start_at: string;
  end_at: string;
  capacity: string;
  previewType: SessionType;
  previewSpeaker: string;
  previewTrack: string;
};

export default function WebMasterDashboard() {
  type Tab = "resumen" | "reuniones" | "guia";
  const [activeTab, setActiveTab] = useState<Tab>("resumen");
  const { toast } = useToast();
  const [apiStats, setApiStats] = useState<StatsOverview | null>(null);

  const [conferences, setConferences] = useState<Conference[]>([]);
  const [confLoading, setConfLoading] = useState(false);
  const [reunionForm, setReunionForm] = useState<ReunionFormState>(EMPTY_REUNION);
  const [selectedReunionListKey, setSelectedReunionListKey] = useState<string | null>(null);

  const { updateContent } = useHomeContent();
  const [galleryDraft, setGalleryDraft] = useState(() =>
    getHomeContent().galleryImages.map((x) => ({ ...x }))
  );

  useEffect(() => {
    if (activeTab === "guia") {
      setGalleryDraft(getHomeContent().galleryImages.map((x) => ({ ...x })));
    }
  }, [activeTab]);

  const loadStats = useCallback(async () => {
    try {
      setApiStats(await apiClient.getStatsOverview());
    } catch {
      setApiStats(null);
    }
  }, []);

  const loadConferences = useCallback(async () => {
    setConfLoading(true);
    try {
      const data = await apiClient.getConferences();
      setConferences(
        [...data].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
      );
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Error al cargar reuniones";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setConfLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStats();
    loadConferences();
  }, [loadStats, loadConferences]);

  const openReunion = (c: Conference) => {
    const id = conferenceId(c);
    setSelectedReunionListKey(id);
    setReunionForm({
      apiId: id,
      title: c.title,
      description: c.description || "",
      location: c.location || "",
      start_at: isoToLocalInput(c.start_at),
      end_at: isoToLocalInput(c.end_at),
      capacity: c.capacity != null ? String(c.capacity) : "",
      previewType: "conference",
      previewSpeaker: "",
      previewTrack: "",
    });
  };

  const newReunionDraft = () => {
    setSelectedReunionListKey("__new__");
    setReunionForm(EMPTY_REUNION());
  };

  const saveReunion = async () => {
    if (!reunionForm.title.trim()) {
      toast({ title: "Falta el título", variant: "destructive" });
      return;
    }
    if (!reunionForm.start_at || !reunionForm.end_at) {
      toast({ title: "Indica inicio y fin", variant: "destructive" });
      return;
    }
    const capRaw = reunionForm.capacity.trim();
    const capNum = capRaw ? parseInt(capRaw, 10) : undefined;
    if (capRaw && (Number.isNaN(capNum) || capNum! < 0)) {
      toast({ title: "Cupo inválido", variant: "destructive" });
      return;
    }
    const payload: Parameters<typeof apiClient.createConference>[0] = {
      title: reunionForm.title.trim(),
      description: reunionForm.description.trim() || undefined,
      location: reunionForm.location.trim() || "Por definir",
      start_at: localInputToIso(reunionForm.start_at),
      end_at: localInputToIso(reunionForm.end_at),
    };
    if (capNum !== undefined) payload.capacity = capNum;
    try {
      if (reunionForm.apiId) {
        await apiClient.updateConference(reunionForm.apiId, payload);
        toast({ title: "Reunión actualizada" });
      } else {
        await apiClient.createConference(payload);
        toast({ title: "Reunión creada" });
      }
      await loadConferences();
      await loadStats();
      setReunionForm(EMPTY_REUNION());
      setSelectedReunionListKey(null);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "No se pudo guardar";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  const deleteReunion = async (id: string) => {
    if (!window.confirm("¿Eliminar esta reunión de la base de datos?")) return;
    try {
      await apiClient.deleteConference(id);
      toast({ title: "Reunión eliminada" });
      if (reunionForm.apiId === id) {
        setReunionForm(EMPTY_REUNION());
        setSelectedReunionListKey(null);
      }
      await loadConferences();
      await loadStats();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Error al eliminar";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  const previewSessionDate = useMemo(() => {
    if (!reunionForm.start_at) return new Date().toISOString().slice(0, 10);
    return dateFromIso(localInputToIso(reunionForm.start_at));
  }, [reunionForm.start_at]);

  const previewTime = reunionForm.start_at ? formatTimeHm(localInputToIso(reunionForm.start_at)) : "00:00";
  const previewEndTime = reunionForm.end_at ? formatTimeHm(localInputToIso(reunionForm.end_at)) : "00:00";

  const tabBtn = (id: Tab, label: React.ReactNode, icon?: React.ReactNode) => (
    <Button
      variant={activeTab === id ? "default" : "ghost"}
      onClick={() => setActiveTab(id)}
      className={
        activeTab === id
          ? "bg-purple-600 hover:bg-purple-700 text-white"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
      }
    >
      {icon}
      {label}
    </Button>
  );

  const saveGallery = () => {
    updateContent({ galleryImages: galleryDraft });
    toast({ title: "Galería guardada", description: "Ya puedes verla en Inicio → #galeria" });
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-foreground">
      <div className="border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 border border-purple-200 grid place-items-center">
              <Columns3 className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h1 className="font-heading font-black text-xl tracking-tight text-foreground">CONIITI · Editor de contenido</h1>
              <p className="text-xs text-muted-foreground">
                Reuniones e inscripciones vía microservicios; la grilla visible en Agenda sale de{" "}
                <span className="font-mono text-foreground">agendaData.ts</span> más los datos enlazados
                (<span className="font-mono">agenda_session_id</span>)
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard">
                <BarChart3 className="w-4 h-4 mr-2" />
                Panel estadísticas / usuarios
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Inicio
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-6">
        <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-card border border-border shadow-sm mb-8">
          {tabBtn("resumen", "Resumen", null)}
          {tabBtn("reuniones", "Reuniones (servidor)", <CalendarDays className="w-4 h-4 mr-2" />)}
          {tabBtn("guia", "Portada e imágenes", <ImageIcon className="w-4 h-4 mr-2" />)}
        </div>

        {activeTab === "resumen" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Resumen</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Las reuniones (<strong className="text-foreground">inscripciones y cupos</strong>) están en{" "}
                <strong className="text-purple-700">Reuniones (servidor)</strong>. La tabla horaria que ve el público
                en la ruta Agenda es el archivo <strong className="text-foreground">agendaData.ts</strong>; cada sesión
                inscribible debe tener su fila enlazada en API con{" "}
                <strong className="text-foreground">agenda_session_id</strong> (seed del microservicio).
              </p>
            </div>
            {apiStats && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Usuarios", value: apiStats.users_total, sub: `Verificados: ${apiStats.users_verified}` },
                  { label: "Reuniones API", value: apiStats.conferences, sub: "Gestionadas aquí" },
                  { label: "Sesiones agenda API", value: apiStats.agenda_sessions, sub: "Endpoint /sessions" },
                  { label: "Eventos calendario", value: apiStats.calendar_events, sub: "Módulo calendario" },
                ].map((x) => (
                  <Card key={x.label} className="bg-card border-border shadow-sm">
                    <CardContent className="p-5">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{x.label}</div>
                      <div className="text-3xl font-black text-purple-700 mt-1">{x.value}</div>
                      <p className="text-xs text-muted-foreground mt-2">{x.sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-sm text-purple-800 font-semibold mb-1">Sesiones en agenda publicada</div>
                  <div className="text-4xl font-black text-foreground">{AGENDA_PUBLIC_SESSION_TOTAL}</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground font-semibold mb-1">Días en agenda publicada</div>
                  <div className="text-4xl font-black text-foreground">{AGENDA_PUBLIC_DAY_COUNT}</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border shadow-sm">
                <CardContent className="p-6 flex flex-col justify-center gap-3">
                  <Button onClick={() => setActiveTab("reuniones")} className="bg-purple-600 hover:bg-purple-700 w-full">
                    Ir a reuniones API
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/agenda">Ver agenda pública</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "reuniones" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
            <Card className="lg:col-span-3 bg-card border-border shadow-sm">
              <CardHeader className="py-4 border-b border-border">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">Lista</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => loadConferences()} title="Recargar">
                      <RefreshCw className={`w-4 h-4 ${confLoading ? "animate-spin" : ""}`} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={newReunionDraft} title="Nueva reunión" className="text-purple-700 hover:text-purple-800 hover:bg-purple-50">
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-xs">Clic para editar · Se guardan en el backend</CardDescription>
              </CardHeader>
              <CardContent className="p-3 max-h-[640px] overflow-y-auto space-y-2">
                {confLoading && conferences.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">Cargando…</p>
                ) : conferences.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2">No hay reuniones. Pulsa + para crear.</p>
                ) : (
                  conferences.map((c) => {
                    const id = conferenceId(c);
                    const active = selectedReunionListKey === id;
                    return (
                      <div
                        key={id}
                        className={`group rounded-lg border p-3 cursor-pointer transition-colors ${
                          active ? "bg-purple-50 border-purple-200" : "border-border hover:bg-muted/50"
                        }`}
                        onClick={() => openReunion(c)}
                      >
                        <div className="flex justify-between gap-2 items-start">
                          <div className="min-w-0">
                            <div className="font-semibold text-sm line-clamp-2 text-foreground">{c.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(c.start_at).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteReunion(id);
                            }}
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-5 bg-card border-border shadow-sm">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg flex items-center justify-between gap-2">
                  {reunionForm.apiId ? "Editar reunión" : "Nueva reunión"}
                  <div className="flex gap-2">
                    {reunionForm.apiId && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8"
                        onClick={() => deleteReunion(reunionForm.apiId!)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                      </Button>
                    )}
                    <Button size="sm" className="h-8 bg-purple-600 hover:bg-purple-700" onClick={saveReunion}>
                      <Save className="w-4 h-4 mr-1" /> Guardar
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Datos en la API. La vista previa usa el mismo componente que la agenda pública.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid gap-2">
                  <Label htmlFor="reunion-title">Título</Label>
                  <Input
                    id="reunion-title"
                    value={reunionForm.title}
                    onChange={(e) => setReunionForm({ ...reunionForm, title: e.target.value })}
                    placeholder="Nombre de la reunión"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reunion-desc">Descripción</Label>
                  <Textarea
                    id="reunion-desc"
                    className="min-h-[100px]"
                    value={reunionForm.description}
                    onChange={(e) => setReunionForm({ ...reunionForm, description: e.target.value })}
                    placeholder="Texto breve (se muestra en la tarjeta)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reunion-loc">Ubicación</Label>
                  <Input
                    id="reunion-loc"
                    value={reunionForm.location}
                    onChange={(e) => setReunionForm({ ...reunionForm, location: e.target.value })}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="reunion-start">Inicio</Label>
                    <Input
                      id="reunion-start"
                      type="datetime-local"
                      value={reunionForm.start_at}
                      onChange={(e) => setReunionForm({ ...reunionForm, start_at: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reunion-end">Fin</Label>
                    <Input
                      id="reunion-end"
                      type="datetime-local"
                      value={reunionForm.end_at}
                      onChange={(e) => setReunionForm({ ...reunionForm, end_at: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="reunion-cap">Cupo (opcional)</Label>
                    <Input
                      id="reunion-cap"
                      type="number"
                      min={0}
                      value={reunionForm.capacity}
                      onChange={(e) => setReunionForm({ ...reunionForm, capacity: e.target.value })}
                      placeholder="Ej. 50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tipo en vista previa</Label>
                    <Select value={reunionForm.previewType} onValueChange={(v: SessionType) => setReunionForm({ ...reunionForm, previewType: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["keynote", "conference", "workshop", "panel", "networking", "break"] as const).map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="reunion-prev-speaker">Conferencista (solo vista previa)</Label>
                    <Input
                      id="reunion-prev-speaker"
                      value={reunionForm.previewSpeaker}
                      onChange={(e) => setReunionForm({ ...reunionForm, previewSpeaker: e.target.value })}
                      placeholder="No se guarda en el servidor"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reunion-prev-track">Track (solo vista previa)</Label>
                    <Input
                      id="reunion-prev-track"
                      value={reunionForm.previewTrack}
                      onChange={(e) => setReunionForm({ ...reunionForm, previewTrack: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <h3 className="font-semibold text-muted-foreground mb-3 flex items-center uppercase tracking-wide text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                  Vista previa (tarjeta agenda)
                </h3>
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="pointer-events-none opacity-95 scale-[0.92] origin-top text-foreground">
                    <SessionCard
                      sessionId={reunionForm.apiId || "preview"}
                      index={0}
                      sessionDate={previewSessionDate}
                      isLoggedIn={false}
                      isInscribed={false}
                      totalInscriptions={0}
                      time={previewTime}
                      endTime={previewEndTime}
                      title={reunionForm.title || "Sin título"}
                      type={reunionForm.previewType}
                      speaker={reunionForm.previewSpeaker || undefined}
                      location={reunionForm.location || "Ubicación"}
                      track={reunionForm.previewTrack || undefined}
                      description={reunionForm.description || undefined}
                      capacity={reunionForm.capacity ? parseInt(reunionForm.capacity, 10) : undefined}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "guia" && (
          <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <ImageIcon className="w-5 h-5 text-purple-700" />
                  Galería de la portada
                </CardTitle>
                <CardDescription>
                  Misma configuración que en Inicio → sección Galería. Se guarda en localStorage de este navegador.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={saveGallery}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar galería
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setGalleryDraft(getHomeContent().galleryImages.map((x) => ({ ...x })))}
                  >
                    Descartar cambios
                  </Button>
                  <Button asChild variant="secondary">
                    <Link to="/#galeria" target="_blank" rel="noopener noreferrer">
                      Ver en portada
                    </Link>
                  </Button>
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                  {galleryDraft.map((img, i) => (
                    <div
                      key={i}
                      className="grid gap-4 sm:grid-cols-[100px_1fr] border border-border rounded-lg p-4 bg-muted/20"
                    >
                      <div className="relative aspect-square rounded-md overflow-hidden bg-muted border border-border">
                        {img.url ? (
                          <img src={img.url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground text-center p-1">Sin URL</div>
                        )}
                      </div>
                      <div className="space-y-3 min-w-0">
                        <div className="grid gap-2">
                          <Label>URL de la imagen</Label>
                          <Input
                            placeholder="https://…"
                            value={img.url}
                            onChange={(e) => {
                              const next = [...galleryDraft];
                              next[i] = { ...next[i], url: e.target.value };
                              setGalleryDraft(next);
                            }}
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="grid gap-2">
                            <Label>Texto alternativo</Label>
                            <Input
                              value={img.alt}
                              onChange={(e) => {
                                const next = [...galleryDraft];
                                next[i] = { ...next[i], alt: e.target.value };
                                setGalleryDraft(next);
                              }}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Tamaño en cuadrícula</Label>
                            <Select
                              value={gallerySpanToPresetId(img.span)}
                              onValueChange={(id) => {
                                const preset = GALLERY_SPAN_PRESETS.find((p) => p.id === id);
                                const next = [...galleryDraft];
                                next[i] = {
                                  ...next[i],
                                  span: preset?.span ? preset.span : undefined,
                                };
                                setGalleryDraft(next);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {GALLERY_SPAN_PRESETS.map((opt) => (
                                  <SelectItem key={opt.id} value={opt.id}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setGalleryDraft(galleryDraft.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Quitar imagen
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed border-2"
                  onClick={() => setGalleryDraft([...galleryDraft, { url: "", alt: "Nueva imagen", span: "" }])}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir imagen
                </Button>

                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide mb-2 block">Vista previa del mosaico</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl rounded-xl border border-border p-4 bg-muted/10">
                    {galleryDraft.map((img, i) => (
                      <div
                        key={i}
                        className={`relative overflow-hidden rounded-lg bg-muted border aspect-square ${img.span || ""}`}
                      >
                        {img.url ? (
                          <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground p-2 text-center">Vacío</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
