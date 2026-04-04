import { useMemo, useState, ChangeEvent, Dispatch, SetStateAction } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  CalendarDays,
  LogIn,
  UserPlus,
  Mail,
  RefreshCw
} from 'lucide-react'
import { useFormValidation } from '@/hooks/useFormValidation'
import { ValidatedInput } from '@/components/ui/validated-input'
import { useAuth } from '@/features/auth/useAuth'
import { toast } from 'sonner'

function useQueryTab() {
  const location = useLocation()
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  )
  const tab = params.get('tab')
  return tab === 'register' ? 'register' : 'login'
}

export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation() as unknown as {
    state?: { from?: { pathname?: string } }
  }
  const validation = useFormValidation()

  const handleInputChange =
    (setter: Dispatch<SetStateAction<string>>) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value)
    }

  const [tab, setTab] = useState<'login' | 'register'>(useQueryTab())

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [pendingActivation, setPendingActivation] = useState<{
    email: string
    userId: string
    otpSent: boolean
  } | null>(null)
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResendingOTP, setIsResendingOTP] = useState(false)
  const [registerInfo, setRegisterInfo] = useState<string | null>(null)
  const [otpError, setOtpError] = useState<string | null>(null)

  const { login, register, requestActivationOtp, activateAccount } = useAuth()

  const goAfterAuth = (isStaff: boolean) => {
    const from =
      location.state?.from?.pathname || (isStaff ? '/dashboard' : '/agenda')
    navigate(from, { replace: true })
  }

  const handleRegister = async () => {
    setRegisterInfo(null)
    setOtpError(null)

    // Validaciones del frontend
    const nameError = validation.validateName(nombre)
    const emailError = validation.validateEmail(email)
    const phoneError = validation.validatePhone(telefono)
    const passwordError = validation.validatePassword(password)

    if (
      nameError ||
      emailError ||
      phoneError ||
      passwordError ||
      !acceptTerms
    ) {
      setRegisterInfo('Por favor corrige los errores en el formulario')
      return
    }

    setIsLoading(true)
    try {
      const result = register({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono.trim(),
        password,
        role: 'usuario_registrado'
      })

      if (result.ok === false) {
        if (result.reason === 'EMAIL_TAKEN') {
          setRegisterInfo('Este email ya está registrado')
        } else {
          setRegisterInfo('Error al registrar usuario')
        }
      } else {
        const otpResult = requestActivationOtp(result.userId)
        setPendingActivation({
          email: email.trim().toLowerCase(),
          userId: result.userId,
          otpSent: true
        })
        setTab('register')
        if (!otpResult.ok) {
          setRegisterInfo('No se pudo generar el OTP de activación.')
          toast.error('Error al generar el código OTP.')
        } else {
          setRegisterInfo(
            `Cuenta creada correctamente. Código OTP simulado: ${otpResult.otpSimulado}`
          )
          toast.success('Cuenta creada. Ingresa el OTP simulado para activar.')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!pendingActivation || !otp.trim()) {
      setOtpError('Ingresa el código OTP')
      return
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setOtpError('El código OTP debe tener 6 dígitos')
      return
    }

    setIsLoading(true)
    try {
      const result = activateAccount({
        userId: pendingActivation.userId,
        otp: otp.trim()
      })

      if (!result.ok) {
        setOtpError('Código OTP inválido o expirado')
      } else {
        toast.success('Cuenta verificada exitosamente')
        goAfterAuth(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!pendingActivation) return

    setIsResendingOTP(true)
    try {
      const otpResult = requestActivationOtp(pendingActivation.userId)
      if (!otpResult.ok) {
        toast.error('Error al generar el código OTP.')
      } else {
        toast.success(`Nuevo código OTP simulado: ${otpResult.otpSimulado}`)
      }
    } finally {
      setIsResendingOTP(false)
    }
  }

  const handleLogin = async () => {
    setLoginError(null)

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Ingresa email y contraseña')
      return
    }

    setIsLoading(true)
    try {
      const result = login({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword
      })

      if (!result.ok) {
        setLoginError('Credenciales inválidas')
      } else {
        toast.success('Inicio de sesión exitoso')
        goAfterAuth(result.user.role !== 'usuario_registrado')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <CalendarDays className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">CONIITI</h1>
          </div>
          <p className="text-muted-foreground">Sistema de Conferencias</p>
        </div>

        <Card className="p-6">
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as 'login' | 'register')}
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login" className="gap-2">
                <LogIn className="h-4 w-4" /> Iniciar sesión
              </TabsTrigger>
              <TabsTrigger value="register" className="gap-2">
                <UserPlus className="h-4 w-4" /> Registrarse
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <div className="grid gap-4">
                <ValidatedInput
                  id="login-email"
                  label="Email"
                  type="email"
                  value={loginEmail}
                  onChange={handleInputChange(setLoginEmail)}
                  placeholder="tu@correo.com"
                  validation={validation.validateEmail}
                  required
                />

                <ValidatedInput
                  id="login-password"
                  label="Contraseña"
                  type="password"
                  value={loginPassword}
                  onChange={handleInputChange(setLoginPassword)}
                  placeholder="••••••••"
                  required
                />

                <Button
                  onClick={handleLogin}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Entrar'}
                </Button>

                {loginError && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {loginError}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              {!pendingActivation ? (
                <div className="grid gap-4">
                  <ValidatedInput
                    id="reg-name"
                    label="Nombre completo"
                    value={nombre}
                    onChange={handleInputChange(setNombre)}
                    placeholder="Tu nombre completo"
                    validation={validation.validateName}
                    required
                  />

                  <ValidatedInput
                    id="reg-email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={handleInputChange(setEmail)}
                    placeholder="tu@correo.com"
                    validation={validation.validateEmail}
                    required
                  />

                  <ValidatedInput
                    id="reg-phone"
                    label="Celular"
                    value={telefono}
                    onChange={handleInputChange(setTelefono)}
                    placeholder="+57 300 000 0000"
                    validation={validation.validatePhone}
                  />

                  <ValidatedInput
                    id="reg-password"
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={handleInputChange(setPassword)}
                    placeholder="Mínimo 8 caracteres"
                    validation={validation.validatePassword}
                    required
                  />

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="accept-terms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="accept-terms" className="text-sm">
                      Acepto los{' '}
                      <Link
                        to="/terms"
                        className="text-primary hover:underline"
                      >
                        términos y condiciones
                      </Link>
                    </label>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Rol asignado:{' '}
                    <Badge variant="secondary">Usuario Registrado</Badge>
                  </div>

                  <Button
                    onClick={handleRegister}
                    className="w-full"
                    disabled={isLoading || !acceptTerms}
                  >
                    {isLoading ? 'Registrando...' : 'Crear cuenta'}
                  </Button>

                  {registerInfo && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      {registerInfo}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="text-center">
                    <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Verifica tu email
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enviamos un código de 6 dígitos a{' '}
                      <strong>{pendingActivation.email}</strong>
                    </p>
                  </div>

                  <ValidatedInput
                    id="otp"
                    label="Código OTP"
                    value={otp}
                    onChange={handleInputChange(setOtp)}
                    placeholder="000000"
                    maxLength={6}
                    required
                  />

                  <Button
                    onClick={handleVerifyOTP}
                    className="w-full"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? 'Verificando...' : 'Verificar código'}
                  </Button>

                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      ¿No recibiste el código?
                    </span>
                    <Button
                      variant="outline"
                      onClick={handleResendOTP}
                      disabled={isResendingOTP}
                      size="sm"
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${isResendingOTP ? 'animate-spin' : ''}`}
                      />
                      Reenviar
                    </Button>
                  </div>

                  {otpError && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      {otpError}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
