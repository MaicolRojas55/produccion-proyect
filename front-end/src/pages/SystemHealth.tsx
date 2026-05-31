import { Link } from 'react-router-dom'
import { Activity, ArrowLeft, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSystemHealth } from '@/features/system-health/useSystemHealth'

function statusBadge(status: string) {
  if (status === 'up') return <Badge className="bg-green-600">Operativo</Badge>
  if (status === 'checking')
    return <Badge variant="secondary">Comprobando…</Badge>
  return <Badge variant="destructive">Caído</Badge>
}

export default function SystemHealth() {
  const { services, lastChecked, refresh, upCount, total } = useSystemHealth()

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-7 w-7 text-primary" />
              <h1 className="text-2xl font-bold">Estado del sistema</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Panel de uptime — {upCount}/{total} servicios operativos
            </p>
            {lastChecked && (
              <p className="text-xs text-muted-foreground mt-1">
                Última comprobación: {lastChecked.toLocaleString()}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => void refresh()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>

        <Card className="divide-y overflow-hidden">
          {services.map((service) => (
            <div
              key={service.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {service.endpoint}
                </p>
                {service.error && (
                  <p className="text-xs text-red-600 mt-1">{service.error}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {service.latencyMs !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    {service.latencyMs} ms
                  </span>
                )}
                {statusBadge(service.status)}
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
