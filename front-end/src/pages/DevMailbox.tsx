import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient, ApiError } from '@/lib/api'
import { isDevOtpMailboxEnabled } from '@/features/otp/devMailbox'

type MailboxRow = {
  email: string
  otp_code: string
  subject: string
  created_at: string
  expires_at?: string | null
}

export default function DevMailbox() {
  const [rows, setRows] = useState<MailboxRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!isDevOtpMailboxEnabled) {
      setError('Bandeja de desarrollo deshabilitada (VITE_DEV_OTP_MAILBOX).')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await apiClient.getDevMailboxRecent(30)
      setRows(data)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'No se pudo cargar la bandeja de desarrollo'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const id = window.setInterval(() => void load(), 5000)
    return () => window.clearInterval(id)
  }, [load])

  if (!isDevOtpMailboxEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-6 max-w-md text-center">
          <p className="text-muted-foreground mb-4">
            La bandeja de desarrollo no está habilitada.
          </p>
          <Button asChild variant="outline">
            <Link to="/auth">Volver a registro</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a autenticación
        </Link>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Bandeja de desarrollo</h1>
            <p className="text-muted-foreground text-sm">
              OTP simulados recientes (se actualiza cada 5 s)
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        <Card className="overflow-hidden">
          {error ? (
            <p className="p-6 text-red-600 text-sm">{error}</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-muted-foreground text-sm">
              {loading
                ? 'Cargando…'
                : 'No hay correos simulados. Regístrate para generar un OTP.'}
            </p>
          ) : (
            <ul className="divide-y">
              {rows.map((row) => (
                <li
                  key={`${row.email}-${row.created_at}`}
                  className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div>
                    <p className="font-medium">{row.email}</p>
                    <p className="text-xs text-muted-foreground">{row.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="font-mono text-xl font-bold tracking-widest text-primary">
                    {row.otp_code}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
