from typing import Optional
import sys

# NOTA: Este servicio utiliza verificación OTP simulada por ahora.
# En fase final, se integrará con un microservicio dedicado.
# Los códigos OTP se mostrarán en la consola para desarrollo local.


class EmailService:
    """Servicio de email simulado para verificación OTP en ambiente de desarrollo.
    
    IMPORTANTE: Esta es una implementación temporal que imprime códigos OTP en la terminal.
    Será reemplazada por un microservicio en la fase final del proyecto.
    """

    def __init__(self):
        """Inicializar servicio de email simulado"""
        pass

    async def send_otp_email(self, to_email: str, otp_code: str, user_name: Optional[str] = None) -> bool:
        """
        Simular envío de código OTP imprimiendo en la terminal.
        
        TEMPORAL: En producción, esto será manejado por microservicio de OTP.
        Los códigos se imprimen en la terminal para fines de desarrollo.
        """
        try:
            # Crear mensaje simulado para mostrar en terminal
            separator = "=" * 80
            user_greeting = f"Hola {user_name}!" if user_name else "Hola de nuevo!"
            
            terminal_message = f"""
{separator}
🔐 VERIFICACIÓN OTP - CONIITI CONFERENCE (TEMPORALMENTE SIMULADA)
{separator}

Para: {to_email}
{user_greeting}

Tu código de verificación es:

    ┌─────────────────────┐
    │  {otp_code}  │
    └─────────────────────┘

⏱️  Este código expira en 10 minutos.
⚠️  No compartas este código con nadie.

{separator}
"""
            # Imprimir en consola/terminal
            print(terminal_message, file=sys.stdout, flush=True)
            
            return True

        except Exception as e:
            print(f"Error en simulación de OTP para {to_email}: {str(e)}", file=sys.stderr)
            return False

    async def send_welcome_email(self, to_email: str, user_name: str) -> bool:
        """
        Simular envío de email de bienvenida.
        
        TEMPORAL: En producción, esto será manejado externamente.
        """
        try:
            terminal_message = f"""
{'=' * 80}
✅ BIENVENIDA - CONIITI CONFERENCE
{'=' * 80}

¡Hola {user_name}!

Tu cuenta ha sido verificada exitosamente.
Ya puedes acceder a todas las funcionalidades de la plataforma CONIITI.

¿Qué puedes hacer ahora?
  • Explorar la agenda de conferencias
  • Inscribirte en sesiones
  • Acceder al portal de estudiantes
  • Generar códigos QR para asistencia

¡Te esperamos en la XI Conferencia Internacional de Innovación y Tendencias en Ingeniería!

{'=' * 80}
"""
            print(terminal_message, file=sys.stdout, flush=True)
            return True

        except Exception as e:
            print(f"Error en simulación de bienvenida para {to_email}: {str(e)}", file=sys.stderr)
            return False


# Instancia global del servicio de email
email_service = EmailService()