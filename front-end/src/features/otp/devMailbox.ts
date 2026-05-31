import { apiClient } from '@/lib/api'

export const isDevOtpMailboxEnabled =
  import.meta.env.VITE_DEV_OTP_MAILBOX === 'true' ||
  import.meta.env.VITE_DEV_OTP_MAILBOX === true

const POLL_INTERVAL_MS = 800
const MAX_ATTEMPTS = 15

/** Espera a que RabbitMQ procese el OTP y aparezca en la bandeja dev. */
export async function fetchDevOtpWithRetry(
  email: string
): Promise<string | null> {
  if (!isDevOtpMailboxEnabled) return null

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const entry = await apiClient.getDevMailboxLatest(email)
      if (entry?.otp_code) return entry.otp_code
    } catch {
      // 404 hasta que el consumer guarde el correo
    }
    if (attempt < MAX_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
    }
  }
  return null
}
