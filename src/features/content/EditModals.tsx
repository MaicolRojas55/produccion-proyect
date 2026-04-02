import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Save } from "lucide-react";
import { HomeContent } from "./storage";
import { useToast } from "@/hooks/use-toast";

export function EditHeroModal({ content, updateContent }: { content: HomeContent, updateContent: (c: HomeContent) => void }) {
  const [title, setTitle] = useState(content.hero.title);
  const [subtitle, setSubtitle] = useState(content.hero.subtitle);
  const [date, setDate] = useState(content.hero.date);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    updateContent({ ...content, hero: { title, subtitle, date } });
    setIsOpen(false);
    toast({ title: "Guardado", description: "El Hero ha sido modificado exitosamente." });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="ml-4 bg-white/20 hover:bg-white/40 text-white border-none w-8 h-8 rounded-full">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Editar Encabezado (Hero)</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2"><Label>Título Principal</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div className="grid gap-2"><Label>Subtítulo</Label><Input value={subtitle} onChange={e => setSubtitle(e.target.value)} /></div>
          <div className="grid gap-2"><Label>Texto de Fechas</Label><Input value={date} onChange={e => setDate(e.target.value)} /></div>
        </div>
        <div className="flex justify-end"><Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Guardar</Button></div>
      </DialogContent>
    </Dialog>
  );
}

export function EditGalleryModal({ content, updateContent }: { content: HomeContent, updateContent: (c: HomeContent) => void }) {
  const [gallery, setGallery] = useState(content.gallery.join(", "));
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    const list = gallery.split(",").map(s => s.trim()).filter(Boolean);
    updateContent({ ...content, gallery: list });
    setIsOpen(false);
    toast({ title: "Guardado", description: "La Galería ha sido modificada." });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-4 text-purple-600 border-purple-300">
          <Edit className="w-4 h-4 mr-2" /> Editar Galería
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Editar Galería</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-gray-500">Agrega el texto o los nombres de las imágenes separados por comas para modificarlos de forma global en la interfaz.</p>
          <div className="grid gap-2">
            <Label>Elementos de Galería</Label>
            <Input value={gallery} onChange={e => setGallery(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end"><Button onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Guardar</Button></div>
      </DialogContent>
    </Dialog>
  );
}
