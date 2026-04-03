import { AppNavbar } from "@/components/layout/AppNavbar";
import { useHomeContent, SpeakerItem } from "@/features/content/storage";
import { EditSpeakerModal } from "@/features/content/EditModals";
import { useAuth } from "@/features/auth/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, GraduationCap, Linkedin, Twitter, Github, Plus, Pencil } from "lucide-react";
import { useState } from "react";

function newId() {
  return `spk_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function Conferencistas() {
  const { content, updateContent } = useHomeContent();
  const { user } = useAuth();
  const speakers = content.conferencistas || [];
  const isEditor = user?.role === "web_master" || user?.role === "super_admin";

  const handleAddSpeaker = () => {
    const newSpeaker: SpeakerItem = {
      id: newId(),
      name: "Nuevo Conferencista",
      role: "Cargo / Institución",
      img: "",
      bio: "Breve biografía del conferencista.",
      track: "General",
    };
    updateContent({ conferencistas: [...speakers, newSpeaker] });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavbar variant="dark" layout="coniiti" />

      {/* Hero header */}
      <section className="relative overflow-hidden bg-[var(--gradient-hero)] pt-32 pb-20 px-4">
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_10%,hsl(var(--gold))_0%,transparent_45%),radial-gradient(circle_at_80%_30%,hsl(var(--sky))_0%,transparent_45%)]" />
        <div className="absolute inset-0 bg-navy-dark/65" />

        <div className="relative z-10 container mx-auto text-center max-w-4xl">
          <Badge className="mb-4 bg-purple-500/20 text-purple-200 border-purple-500/50">
            <Globe className="w-4 h-4 mr-2" /> Internacionales &amp; Nacionales
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-white font-heading mb-6 tracking-tight">
            Nuestros Conferencistas
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
            Conoce a los expertos, investigadores y líderes tecnológicos que compartirán su
            visión en la edición CONIITI de este año.
          </p>
          {isEditor && (
            <Button
              onClick={handleAddSpeaker}
              className="mt-8 bg-purple-600 hover:bg-purple-700 shadow-lg gap-2"
            >
              <Plus className="w-4 h-4" /> Agregar Conferencista
            </Button>
          )}
        </div>
      </section>

      {/* Grid completo */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {speakers.map((speaker) => (
            <EditSpeakerModal key={speaker.id} speakerId={speaker.id}>
              <Card className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 group relative">
                {isEditor && (
                  <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white rounded-full p-1.5 shadow-lg text-purple-600 border border-purple-100">
                      <Pencil className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}
                {/* Card header gradient */}
                <div className="h-52 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex justify-center items-end relative overflow-hidden">
                  <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_50%_-10%,#ffffff_0%,transparent_65%)]" />
                  {/* Decorative circles */}
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full border border-white/10" />
                  <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full border border-white/5" />
                  <div className="w-32 h-32 rounded-full border-4 border-white translate-y-1/2 overflow-hidden bg-white shadow-2xl flex-shrink-0 z-10">
                    <img
                      src={speaker.img && speaker.img !== "/placeholder.jpg"
                        ? speaker.img
                        : `https://api.dicebear.com/9.x/initials/svg?seed=${speaker.name}&backgroundColor=7c3aed&textColor=ffffff`}
                      alt={speaker.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>

                <CardContent className="pt-20 pb-8 px-8 text-center space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 font-heading mb-1">{speaker.name}</h3>
                    <p className="text-purple-600 font-semibold text-sm">{speaker.role}</p>
                  </div>

                  <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    {speaker.track}
                  </Badge>

                  {speaker.bio && (
                    <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4 text-left">
                      {speaker.bio}
                    </p>
                  )}

                  {/* Social links (decorative for now) */}
                  <div className="flex justify-center gap-2 pt-2">
                    {[Linkedin, Twitter, Github].map((Icon, i) => (
                      <button
                        key={i}
                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </EditSpeakerModal>
          ))}
        </div>

        {speakers.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Aún no hay conferencistas registrados.</p>
            {isEditor && (
              <Button onClick={handleAddSpeaker} className="mt-4 bg-purple-600 hover:bg-purple-700 gap-2">
                <Plus className="w-4 h-4" /> Agregar primero
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
