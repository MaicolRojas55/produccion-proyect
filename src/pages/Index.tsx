import { useState } from "react";
import { agendaData } from "@/data/agendaData";
import AgendaHero from "@/components/AgendaHero";
import DayTabContent from "@/components/DayTabContent";
import { Mail, Phone, MapPin } from "lucide-react";

const Index = () => {
  const [activeDay, setActiveDay] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <AgendaHero />

      {/* Tabs */}
      <section className="container mx-auto px-4 -mt-6 relative z-20">
        <div className="bg-card rounded-xl shadow-[var(--shadow-card)] border border-border overflow-hidden">
          {/* Day tabs */}
          <div className="flex border-b border-border">
            {agendaData.map((day, i) => (
              <button
                key={day.date}
                onClick={() => setActiveDay(i)}
                className={`flex-1 px-4 py-4 text-center font-heading font-bold text-sm md:text-base transition-all duration-200 ${
                  activeDay === i
                    ? "bg-primary text-primary-foreground shadow-inner"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="block">{day.label}</span>
                <span className="block text-xs font-body font-normal opacity-80 mt-0.5">
                  {day.date.split("-").reverse().slice(0, 2).join("/")}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 md:p-8">
            <DayTabContent day={agendaData[activeDay]} />
          </div>
        </div>
      </section>

      {/* Legend */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          {[
            { label: "Keynote", color: "bg-secondary/20 border-secondary" },
            { label: "Conferencia", color: "bg-sky-light border-sky" },
            { label: "Workshop", color: "bg-accent/20 border-accent" },
            { label: "Panel", color: "bg-primary/10 border-primary" },
            { label: "Networking", color: "bg-gold-light/40 border-gold" },
            { label: "Receso", color: "bg-muted border-border" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2"
            >
              <span
                className={`w-3 h-3 rounded-full border ${item.color}`}
              />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="font-heading font-bold text-lg mb-3">
                XI <span className="text-secondary">CONIITI</span> 2025
              </h3>
              <p className="text-primary-foreground/70 leading-relaxed">
                Congreso Internacional de Innovación y Tendencias en Ingeniería.
                Universidad Católica de Colombia.
              </p>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-3">Contacto</h4>
              <div className="space-y-2 text-primary-foreground/70">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-secondary" />
                  <span>coniiti@ucatolica.edu.co</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-secondary" />
                  <span>(601) 4433700 Ext. 3130/60/90</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-3">Ubicación</h4>
              <div className="flex items-start gap-2 text-primary-foreground/70">
                <MapPin className="w-4 h-4 text-secondary mt-0.5" />
                <span>
                  Carrera 13 # 47 – 30, Bogotá
                  <br />
                  Centro de Convenciones, Sede 4
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-primary-foreground/10 mt-8 pt-6 text-center text-xs text-primary-foreground/50">
            © 2025 CONIITI — Universidad Católica de Colombia. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
