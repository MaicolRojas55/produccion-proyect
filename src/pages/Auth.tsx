import { useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, GraduationCap, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/auth/useAuth";
import type { Role } from "@/auth/types";

function useQueryTab() {
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const tab = params.get("tab");
  return tab === "register" ? "register" : "login";
}

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation() as unknown as { state?: { from?: { pathname?: string } } };
  const { login, register, requestActivationOtp, activateAccount } = useAuth();

  const [tab, setTab] = useState<"login" | "register">(useQueryTab());

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("estudiante");
  const [pendingActivation, setPendingActivation] = useState<{ userId: string; otpSimulado: string } | null>(null);
  const [otp, setOtp] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [registerInfo, setRegisterInfo] = useState<string | null>(null);

  const goAfterAuth = (isProfessor: boolean) => {
    const to = location.state?.from?.pathname && location.state.from.pathname !== "/auth"
      ? location.state.from.pathname
      : isProfessor ? "/dashboard" : "/student";
    navigate(to);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <Button asChild variant="secondary">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>

        <div className="mt-6 grid lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-border bg-[var(--gradient-card)] p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 grid place-items-center">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-heading font-black text-lg leading-tight">Acceso</div>
                  <div className="text-sm text-muted-foreground leading-tight">
                    Sin backend, guardado en tu navegador
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Profesor</Badge>
                <Badge variant="outline">Estudiante</Badge>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Card className="p-6 shadow-[var(--shadow-card)]">
              <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
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
                    <div className="grid gap-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="tu@correo.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="login-pass">Contraseña</Label>
                      <Input
                        id="login-pass"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>

                    <Button
                      onClick={() => {
                        setLoginError(null);
                        const res = login({ email: loginEmail, password: loginPassword });
                        if (res.ok) goAfterAuth(res.user.role === "profesor");
                        else setLoginError("Credenciales inválidas o cuenta no activada (estudiante).");
                      }}
                      className="w-full"
                    >
                      Entrar
                    </Button>
                    {loginError && (
                      <div className="text-sm text-red-600">{loginError}</div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="register" className="mt-6">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="reg-name">Nombre</Label>
                      <Input
                        id="reg-name"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input
                        id="reg-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@correo.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reg-phone">Celular</Label>
                      <Input
                        id="reg-phone"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="+57 300 000 0000"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reg-pass">Contraseña</Label>
                      <Input
                        id="reg-pass"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Crea una contraseña"
                      />
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label>Rol</Label>
                        <div className="text-xs text-muted-foreground">Afecta el calendario</div>
                      </div>
                      <RadioGroup
                        value={role}
                        onValueChange={(v) => setRole(v as Role)}
                        className="grid sm:grid-cols-2 gap-3"
                      >
                        <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50">
                          <RadioGroupItem value="profesor" className="mt-1" />
                          <div className="flex-1">
                            <div className="font-heading font-bold flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-secondary" />
                              Profesor
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Crea y administra eventos.
                            </div>
                          </div>
                        </label>
                        <label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50">
                          <RadioGroupItem value="estudiante" className="mt-1" />
                          <div className="flex-1">
                            <div className="font-heading font-bold flex items-center gap-2">
                              <CalendarDays className="h-4 w-4" />
                              Estudiante
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Revisa eventos y confirma asistencia.
                            </div>
                          </div>
                        </label>
                      </RadioGroup>
                    </div>

                    <Button
                      onClick={() => {
                        setRegisterInfo(null);
                        setOtpError(null);
                        const res = register({ nombre, email, telefono, password, role });
                        if (!res.ok) return;
                        if (role === "profesor") {
                          goAfterAuth(true);
                          return;
                        }
                        // Estudiante: requiere activación OTP (simulada)
                        const otpRes = requestActivationOtp(res.userId);
                        if (otpRes.ok) {
                          setPendingActivation({ userId: res.userId, otpSimulado: otpRes.otpSimulado });
                          setRegisterInfo("Cuenta creada. Actívala con el OTP para entrar.");
                        }
                      }}
                      className="w-full"
                    >
                      Crear cuenta
                    </Button>
                    {registerInfo && (
                      <div className="text-sm text-muted-foreground">{registerInfo}</div>
                    )}

                    {pendingActivation && (
                      <div className="rounded-lg border border-border p-4 bg-muted/30">
                        <div className="text-sm font-semibold">Activación (OTP simulado)</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Enviado por WhatsApp/SMS (simulado): <span className="font-mono">{pendingActivation.otpSimulado}</span>
                        </div>
                        <div className="grid gap-2 mt-3">
                          <Label htmlFor="otp">Ingresa el OTP</Label>
                          <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setOtpError(null);
                              const ok = activateAccount({ userId: pendingActivation.userId, otp }).ok;
                              if (ok) goAfterAuth(false);
                              else setOtpError("OTP inválido o expirado.");
                            }}
                          >
                            Activar y entrar
                          </Button>
                          {otpError && (
                            <div className="text-sm text-red-600">{otpError}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

