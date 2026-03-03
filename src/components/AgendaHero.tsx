import { Calendar, MapPin, Globe } from "lucide-react";

const AgendaHero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
      <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_10%,hsl(var(--gold))_0%,transparent_45%),radial-gradient(circle_at_80%_30%,hsl(var(--sky))_0%,transparent_45%),radial-gradient(circle_at_50%_100%,hsl(var(--navy-light))_0%,transparent_55%)]" />
      <div className="absolute inset-0 bg-navy-dark/55" />

      <div className="relative z-10 container mx-auto px-4 py-20 md:py-28 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/20 border border-secondary/40 mb-6">
          <Globe className="w-4 h-4 text-secondary" />
          <span className="text-sm font-semibold text-secondary font-heading">
            País Invitado: España
          </span>
        </div>

        <h1 className="font-heading font-black text-4xl md:text-6xl lg:text-7xl text-primary-foreground mb-4 tracking-tight">
          Agenda{" "}
          <span className="text-gradient-gold">CONIITI 2025</span>
        </h1>

        <p className="font-heading text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
          XI Congreso Internacional de Innovación y Tendencias en Ingeniería
        </p>

        <div className="flex flex-wrap justify-center gap-6 text-primary-foreground/90 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary" />
            <span>1 – 3 de Octubre, 2025</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-secondary" />
            <span>Universidad Católica de Colombia — Sede 4, Bogotá</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgendaHero;
