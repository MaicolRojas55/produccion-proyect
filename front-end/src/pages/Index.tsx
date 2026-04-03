import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Mic2,
  Handshake,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  Globe,
  FileText,
  Newspaper,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { useCountdown } from '@/hooks/use-countdown'
import { useAuth } from '@/features/auth/useAuth'
import { useHomeContent } from '@/features/content/storage'
import {
  EditHeroModal,
  EditGalleryModal,
  EditMemoriesModal,
  EditCountryModal,
  EditSpeakerModal
} from '@/features/content/EditModals'
/** Fecha y hora de inicio del evento (inicio del congreso). El contador corre hacia esta fecha. */
const EVENT_DATE = new Date('2026-10-01T08:00:00')

const whyAttend = [
  {
    icon: Users,
    title: 'Networking de alto nivel',
    desc: 'Conecta con líderes de la industria, potenciales empleadores y profesionales que comparten tus intereses. Este networking puede abrirte puertas a oportunidades laborales y proyectos colaborativos.'
  },
  {
    icon: Mic2,
    title: 'Conferencias y talleres',
    desc: 'Acceso a conferencias y talleres impartidos por expertos de renombre, donde podrás adquirir conocimientos valiosos y actualizados sobre las últimas tendencias y tecnologías.'
  },
  {
    icon: Handshake,
    title: 'Alianzas Estratégicas',
    desc: 'Las sesiones y talleres están diseñados para fomentar la colaboración y la creación de alianzas. Podrás conocer a posibles socios con los que desarrollar iniciativas conjuntas.'
  },
  {
    icon: TrendingUp,
    title: 'Desarrollo Profesional',
    desc: 'Participar en este evento te ayudará a desarrollar nuevas habilidades y competencias, mejorando tu perfil profesional y aumentando tu empleabilidad.'
  }
]

const impact = [
  { value: '35', label: 'Conferencistas' },
  { value: '5', label: 'Ofertas de Workshops' },
  { value: '452 +', label: 'Participantes del Evento' }
]

const importantDates = [
  { label: 'Límite Recepción Artículos', date: '30 Junio 2026' },
  { label: 'Notificación Artículos', date: '28 Julio 2026' },
  { label: 'Inicio Evento', date: '01 al 03 Octubre 2026' }
]

const speakers = [
  {
    name: 'Ph. D. Julio Emilio Torres',
    role: 'Consultor / CSIC',
    country: 'España'
  },
  {
    name: 'Dr. Rubén Fuentes Fernández',
    role: 'Invest. / GRASIA',
    country: 'España'
  },
  {
    name: 'Ing. Antonio Jose Madrid Ramos',
    role: 'Coordinador / PROES',
    country: 'España'
  },
  {
    name: 'Arq. Francisco Pardo Campo',
    role: 'Director / PROES LATAM',
    country: 'España'
  }
]

const latestNews = [
  {
    title: 'Abierta la convocatoria para envío de artículos',
    date: 'Marzo 2026'
  },
  {
    title: 'Conferencistas país invitado España confirmados',
    date: 'Febrero 2026'
  },
  {
    title: 'Inscripciones y registro de asistencia en esta plataforma',
    date: '2026'
  }
]

const Index = () => {
  const countdown = useCountdown(EVENT_DATE)
  const [memoriasPage, setMemoriasPage] = useState(0)
  const [scrollPosition, setScrollPosition] = useState(0)
  const { user } = useAuth()
  const { content, updateContent } = useHomeContent()
  const isCenteredCarousel = content.conferencistas.length < 8
  const hasCarouselNav = content.conferencistas.length >= 8

  // Scroll al apartado cuando la URL tiene hash (ej. /#comite, /#memorias, /#memorias-1)
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) return
    if (hash.startsWith('memorias')) {
      const page = hash === 'memorias-1' ? 1 : hash === 'memorias-2' ? 2 : 0
      setMemoriasPage(page)
    }
    const id = hash.split('-')[0]
    const el = document.getElementById(id === 'memorias' ? 'memorias' : hash)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (!hash) return
      if (hash.startsWith('memorias')) {
        const page = hash === 'memorias-1' ? 1 : hash === 'memorias-2' ? 2 : 0
        setMemoriasPage(page)
      }
      const id = hash.split('-')[0]
      const el = document.getElementById(id === 'memorias' ? 'memorias' : hash)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar variant="dark" layout="coniiti" />

      {/* ===== HERO ===== */}
      <section id="hero" className="relative overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_10%,hsl(var(--gold))_0%,transparent_45%),radial-gradient(circle_at_80%_30%,hsl(var(--sky))_0%,transparent_45%),radial-gradient(circle_at_50%_100%,hsl(var(--navy-light))_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-navy-dark/55" />

        <div className="relative z-10 container mx-auto px-4 pt-20 pb-12 md:pt-24 md:pb-16">
          <div className="text-center">
            <Badge className="mb-4 bg-secondary/20 border border-secondary/40 text-secondary font-heading font-semibold">
              <Globe className="w-3.5 h-3.5 mr-1.5 inline" />
              País invitado: {content.featuredCountry?.name || 'España'}
            </Badge>
            <h1 className="font-heading font-black text-4xl md:text-6xl lg:text-7xl text-primary-foreground tracking-tight mb-3">
              <EditHeroModal>CONIITI 2026</EditHeroModal>
            </h1>
            <p className="text-xl md:text-2xl text-secondary font-heading font-bold mb-2">
              Híbrido
            </p>
            <p className="text-primary-foreground/90 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              {content.heroSubtitle}
            </p>

            <p className="text-sm text-primary-foreground/80 mb-3">
              {content.fechasImportantes?.[0]?.date || 'Octubre 2026'}
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10">
              {[
                { value: countdown.days, label: 'Días' },
                { value: countdown.hours, label: 'Horas' },
                { value: countdown.minutes, label: 'Minutos' },
                { value: countdown.seconds, label: 'Segundos' }
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="bg-white/10 backdrop-blur-md rounded-xl px-5 py-3 min-w-[70px] border border-white/20 shadow-lg"
                >
                  <div className="font-heading font-black text-2xl md:text-3xl text-white tabular-nums">
                    {String(value).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-white/70">{label}</div>
                </div>
              ))}
            </div>
            <Button asChild size="lg" className="shadow-lg">
              <Link to="/agenda">
                Ver agenda
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        {/* ===== FEATURED COUNTRY — Rich glassmorphism bar ===== */}
        <EditCountryModal>
          <div className="relative z-10 mt-6">
            {/* Decorative gradient line */}
            <div className="h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />
            <div className="bg-gradient-to-r from-purple-900/60 via-blue-900/50 to-purple-900/60 backdrop-blur-md border-t border-white/10">
              <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Flag + Name */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="relative">
                      <div className="absolute -inset-3 rounded-full bg-purple-500/20 blur-xl" />
                      <span
                        className="relative text-7xl md:text-8xl drop-shadow-2xl"
                        aria-label={`Bandera de ${content.featuredCountry?.name}`}
                      >
                        {content.featuredCountry?.flag || '🇪🇸'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-yellow-400/80 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
                        <span className="inline-block w-4 h-px bg-yellow-400/60" />
                        País Invitado de Honor
                        <span className="inline-block w-4 h-px bg-yellow-400/60" />
                      </p>
                      <h2 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tight">
                        {content.featuredCountry?.name || 'España'}
                      </h2>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block w-px h-20 bg-white/15 self-center" />

                  {/* Description */}
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-xl">
                      {content.featuredCountry?.description ||
                        'País invitado con destacados investigadores y conferencistas líderes en tecnología e innovación.'}
                    </p>
                  </div>

                  {/* Stat chips */}
                  <div className="flex md:flex-col gap-3 shrink-0">
                    <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-2 text-center">
                      <div className="text-2xl font-black text-yellow-300">
                        4
                      </div>
                      <div className="text-xs text-white/60">
                        Conferencistas
                      </div>
                    </div>
                    <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-2 text-center">
                      <div className="text-2xl font-black text-purple-300">
                        3+
                      </div>
                      <div className="text-xs text-white/60">Universidades</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
          </div>
        </EditCountryModal>
      </section>

      {/* Comité — misma funcionalidad que CONIITI */}
      <section
        id="comite"
        className="container mx-auto px-4 py-12 md:py-16 scroll-mt-20"
      >
        <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground text-center mb-4">
          {content.comite.title}
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
          {content.comite.description}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto mb-14">
          <Card className="p-5 text-center">
            <h4 className="font-heading font-bold text-foreground mb-1">
              Comité Organizador
            </h4>
            <p className="text-sm text-muted-foreground">
              Universidad Católica de Colombia
            </p>
          </Card>
          <Card className="p-5 text-center">
            <h4 className="font-heading font-bold text-foreground mb-1">
              Comité Científico
            </h4>
            <p className="text-sm text-muted-foreground">
              Evaluación de artículos y ponencias
            </p>
          </Card>
          <Card className="p-5 text-center">
            <h4 className="font-heading font-bold text-foreground mb-1">
              Copatrocinio
            </h4>
            <p className="text-sm text-muted-foreground">IEEE Colombia</p>
          </Card>
        </div>
        <h3 className="font-heading font-black text-xl md:text-2xl text-foreground text-center mb-4">
          Por qué asistir al Congreso
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyAttend.map(({ icon: Icon, title, desc }) => (
            <Card
              key={title}
              className="p-6 border-border hover:shadow-[var(--shadow-hover)] transition-shadow"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center mb-4">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-heading font-bold text-lg mb-2">{title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Impacto */}
      <section className="bg-muted/40 border-y border-border py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground text-center mb-10">
            Impacto X CONIITI 2024
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {impact.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-heading font-black text-4xl md:text-5xl text-primary">
                  {value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fechas importantes */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground text-center mb-10">
          Fechas Importantes
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {content.fechasImportantes.map(({ id, label, date }) => (
            <Card key={id} className="p-6 text-center">
              <div className="font-heading font-bold text-foreground mb-1">
                {label}
              </div>
              <div className="text-lg text-primary font-heading font-black">
                {date}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Para Autores — misma funcionalidad que CONIITI (plantillas, instructivos) */}
      <section
        id="autores"
        className="bg-muted/30 border-y border-border py-12 md:py-16 scroll-mt-20"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground mb-4">
            Para Autores
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Ten en cuenta las plantillas, instructivos y fechas para el envío de
            artículos. Límite de recepción: 30 de junio 2026. Notificación: 28
            de julio 2026.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline">
              <Link to="/agenda">
                <FileText className="h-4 w-4 mr-2" />
                Plantillas e instructivos
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/agenda">Más información</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Conferencistas — Carrusel en homepage */}
      <section
        id="conferencistas"
        className="py-12 md:py-16 scroll-mt-20 overflow-hidden"
      >
        <div className="container mx-auto px-4 mb-8">
          <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground text-center mb-2">
            Conferencistas
          </h2>
          <p className="text-center text-muted-foreground mb-0">
            País invitado: {content.featuredCountry?.name || 'España'}
          </p>
        </div>
        {/* Scroll track */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          {/* Scroll container con scroll buttons condicionales */}
          <div className="relative">
            {/* Botón anterior - visible solo si hay muchos speakers */}
            {hasCarouselNav && (
              <button
                onClick={() => {
                  const container = document.getElementById(
                    'conferencistas-scroll'
                  )
                  if (container)
                    container.scrollBy({ left: -250, behavior: 'smooth' })
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white shadow-lg hover:bg-slate-100 flex items-center justify-center transition-all hover:scale-110"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5 text-slate-700" />
              </button>
            )}

            <div
              id="conferencistas-scroll"
              className={`flex gap-6 px-8 pb-4 scrollbar-hide ${
                isCenteredCarousel
                  ? 'justify-center overflow-hidden'
                  : 'overflow-x-auto snap-x snap-mandatory'
              }`}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {content.conferencistas.map((s) => (
                <EditSpeakerModal key={s.id} speakerId={s.id}>
                  <div
                    className={`snap-center group cursor-pointer transition-all duration-300 ${
                      content.conferencistas.length <= 3
                        ? 'shrink-0 w-56 flex-1'
                        : 'shrink-0 w-56'
                    }`}
                  >
                    <Card className="p-5 text-center flex flex-col h-full bg-white border-2 border-transparent hover:border-purple-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="relative mx-auto mb-4 w-20 h-20 overflow-hidden rounded-full border-4 border-purple-100 group-hover:border-purple-400 transition-all duration-300">
                        <img
                          src={
                            s.img !== '/placeholder.jpg'
                              ? s.img
                              : `https://api.dicebear.com/9.x/initials/svg?seed=${s.name}`
                          }
                          alt={s.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-heading font-bold text-sm text-foreground mb-1 line-clamp-2">
                        {s.name}
                      </h4>
                      <p className="text-xs text-purple-600 font-medium mb-2">
                        {s.role}
                      </p>
                      <Badge
                        variant="secondary"
                        className="self-center bg-slate-100 text-slate-600 text-xs"
                      >
                        {s.track}
                      </Badge>
                    </Card>
                  </div>
                </EditSpeakerModal>
              ))}
            </div>

            {/* Botón siguiente - visible solo si hay muchos speakers */}
            {hasCarouselNav && (
              <button
                onClick={() => {
                  const container = document.getElementById(
                    'conferencistas-scroll'
                  )
                  if (container)
                    container.scrollBy({ left: 250, behavior: 'smooth' })
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white shadow-lg hover:bg-slate-100 flex items-center justify-center transition-all hover:scale-110"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-5 w-5 text-slate-700" />
              </button>
            )}
          </div>
        </div>
        <div className="text-center mt-6">
          <Button
            asChild
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            <Link to="/conferencistas">Ver Todos los Conferencistas →</Link>
          </Button>
        </div>
      </section>

      {/* Galería — Dinámico */}
      <section
        id="galeria"
        className="bg-muted/30 border-y border-border py-12 md:py-16 scroll-mt-20"
      >
        <div className="container mx-auto px-4">
          <EditGalleryModal>
            <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground text-center mb-6 inline-block w-full">
              Galería
            </h2>
          </EditGalleryModal>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-8">
            Imágenes de ediciones anteriores y del evento.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {content.galleryImages?.map((img, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-xl bg-muted border group ${img.span || ''}`}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover aspect-square transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white font-medium">{img.alt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Memorias — contenido como CONIITI (ediciones anteriores), sin redirigir */}
      <section
        id="memorias"
        className="container mx-auto px-4 py-12 md:py-16 scroll-mt-20"
      >
        <EditMemoriesModal>
          <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground text-center mb-4 inline-block w-full">
            Memorias
          </h2>
        </EditMemoriesModal>
        <p className="text-muted-foreground text-center mb-10">
          Memorias y publicaciones de ediciones anteriores del congreso.
        </p>

        <div className="max-w-3xl mx-auto">
          {content.memorias.length > 0 ? (
            <Card className="p-6 md:p-8 animate-fade-in shadow-sm border-t-4 border-t-purple-600">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h3 className="font-heading font-black text-xl text-foreground">
                  {content.memorias[memoriasPage]?.title}
                </h3>
                <span className="text-sm text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-full">
                  Edición {content.memorias[memoriasPage]?.year}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {content.memorias[memoriasPage]?.desc}
              </p>
            </Card>
          ) : (
            <div className="text-center text-muted-foreground">
              No hay memorias disponibles.
            </div>
          )}

          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              className="transition-all duration-200 hover:scale-105"
              onClick={() => setMemoriasPage((p) => Math.max(0, p - 1))}
              disabled={memoriasPage === 0}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {content.memorias.map((m, i) => (
                <Button
                  key={m.id}
                  variant={memoriasPage === i ? 'default' : 'ghost'}
                  size="sm"
                  className="min-w-[2.5rem] transition-all duration-200"
                  onClick={() => setMemoriasPage(i)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="transition-all duration-200 hover:scale-105"
              onClick={() =>
                setMemoriasPage((p) =>
                  Math.min(content.memorias.length - 1, p + 1)
                )
              }
              disabled={memoriasPage === content.memorias.length - 1}
              aria-label="Siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Página {memoriasPage + 1} de 3
          </p>
        </div>
      </section>

      {/* Últimas noticias — misma funcionalidad que CONIITI */}
      <section
        id="noticias"
        className="container mx-auto px-4 py-12 md:py-16 scroll-mt-20"
      >
        <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground text-center mb-4">
          Últimas noticias
        </h2>
        <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
          Mantente al día con las novedades del congreso.
        </p>
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {latestNews.map((n) => (
            <Card
              key={n.title}
              className="p-5 hover:shadow-[var(--shadow-hover)] transition-shadow"
            >
              <Newspaper className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-heading font-bold text-foreground mb-1">
                {n.title}
              </h4>
              <p className="text-xs text-muted-foreground">{n.date}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Contacto — misma funcionalidad que CONIITI */}
      <section
        id="contacto"
        className="container mx-auto px-4 py-12 md:py-16 scroll-mt-20"
      >
        <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground text-center mb-10">
          Contacto y ubicación
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="p-6">
            <MapPin className="h-6 w-6 text-primary mb-3" />
            <h4 className="font-heading font-bold mb-2">Localización</h4>
            <p className="text-sm text-muted-foreground">
              Bogotá — Carrera 13 # 47 – 30
              <br />
              Universidad Católica de Colombia
              <br />
              Centro de Convenciones, Sede 4
            </p>
          </Card>
          <Card className="p-6">
            <Phone className="h-6 w-6 text-primary mb-3" />
            <h4 className="font-heading font-bold mb-2">PBX</h4>
            <p className="text-sm text-muted-foreground">
              (601) 4433700 Ext. 3130/60/90
            </p>
          </Card>
          <Card className="p-6">
            <Mail className="h-6 w-6 text-primary mb-3" />
            <h4 className="font-heading font-bold mb-2">Email</h4>
            <p className="text-sm text-muted-foreground">
              coniiti@ucatolica.edu.co
            </p>
          </Card>
        </div>
      </section>

      {/* Acerca de — misma funcionalidad que CONIITI */}
      <section
        id="acerca"
        className="container mx-auto px-4 py-12 md:py-16 scroll-mt-20"
      >
        <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground text-center mb-4">
          Acerca de CONIITI
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto">
          El Congreso Internacional de Innovación y Tendencias en Ingeniería es
          un espacio abierto de interacción entre actores del ecosistema
          innovador orientado a compartir nuevas aproximaciones para la
          transformación creativa a través del diseño de soluciones con visión
          de ingeniería.
        </p>
      </section>

      {/* CTA final — inscripción y registro de asistencia en esta plataforma (nuestra diferencia) */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="font-heading font-black text-xl md:text-2xl mb-2">
            ¡Anticípate y adquiere tu entrada ya!
          </h2>
          <p className="text-primary-foreground/80 mb-4 max-w-lg mx-auto">
            El Congreso Internacional de Innovación y Tendencias en Ingeniería
            es un espacio abierto de interacción entre actores del ecosistema
            innovador.
          </p>
          <p className="text-primary-foreground/70 text-sm mb-6 max-w-lg mx-auto">
            La inscripción a conferencias y el registro de asistencia se
            realizan en esta plataforma: regístrate, revisa la agenda e
            inscríbete a las sesiones. En el evento, muestra tu QR de identidad
            para que el profesor registre tu asistencia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth?tab=register">
                Obtén tu entrada
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-neutral-100 border border-transparent"
            >
              <Link to="/agenda">Ver agenda</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-dark text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="font-heading font-bold">
              XI Congreso Internacional de Innovación y Tendencias en Ingeniería
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/80">
              <Link to="/" className="hover:text-primary-foreground">
                Inicio
              </Link>
              <Link to="/#comite" className="hover:text-primary-foreground">
                Comité
              </Link>
              <Link
                to="/#conferencistas"
                className="hover:text-primary-foreground"
              >
                Conferencistas
              </Link>
              <Link to="/#autores" className="hover:text-primary-foreground">
                Autores
              </Link>
              <Link to="/#galeria" className="hover:text-primary-foreground">
                Galería
              </Link>
              <Link to="/#noticias" className="hover:text-primary-foreground">
                Noticias
              </Link>
              <Link to="/#memorias" className="hover:text-primary-foreground">
                Memorias
              </Link>
              <Link to="/#acerca" className="hover:text-primary-foreground">
                Acerca de
              </Link>
              <Link to="/#contacto" className="hover:text-primary-foreground">
                Contacto
              </Link>
              <Link to="/agenda" className="hover:text-primary-foreground">
                Agenda
              </Link>
            </div>
          </div>
          <div className="border-t border-primary-foreground/10 mt-6 pt-6 text-center text-xs text-primary-foreground/50">
            © Universidad Católica de Colombia — CONIITI 2015 - 2026. All Rights
            Reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Index
