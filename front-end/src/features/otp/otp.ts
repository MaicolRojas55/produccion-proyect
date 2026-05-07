/**
 * BUG 4 FIX — front-end/src/features/otp/otp.ts
 *
 * El OTP se genera y verifica SOLO en el backend.
 * Este archivo solo exporta funciones que llaman al apiClient.
 * Se elimina toda lógica de generación/almacenamiento de OTP en el cliente.
 */

import { apiClient } from '@/lib/api'

/**
 * Solicita al backend que envíe un nuevo OTP al correo del usuario.
 */
export async function requestOtp(
  email: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    await apiClient.resendOTP(email)
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al solicitar OTP'
    return { ok: false, reason: message }
  }
}

/**
 * Verifica el OTP ingresado por el usuario contra el backend.
 */
export async function verifyOtp(
  email: string,
  code: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    await apiClient.verifyOTP(email, code)
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Código OTP inválido'
    return { ok: false, reason: message }
  }
}

