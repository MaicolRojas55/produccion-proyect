import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Check, Columns3, FileText, Image as ImageIcon, LayoutList, Calendar, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEditableAgenda } from "@/features/agenda/storage";
import SessionCard from "@/components/shared/SessionCard";
import { Session, SessionType } from "@/data/agendaData";

const AUDIT_LOGS = [
  { id: 1, date: "2024-04-01 10:20", user: "webmaster@test.com", action: "Edición", resource: "Agenda de Día 1" },
  { id: 2, date: "2024-04-01 09:15", user: "webmaster@test.com", action: "Subida de Logo", resource: "Media: sponsor_1.png" },
];

export default function WebMasterDashboard() {
  const [activeTab, setActiveTab] = useState<"agenda" | "media" | "logs">("agenda");
  const { toast } = useToast();
  
  const { agenda, updateAgenda } = useEditableAgenda();
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Session> | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: formData?.description || "",
    onUpdate: ({ editor }) => {
      setFormData(prev => prev ? { ...prev, description: editor.getHTML() } : null);
    }
  });

  useEffect(() => {
    if (editor && formData && formData.description !== editor.getHTML()) {
      editor.commands.setContent(formData.description || "");
    }
  }, [selectedSessionId]);

  const activeDay = agenda[selectedDayIdx];
  const activeSession = activeDay?.sessions.find(s => s.id === selectedSessionId) || null;

  const handleSelectSession = (id: string) => {
    const s = activeDay.sessions.find(x => x.id === id);
    if (s) {
      setSelectedSessionId(s.id);
      setFormData({ ...s });
    }
  };

  const handleSaveSession = () => {
    if (!formData || !selectedSessionId) return;
    
    const newAgenda = [...agenda];
    const daySessions = [...newAgenda[selectedDayIdx].sessions];
    const sIdx = daySessions.findIndex(s => s.id === selectedSessionId);
    if (sIdx > -1) {
      daySessions[sIdx] = { ...daySessions[sIdx], ...formData } as Session;
      newAgenda[selectedDayIdx].sessions = daySessions;
      updateAgenda(newAgenda);
      
      toast({
        title: "Agenda Actualizada",
        description: "La sesión ha sido guardada y publicada en vivo.",
      });
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-6">
        <Columns3 className="w-8 h-8 text-purple-600" />
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          Content Manager (Web Master)
        </h1>
      </div>

      <div className="flex bg-white rounded-lg p-1 shadow-sm border w-fit">
        <Button variant={activeTab === "agenda" ? "default" : "ghost"} onClick={() => setActiveTab("agenda")}>
          <LayoutList className="w-4 h-4 mr-2" />
          Editor de Agenda
        </Button>
        <Button variant={activeTab === "media" ? "default" : "ghost"} onClick={() => setActiveTab("media")}>
          <ImageIcon className="w-4 h-4 mr-2" />
          Media Library
        </Button>
        <Button variant={activeTab === "logs" ? "default" : "ghost"} onClick={() => setActiveTab("logs")}>
          <Check className="w-4 h-4 mr-2" />
          Auditoría
        </Button>
      </div>

      <div className="mt-8">
        {activeTab === "agenda" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Lista de Sesiones */}
            <Card className="lg:col-span-3 shadow-sm border-none">
              <CardContent className="p-4">
                <Select value={String(selectedDayIdx)} onValueChange={(v) => { setSelectedDayIdx(Number(v)); setSelectedSessionId(null); }}>
                  <SelectTrigger className="mb-4">
                    <SelectValue placeholder="Seleccionar Día" />
                  </SelectTrigger>
                  <SelectContent>
                    {agenda.map((d, i) => <SelectItem key={i} value={String(i)}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {activeDay.sessions.map((s) => (
                    <div 
                      key={s.id} 
                      onClick={() => handleSelectSession(s.id)}
                      className={`p-3 rounded-md cursor-pointer border text-sm transition-colors ${selectedSessionId === s.id ? 'bg-purple-100 border-purple-300' : 'hover:bg-slate-50'}`}
                    >
                      <div className="font-semibold text-gray-800 line-clamp-1">{s.title}</div>
                      <div className="text-xs text-gray-500">{s.time} - {s.endTime}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Formulario de Edición */}
            {formData && selectedSessionId ? (
              <Card className="lg:col-span-5 shadow-lg border-none bg-white">
                <CardHeader className="border-b pb-4 mb-4">
                  <CardTitle className="text-xl flex items-center justify-between">
                    Editar Sesión
                    <Button size="sm" onClick={handleSaveSession} className="bg-purple-600 hover:bg-purple-700">
                      <Save className="w-4 h-4 mr-2" /> Guardar Todos los Cambios
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Hora Inicio</label>
                      <Input value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Hora Fin</label>
                      <Input value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Título de la Sesión</label>
                    <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Conferencista</label>
                      <Input value={formData.speaker || ""} onChange={e => setFormData({ ...formData, speaker: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Lugar</label>
                      <Input value={formData.location || ""} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Tipo</label>
                      <Select value={formData.type} onValueChange={(v: SessionType) => setFormData({ ...formData, type: v })}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                          {["keynote", "conference", "workshop", "panel", "networking", "break"].map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Track / Tema</label>
                      <Input value={formData.track || ""} onChange={e => setFormData({ ...formData, track: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-1 pt-2">
                    <label className="text-sm font-medium">Descripción Completa</label>
                    <div className="border rounded-lg overflow-hidden bg-white shadow-sm mt-1">
                      <div className="bg-slate-50 p-2 flex gap-2 border-b">
                        <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleBold().run()} className={editor?.isActive('bold') ? 'bg-slate-200' : ''}>Negrita</Button>
                        <Button variant="ghost" size="sm" onClick={() => editor?.chain().focus().toggleItalic().run()} className={editor?.isActive('italic') ? 'bg-slate-200' : ''}>Cursiva</Button>
                      </div>
                      <div className="p-3 min-h-[150px]">
                        <EditorContent editor={editor} className="prose prose-sm max-w-none focus:outline-none" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-12 text-center text-gray-400 bg-slate-50 rounded-xl border border-dashed border-gray-200">
                <Calendar className="w-12 h-12 mb-4 text-gray-300" />
                <p>Selecciona una sesión de la lista para editarla y ver su vista previa aquí.</p>
              </div>
            )}

            {/* Live Preview de la Tarjeta */}
            <div className="lg:col-span-4">
              <div className="sticky top-6">
                <h3 className="font-semibold text-gray-500 mb-4 flex items-center uppercase tracking-wide text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                  Vista Previa en Vivo
                </h3>
                {formData ? (
                  <div className="pointer-events-none opacity-90 scale-[0.95] origin-top">
                    {/* Intercept interactions so they dont accidentally navigate while previewing */}
                    <SessionCard 
                      sessionId={formData.id!} 
                      index={0} 
                      sessionDate={activeDay.date} 
                      isLoggedIn={false} 
                      isInscribed={false} 
                      totalInscriptions={0}
                      time={formData.time!}
                      endTime={formData.endTime!}
                      title={formData.title!}
                      type={formData.type!}
                      speaker={formData.speaker}
                      location={formData.location!}
                      track={formData.track}
                      description={formData.description}
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Previsualización de Tarjeta</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Media Management Tab */}
        {activeTab === "media" && (
          <Card className="shadow-lg border-none bg-white/60">
            <CardHeader>
              <CardTitle>Gestor de Media Locales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-64 bg-slate-50 relative overflow-hidden">
                <ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500">Arrastra logos o imágenes aquí, o haz clic para subir</p>
                <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audit Logs Tab */}
        {activeTab === "logs" && (
          <Card className="shadow-lg border-none bg-white/60">
            <CardHeader>
              <CardTitle>Registros de Auditoría</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Recurso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {AUDIT_LOGS.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-gray-500">{log.date}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell className="font-semibold text-blue-600">{log.action}</TableCell>
                      <TableCell>{log.resource}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
