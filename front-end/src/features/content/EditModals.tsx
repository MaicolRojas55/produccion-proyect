import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHomeContent, HomeContent } from "./storage";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth/useAuth";

const EditButton = () => (
  <Button variant="secondary" size="icon" className="absolute top-2 right-2 bg-white/80 hover:bg-white text-purple-600 shadow-lg z-50 rounded-full w-10 h-10 animate-bounce cursor-pointer">
    <Pencil className="w-5 h-5" />
  </Button>
);

export function EditHeroModal({ children }: { children: React.ReactNode }) {
  const { content, updateContent } = useHomeContent();
  const [subtitle, setSubtitle] = useState(content.heroSubtitle);
  const [notice, setNotice] = useState(content.heroNotice);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  if (user?.role !== "web_master" && user?.role !== "super_admin") return <>{children}</>;

  const handleSave = () => {
    updateContent({ heroSubtitle: subtitle, heroNotice: notice });
    setOpen(false);
    toast({ title: "Hero Actualizado", description: "El mensaje de bienvenida se modificó correctamente." });
  };

  return (
    <div className="relative group">
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="hidden group-hover:block"><EditButton /></div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar Textos del Hero</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subtítulo (El Congreso Internacional...)</label>
              <Input value={subtitle} onChange={e => setSubtitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Noticia / Descripción Corta</label>
              <Input value={notice} onChange={e => setNotice(e.target.value)} />
            </div>
            <Button onClick={handleSave} className="w-full bg-purple-600">Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function EditGalleryModal({ children }: { children: React.ReactNode }) {
  const { content, updateContent } = useHomeContent();
  const [images, setImages] = useState(content.galleryImages);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  if (user?.role !== "web_master" && user?.role !== "super_admin") return <>{children}</>;

  const handleSave = () => {
    updateContent({ galleryImages: images });
    setOpen(false);
    toast({ title: "Galería Actualizada", description: "Se han guardado las nuevas imágenes." });
  };

  const handleAdd = () => setImages([...images, { url: "", alt: "Nueva Imagen", span: "" }]);
  const handleRemove = (i: number) => setImages(images.filter((_, idx) => idx !== i));

  return (
    <div className="relative group">
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="hidden group-hover:block"><EditButton /></div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Imágenes de Galería</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {images.map((img, i) => (
              <div key={i} className="flex items-center gap-2 border p-2 rounded-md">
                <Input value={img.url} placeholder="https:// URL imagen..." onChange={e => {
                  const newI = [...images]; newI[i].url = e.target.value; setImages(newI);
                }} />
                <Input value={img.alt} placeholder="Texto Alternativo" className="w-1/3" onChange={e => {
                   const newI = [...images]; newI[i].alt = e.target.value; setImages(newI);
                }} />
                <Button variant="ghost" size="icon" onClick={() => handleRemove(i)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
              </div>
            ))}
            <Button variant="outline" onClick={handleAdd} className="w-full border-dashed"><Plus className="w-4 h-4 mr-2"/>Añadir Imagen Web</Button>
            <Button onClick={handleSave} className="w-full bg-purple-600">Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function EditMemoriesModal({ children }: { children: React.ReactNode }) {
  const { content, updateContent } = useHomeContent();
  const [memorias, setMemorias] = useState(content.memorias);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  if (user?.role !== "web_master" && user?.role !== "super_admin") return <>{children}</>;

  const handleSave = () => {
    updateContent({ memorias });
    setOpen(false);
    toast({ title: "Memorias Actualizadas" });
  };

  const handleAdd = () => setMemorias([...memorias, { id: `${Date.now()}`, year: "2024", title: "Nuevo Evento", desc: "Descripción breve..." }]);

  return (
    <div className="relative group w-full">
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="hidden group-hover:block w-full"><EditButton /></div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Gestor de Ediciones Anteriores</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {memorias.map((m, i) => (
              <div key={m.id} className="grid grid-cols-12 gap-2 border p-3 rounded-md bg-slate-50">
                <Input className="col-span-3" value={m.year} onChange={e => { const n = [...memorias]; n[i].year = e.target.value; setMemorias(n); }} placeholder="Año" />
                <Input className="col-span-8" value={m.title} onChange={e => { const n = [...memorias]; n[i].title = e.target.value; setMemorias(n); }} placeholder="Título de Edición" />
                <Button className="col-span-1" variant="ghost" size="icon" onClick={() => setMemorias(memorias.filter((_, idx) => idx !== i))}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                <Input className="col-span-12" value={m.desc} onChange={e => { const n = [...memorias]; n[i].desc = e.target.value; setMemorias(n); }} placeholder="Descripción corta" />
              </div>
            ))}
            <Button variant="outline" onClick={handleAdd} className="w-full border-dashed"><Plus className="w-4 h-4 mr-2"/>Añadir Nueva Memoria</Button>
            <Button onClick={handleSave} className="w-full bg-purple-600">Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Para campos sencillos estilo Contacto, Fechas, Autores usaremos modales modulares aquí también de ser necesario en index.tsx

export function EditCountryModal({ children }: { children: React.ReactNode }) {
  const { content, updateContent } = useHomeContent();
  const [fc, setFc] = useState(content.featuredCountry ?? { name: "España", flag: "🇪🇸", description: "" });
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  if (user?.role !== "web_master" && user?.role !== "super_admin") return <>{children}</>;

  return (
    <div className="relative group">
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="hidden group-hover:block"><EditButton /></div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar País Invitado de Honor</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1 col-span-1"><label className="text-sm font-medium">Bandera (emoji)</label><Input value={fc.flag} onChange={e => setFc({ ...fc, flag: e.target.value })} placeholder="🇪🇸" /></div>
              <div className="space-y-1 col-span-2"><label className="text-sm font-medium">Nombre del País</label><Input value={fc.name} onChange={e => setFc({ ...fc, name: e.target.value })} /></div>
            </div>
            <div className="space-y-1"><label className="text-sm font-medium">Descripción</label><Input value={fc.description} onChange={e => setFc({ ...fc, description: e.target.value })} /></div>
            <Button onClick={() => { updateContent({ featuredCountry: fc }); setOpen(false); toast({ title: "País Actualizado" }); }} className="w-full bg-purple-600">Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function EditSpeakerModal({ speakerId, children }: { speakerId: string; children: React.ReactNode }) {
  const { content, updateContent } = useHomeContent();
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const speakerIdx = content.conferencistas.findIndex(s => s.id === speakerId);
  const [form, setForm] = useState(content.conferencistas[speakerIdx] ?? { id: speakerId, name: "", role: "", img: "", bio: "", track: "" });

  if (user?.role !== "web_master" && user?.role !== "super_admin") return <>{children}</>;

  const handleSave = () => {
    const updated = [...content.conferencistas];
    if (speakerIdx > -1) updated[speakerIdx] = form;
    updateContent({ conferencistas: updated });
    setOpen(false);
    toast({ title: "Conferencista actualizado" });
  };

  const handleDelete = () => {
    updateContent({ conferencistas: content.conferencistas.filter(s => s.id !== speakerId) });
    setOpen(false);
    toast({ title: "Conferencista eliminado", variant: "destructive" });
  };

  return (
    <div className="relative group">
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="hidden group-hover:flex absolute top-2 right-2 gap-1 z-50">
            <button className="bg-white/90 hover:bg-white text-purple-600 shadow-lg rounded-full p-1.5 border border-purple-100 transition-all"><Pencil className="w-4 h-4" /></button>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar Conferencista</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><label className="text-sm font-medium">Nombre Completo</label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1"><label className="text-sm font-medium">Cargo / Rol</label><Input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /></div>
            <div className="space-y-1"><label className="text-sm font-medium">URL Foto</label><Input value={form.img} onChange={e => setForm({ ...form, img: e.target.value })} placeholder="https://..." /></div>
            <div className="space-y-1"><label className="text-sm font-medium">Track / Área</label><Input value={form.track} onChange={e => setForm({ ...form, track: e.target.value })} /></div>
            <div className="space-y-1"><label className="text-sm font-medium">Biografía Corta</label><textarea className="w-full border rounded-md p-2 text-sm resize-none h-24" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1 bg-purple-600">Guardar</Button>
              <Button onClick={handleDelete} variant="destructive" className="shrink-0">Eliminar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
