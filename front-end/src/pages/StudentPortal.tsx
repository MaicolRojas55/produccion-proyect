import { useMemo, useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  CalendarDays,
  CheckCircle2,
  Copy,
  Clock,
  Globe,
  LogOut,
  Plus,
  QrCode,
  ShieldCheck,
  Calendar,
  Loader
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { apiClient, ApiError } from '@/lib/api'
import type { Conference } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

function formatIsoShort(iso: string) {
  return new Date(iso).toLocaleString()
}

export default function StudentPortal() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [tick, setTick] = useState(0)
  const [tab, setTab] = useState<'mis-conferencias' | 'disponibles'>(
    'mis-conferencias'
  )

  // Estados de carga
  const [loading, setLoading] = useState(true)
  const [conferences, setConferences] = useState<Conference[]>([])
  const [studentAgenda, setStudentAgenda] = useState<Conference[]>([])
  const [error, setError] = useState<string | null>(null)

  // Refrescar cada minuto para actualizar estado de QR
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  // Cargar datos del backend cuando haya usuario
  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Cargar conferencias disponibles y agenda personal
        const [allConferences, myAgenda] = await Promise.all([
          apiClient.getConferences(),
          apiClient.getStudentAgenda()
        ])

        setConferences(
          allConferences.sort(
            (a, b) =>
              new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
          )
        )
        setStudentAgenda(myAgenda)
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Error cargando datos'
        setError(message)
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, toast])

  if (!user) return null
  if (user.role !== 'usuario_registrado') return null

  const myAgendaIds = new Set(studentAgenda.map((c) => c._id || c.id))
  const myAgendaItems = studentAgenda.sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  )
  const availableItems = conferences.filter(
    (c) => !myAgendaIds.has(c._id || c.id)
  )

  const handleAddToAgenda = async (conferenceId: string) => {
    try {
      await apiClient.addToStudentAgenda(conferenceId)
      toast({
        title: 'Éxito',
        description: 'Conferencia agregada a tu agenda'
      })
      // Refrescar agenda
      const myAgenda = await apiClient.getStudentAgenda()
      setStudentAgenda(myAgenda)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error al agregar'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      })
    }
  }

  const handleRemoveFromAgenda = async (conferenceId: string) => {
    try {
      await apiClient.removeFromStudentAgenda(conferenceId)
      toast({
        title: 'Éxito',
        description: 'Conferencia removida de tu agenda'
      })
      // Refrescar agenda
      const myAgenda = await apiClient.getStudentAgenda()
      setStudentAgenda(myAgenda)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Error al remover'
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/70 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <span className="font-heading font-black text-lg tracking-tight">
                CONIITI
              </span>
            </Link>
            <div
              className="h-6 w-px bg-border max-sm:hidden"
              aria-hidden="true"
            />
            <div className="flex items-center gap-2">
              <div className="leading-tight">
                <div className="font-heading font-black">Mi espacio</div>
                <div className="text-xs text-muted-foreground">
                  {user.full_name || user.nombre || user.email}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              Portal Estudiante
            </Badge>
            <Link to="/agenda">
              <Button variant="ghost" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                Agenda
              </Button>
            </Link>
            <Button variant="secondary" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Card className="mb-6 p-4 border-red-200 bg-red-50 text-red-800">
            <p className="font-medium">Error: {error}</p>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Cargando...</span>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Mis conferencias */}
            <section>
              <h2 className="font-heading font-black text-2xl mb-2">
                Mis conferencias
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Conferencias en las que te registraste
              </p>

              {myAgendaItems.length === 0 ? (
                <Card className="p-6 text-muted-foreground text-center">
                  <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aún no te has registrado en ninguna conferencia.</p>
                  <p className="text-xs mt-1">
                    Ve a "Disponibles" abajo para agendar.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {myAgendaItems.map((c) => (
                    <Card key={c._id} className="p-5 border-primary/20">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-heading font-black text-lg">
                            {c.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formatIsoShort(c.start_at)} →{' '}
                            {formatIsoShort(c.end_at)}
                            {c.location ? ` · ${c.location}` : ''}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant="secondary">Registrado</Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() =>
                            handleRemoveFromAgenda(c._id || c.id || '')
                          }
                        >
                          Remover
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Conferencias disponibles */}
            <section>
              <h2 className="font-heading font-black text-2xl mb-2">
                Conferencias disponibles
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Agrega conferencias a tu agenda personal
              </p>

              {availableItems.length === 0 ? (
                <Card className="p-6 text-muted-foreground text-center">
                  <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay conferencias adicionales disponibles.</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {availableItems.map((c) => (
                    <Card key={c._id} className="p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-heading font-black text-lg">
                            {c.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formatIsoShort(c.start_at)} →{' '}
                            {formatIsoShort(c.end_at)}
                            {c.location ? ` · ${c.location}` : ''}
                          </p>
                          {c.description && (
                            <p className="text-sm mt-2 text-foreground/80">
                              {c.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="secondary"
                          onClick={() => handleAddToAgenda(c._id || c.id || '')}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
