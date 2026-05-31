import { useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isDevOtpMailboxEnabled } from '@/features/otp/devMailbox'

type DevOtpBannerProps = {
  email: string
  otpCode: string | null
  loading?: boolean
}

export function DevOtpBanner({ email, otpCode, loading }: DevOtpBannerProps) {
  const [copied, setCopied] = useState(false)

  if (!isDevOtpMailboxEnabled) return null

  const handleCopy = async () => {
    if (!otpCode) return
    await navigator.clipboard.writeText(otpCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
      role="status"
      aria-live="polite"
    >
      <p className="font-semibold mb-1">Modo desarrollo — correo simulado</p>
      <p className="text-amber-900/90 mb-3">
        No se envía un email real. Usa el código OTP generado para{' '}
        <strong>{email}</strong>.
      </p>

      {loading ? (
        <p className="text-muted-foreground animate-pulse">
          Generando código OTP…
        </p>
      ) : otpCode ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-2xl font-bold tracking-[0.35em]">
            {otpCode}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" /> Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" /> Copiar
              </>
            )}
          </Button>
        </div>
      ) : (
        <p className="text-amber-900/80">
          No se encontró el código aún. Revisa que el notification-service esté
          activo o abre la{' '}
          <a
            href="/dev/mailbox"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium inline-flex items-center gap-1"
          >
            bandeja de desarrollo
            <ExternalLink className="h-3 w-3" />
          </a>
          .
        </p>
      )}

      <p className="mt-3 text-xs text-amber-800/80">
        En producción desactiva{' '}
        <code className="bg-amber-100 px-1 rounded">VITE_DEV_OTP_MAILBOX</code>{' '}
        y{' '}
        <code className="bg-amber-100 px-1 rounded">DEV_MAILBOX_ENABLED</code>.
      </p>
    </div>
  )
}
