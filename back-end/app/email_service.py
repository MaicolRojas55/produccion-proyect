import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from .config import settings


class EmailService:
    def __init__(self):
        self.smtp_server = settings.smtp_server
        self.smtp_port = settings.smtp_port
        self.username = settings.smtp_username
        self.password = settings.smtp_password
        self.from_email = settings.smtp_from_email
        self.from_name = settings.smtp_from_name

    async def send_otp_email(self, to_email: str, otp_code: str, user_name: Optional[str] = None) -> bool:
        """Enviar código OTP por email"""
        try:
            # Crear mensaje
            msg = MIMEMultipart()
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            msg['Subject'] = "Código de verificación - CONIITI Conference"

            # Cuerpo del email en HTML
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .otp-code {{ font-size: 32px; font-weight: bold; color: #667eea; text-align: center; letter-spacing: 5px; background: #e8f2ff; padding: 20px; border-radius: 5px; margin: 20px 0; }}
                    .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>CONIITI Conference</h1>
                        <p>Verificación de cuenta</p>
                    </div>
                    <div class="content">
                        <h2>Hola{user_name and f" {user_name}"}!</h2>
                        <p>Gracias por registrarte en la XI Conferencia Internacional de Innovación y Tendencias en Ingeniería (CONIITI).</p>

                        <p>Tu código de verificación es:</p>

                        <div class="otp-code">{otp_code}</div>

                        <p><strong>Importante:</strong></p>
                        <ul>
                            <li>Este código expira en 10 minutos</li>
                            <li>Solo puede usarse una vez</li>
                            <li>No compartas este código con nadie</li>
                        </ul>

                        <p>Si no solicitaste este código, puedes ignorar este mensaje.</p>

                        <p>¡Te esperamos en CONIITI!</p>
                    </div>
                    <div class="footer">
                        <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
                        <p>© 2025 CONIITI Conference - Universidad Católica de Colombia</p>
                    </div>
                </div>
            </body>
            </html>
            """

            # Versión texto plano
            text_body = f"""
            CONIITI Conference - Código de verificación

            Hola{user_name and f" {user_name}"}!

            Tu código de verificación es: {otp_code}

            Este código expira en 10 minutos y solo puede usarse una vez.

            Si no solicitaste este código, ignora este mensaje.

            ¡Te esperamos en CONIITI!
            """

            # Adjuntar versiones
            msg.attach(MIMEText(text_body, 'plain'))
            msg.attach(MIMEText(html_body, 'html'))

            # Enviar email
            await aiosmtplib.send(
                msg,
                hostname=self.smtp_server,
                port=self.smtp_port,
                username=self.username,
                password=self.password,
                start_tls=True
            )

            print(f"OTP enviado exitosamente a {to_email}")
            return True

        except Exception as e:
            print(f"Error enviando email a {to_email}: {str(e)}")
            return False

    async def send_welcome_email(self, to_email: str, user_name: str) -> bool:
        """Enviar email de bienvenida después de verificación"""
        try:
            msg = MIMEMultipart()
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            msg['Subject'] = "¡Bienvenido a CONIITI Conference!"

            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 20px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>¡Bienvenido a CONIITI!</h1>
                    </div>
                    <div class="content">
                        <h2>¡Hola {user_name}!</h2>
                        <p>Tu cuenta ha sido verificada exitosamente. Ya puedes acceder a todas las funcionalidades de la plataforma.</p>

                        <p><strong>¿Qué puedes hacer ahora?</strong></p>
                        <ul>
                            <li>Explorar la agenda de conferencias</li>
                            <li>Inscribirte en sesiones</li>
                            <li>Acceder al portal de estudiantes</li>
                            <li>Generar códigos QR para asistencia</li>
                        </ul>

                        <p>¡Te esperamos en la XI Conferencia Internacional de Innovación y Tendencias en Ingeniería!</p>

                        <p><a href="#" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">Acceder a la plataforma</a></p>
                    </div>
                    <div class="footer">
                        <p>© 2025 CONIITI Conference - Universidad Católica de Colombia</p>
                    </div>
                </div>
            </body>
            </html>
            """

            text_body = f"""
            ¡Bienvenido a CONIITI Conference!

            Hola {user_name}!

            Tu cuenta ha sido verificada exitosamente. Ya puedes acceder a todas las funcionalidades de la plataforma.

            ¡Te esperamos en CONIITI!
            """

            msg.attach(MIMEText(text_body, 'plain'))
            msg.attach(MIMEText(html_body, 'html'))

            await aiosmtplib.send(
                msg,
                hostname=self.smtp_server,
                port=self.smtp_port,
                username=self.username,
                password=self.password,
                start_tls=True
            )

            print(f"Email de bienvenida enviado a {to_email}")
            return True

        except Exception as e:
            print(f"Error enviando email de bienvenida a {to_email}: {str(e)}")
            return False


# Instancia global del servicio de email
email_service = EmailService()