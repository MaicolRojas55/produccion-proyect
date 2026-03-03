import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CalendarDays,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  Users,
  QrCode,
  ClipboardCheck,
  FileDown,
  UserPlus,
  Smartphone,
  CheckCircle2,
  ListOrdered
} from 'lucide-react'
import { Link } from 'react-router-dom'

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_10%,hsl(var(--gold))_0%,transparent_45%),radial-gradient(circle_at_80%_30%,hsl(var(--sky))_0%,transparent_45%),radial-gradient(circle_at_50%_100%,hsl(var(--navy-light))_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-navy-dark/55" />

        <div className="relative z-10 container mx-auto px-4 pt-10 pb-14 md:pt-16 md:pb-20">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-secondary/20 border border-secondary/30 grid place-items-center">
                <Sparkles className="h-4 w-4 text-secondary" />
              </div>
              <div className="leading-tight">
                <div className="font-heading font-black text-primary-foreground tracking-tight">
                  Coniiti
                </div>
                <div className="text-xs text-primary-foreground/70">
                  Reuniones y asistencia con OTP
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="secondary"
                className="hidden sm:inline-flex"
              >
                <Link to="/agenda">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Ver agenda
                </Link>
              </Button>
              <Button asChild>
                <Link to="/auth">
                  Entrar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </nav>

          <div className="mt-10 md:mt-16 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className="bg-secondary/20 border border-secondary/30 text-secondary-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                  100% local (LocalStorage)
                </Badge>
                <Badge className="bg-primary/10 border border-primary/20 text-primary-foreground/90">
                  <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                  Responsive
                </Badge>
              </div>

              <h1 className="font-heading font-black text-4xl md:text-6xl text-primary-foreground tracking-tight">
                Reuniones y asistencia,
                <span className="block text-gradient-gold">
                  para profesores y estudiantes
                </span>
              </h1>
              <p className="mt-4 text-primary-foreground/80 max-w-xl">
                Plataforma académica sin servidor: crea reuniones, registra
                asistencia con QR + OTP y lleva el control desde el navegador.
                Un solo registro por estudiante y validación por conferencia.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="shadow-lg">
                  <Link to="/auth?tab=register">
                    Crear cuenta
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="shadow-lg"
                >
                  <Link to="/auth?tab=login">Ya tengo cuenta</Link>
                </Button>
              </div>

              <div className="mt-6 text-xs text-primary-foreground/60">
                Todo se guarda en tu navegador (sin backend). Ideal para
                prototipos y entornos controlados.
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="grid gap-4">
                <Card className="p-5 border-border/70 bg-card/80 backdrop-blur">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-secondary/20 border border-secondary/30 grid place-items-center">
                      <GraduationCap className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-heading font-bold">Profesor</div>
                      <div className="text-sm text-muted-foreground">
                        Crea reuniones, muestra QR dinámico y descarga
                        asistencias en CSV.
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 border-border/70 bg-card/80 backdrop-blur">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center">
                      <CalendarDays className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="font-heading font-bold">Estudiante</div>
                      <div className="text-sm text-muted-foreground">
                        Registro único con OTP; agenda reuniones y valida
                        asistencia con QR + OTP.
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Qué es y para quién */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground mb-4">
            Inicios de Coniiti
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            CONIITI Es un espacio abierto de interacción entre actores del
            ecosistema innovador orientado a compartir nuevas aproximaciones
            para la transformación creativa de Colombia a través del diseño de
            soluciones con visión de ingeniería. La Universidad Católica de
            Colombia, en el marco de la semana de Ingeniería, desarrolló el I
            CONGRESO INTERNACIONAL DE INNOVACIÓN Y TENDENCIAS EN INGENIERÍA –
            CONIITI 2015 que se realizó entre el 14 y el 17 de octubre de 2015
            en la ciudad de Bogotá.
          </p>
        </div>
      </section>

      {/* Nuestro flujo: reuniones para profesores y estudiantes */}
      <section className="bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground text-center mb-10">
            Cómo se maneja el flujo de reuniones
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Así funciona nuestro sistema para profesores y estudiantes: desde el
            registro hasta la asistencia por conferencia.
          </p>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Flujo Profesor */}
            <Card className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-secondary/20 border border-secondary/30 grid place-items-center">
                  <GraduationCap className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-xl">
                    Rol Profesor
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Crear reuniones y ver quién asistió
                  </p>
                </div>
              </div>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-heading font-bold text-sm">
                    1
                  </span>
                  <div>
                    <span className="font-heading font-semibold">
                      Registro o inicio de sesión
                    </span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Te registras como profesor (o inicias sesión) y entras al
                      dashboard.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-heading font-bold text-sm">
                    2
                  </span>
                  <div>
                    <span className="font-heading font-semibold">
                      Crear reuniones
                    </span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Desde el dashboard creas reuniones: título, ubicación,
                      fecha y hora de inicio y fin.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-heading font-bold text-sm">
                    3
                  </span>
                  <div>
                    <span className="font-heading font-semibold">
                      QR dinámico
                    </span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      En la hora de la reunión, abres &quot;QR dinámico&quot;
                      para esa reunión. Se muestra un código que cambia cada
                      poco (válido 60 s). Los estudiantes lo escanean o pegan en
                      la app.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-heading font-bold text-sm">
                    4
                  </span>
                  <div>
                    <span className="font-heading font-semibold">
                      Métricas y exportar
                    </span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Ves cuántas asistencias hay por reunión y cuántos
                      estudiantes únicos. Puedes ver detalle y descargar un CSV
                      con las asistencias.
                    </p>
                  </div>
                </li>
              </ol>
            </Card>

            {/* Flujo Estudiante */}
            <Card className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center">
                  <Users className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-xl">
                    Rol Estudiante
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Registro único y asistencia con OTP
                  </p>
                </div>
              </div>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-heading font-bold text-sm">
                    1
                  </span>
                  <div>
                    <span className="font-heading font-semibold">
                      Registro único (solo una vez)
                    </span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Te registras con nombre, email, celular y contraseña.
                      Recibes un OTP (simulado por WhatsApp/SMS) para activar la
                      cuenta. Tras activar, ya no vuelves a llenar formularios.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-heading font-bold text-sm">
                    2
                  </span>
                  <div>
                    <span className="font-heading font-semibold">
                      Agendar reuniones
                    </span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      En la vista estudiante ves las reuniones disponibles.
                      Puedes marcar &quot;Agendar&quot; en las que quieras
                      asistir; aparecen en &quot;Mis agendadas&quot;.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-heading font-bold text-sm">
                    3
                  </span>
                  <div>
                    <span className="font-heading font-semibold">
                      Escanear QR en la reunión
                    </span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Cuando el profesor muestra el QR, usas &quot;Escanear QR
                      (pegar)&quot; y pegas el código (o lo escaneas si fuera un
                      QR real). El código debe estar dentro de la ventana de
                      tiempo de la reunión y no haber registrado asistencia
                      antes.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-heading font-bold text-sm">
                    4
                  </span>
                  <div>
                    <span className="font-heading font-semibold">
                      OTP y validar asistencia
                    </span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Se genera un OTP de 6 dígitos (válido 90 s, un solo uso).
                      Lo ingresas en la app; si es correcto, tu asistencia queda
                      registrada para esa conferencia.
                    </p>
                  </div>
                </li>
              </ol>
            </Card>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="font-heading font-black text-2xl md:text-3xl text-foreground text-center mb-10">
          Características
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: QrCode,
              title: 'QR dinámico',
              desc: 'Código por reunión que cambia en el tiempo para mayor seguridad.'
            },
            {
              icon: ClipboardCheck,
              title: 'OTP contextual',
              desc: 'Un código por conferencia, válido poco tiempo y de un solo uso.'
            },
            {
              icon: FileDown,
              title: 'Exportar CSV',
              desc: 'El profesor descarga la lista de asistencias por reunión.'
            },
            {
              icon: UserPlus,
              title: 'Registro único',
              desc: 'El estudiante se registra una vez y activa con OTP.'
            },
            {
              icon: Smartphone,
              title: 'Sin backend',
              desc: 'Todo en el navegador (LocalStorage); ideal para demos.'
            },
            {
              icon: CheckCircle2,
              title: 'Ventana de tiempo',
              desc: 'Solo se valida asistencia dentro del horario de la reunión.'
            },
            {
              icon: ListOrdered,
              title: 'Mis agendadas',
              desc: 'El estudiante ve solo las reuniones que agendó.'
            },
            {
              icon: ShieldCheck,
              title: 'Por dispositivo',
              desc: 'El OTP se asocia al dispositivo para evitar compartir códigos.'
            }
          ].map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted grid place-items-center shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-heading font-bold">{title}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {desc}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="font-heading font-black text-xl md:text-2xl text-foreground mb-2">
            ¿Listo para probar?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Crea una cuenta como profesor o estudiante y recorre el flujo de
            reuniones y asistencia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/auth?tab=register">
                Crear cuenta
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/auth?tab=login">Iniciar sesión</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Index
