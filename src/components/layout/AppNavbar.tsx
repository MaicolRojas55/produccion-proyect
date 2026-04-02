import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/features/auth/useAuth'
import { isStaffRole } from '@/features/auth/types'
import {
  BookOpen,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Search,
  User
} from 'lucide-react'

interface AppNavbarProps {
  variant?: 'light' | 'dark'
  /** Estilo CONIITI: Logo, Inicio, Páginas, Memorias, Acerca de, Contacto */
  layout?: 'default' | 'coniiti'
  className?: string
}

const navLinkClass = (variant: 'light' | 'dark') =>
  variant === 'dark'
    ? 'text-primary-foreground hover:text-primary-foreground/90'
    : 'text-foreground hover:text-foreground/90'

/** Línea vertical entre ítems del navbar (estilo CONIITI). */
function NavSeparator({ variant }: { variant: 'light' | 'dark' }) {
  const bg =
    variant === 'dark' ? 'bg-primary-foreground/40' : 'bg-foreground/40'
  return <span className={`w-px h-4 shrink-0 self-center ${bg}`} aria-hidden />
}

export function AppNavbar({
  variant = 'dark',
  layout = 'default',
  className = ''
}: AppNavbarProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isStaff = user ? isStaffRole(user.role) : false
  const isRegistered = user && user.role === 'usuario_registrado'
  const textClass =
    variant === 'dark' ? 'text-primary-foreground' : 'text-foreground'
  const hoverClass =
    variant === 'dark'
      ? 'hover:text-primary-foreground/90'
      : 'hover:text-foreground/90'

  const linkCls = `px-3 py-2 text-sm font-medium rounded-md transition-colors uppercase tracking-wide ${navLinkClass(variant)}`
  const dropdownTriggerCls = `flex items-center gap-0.5 px-3 py-2 text-sm font-medium rounded-md outline-none uppercase tracking-wide ${navLinkClass(variant)}`

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b py-3 flex items-center justify-around gap-4 px-8 ${className}`}
    >
      <div className="flex items-center gap-6">
        {location.pathname === '/' ? (
          <a
            href="#hero"
            className={`font-heading font-black text-lg tracking-tight ${textClass} ${hoverClass}`}
          >
            CONIITI
          </a>
        ) : (
          <Link
            to="/#hero"
            className={`font-heading font-black text-lg tracking-tight ${textClass} ${hoverClass}`}
          >
            CONIITI
          </Link>
        )}
        <div className="hidden sm:flex items-center gap-0">
          {layout === 'coniiti' ? (
            <>
              {location.pathname === '/' ? (
                <a href="#hero" className={linkCls}>
                  Inicio
                </a>
              ) : (
                <Link to="/#hero" className={linkCls}>
                  Inicio
                </Link>
              )}
              <NavSeparator variant={variant} />
              <DropdownMenu>
                <DropdownMenuTrigger className={dropdownTriggerCls}>
                  Páginas
                  <ChevronDown className="h-4 w-4 ml-0.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[180px]">
                  <DropdownMenuItem asChild>
                    <a href="/#comite">Comité</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/#conferencistas">Conferencistas 2025</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/#autores">Autores</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/#galeria">Galería</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/#noticias">Últimas noticias</a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <NavSeparator variant={variant} />
              <DropdownMenu>
                <DropdownMenuTrigger className={dropdownTriggerCls}>
                  Memorias
                  <ChevronDown className="h-4 w-4 ml-0.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[180px]">
                  <DropdownMenuItem asChild>
                    <a href="/#memorias">III CONIITI v2017</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/#memorias-1">II CONIITI v2016</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/#memorias-2">I CONIITI v2015</a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <NavSeparator variant={variant} />
              <a href="/#acerca" className={linkCls}>
                Acerca de
              </a>
              <NavSeparator variant={variant} />
              <a href="/#contacto" className={linkCls}>
                Contacto
              </a>
            </>
          ) : (
            <>
              <Link to="/" className={linkCls}>
                Inicio
              </Link>
              <Link to="/agenda" className={linkCls}>
                Agenda
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0">
        {layout === 'coniiti' && !user && (
          <>
            <NavSeparator variant={variant} />
            <Link
              to="/agenda"
              className={`hidden sm:inline-flex ml-1 ${linkCls}`}
            >
              Agenda
            </Link>
            <NavSeparator variant={variant} />
            <button
              type="button"
              className={`p-2 rounded-md ${navLinkClass(variant)}`}
              aria-label="Buscar"
            >
              <Search className="h-4 w-4" />
            </button>
          </>
        )}
        {!user ? (
          <>
            {layout === 'coniiti' && <NavSeparator variant={variant} />}
            <Button
              asChild
              variant={variant === 'dark' ? 'secondary' : 'outline'}
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link to="/auth?tab=login">Iniciar sesión</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth?tab=register">Registrarse</Link>
            </Button>
          </>
        ) : (
          <>
            {layout === 'coniiti' && <NavSeparator variant={variant} />}
            <Link to="/agenda" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" className={textClass}>
                <BookOpen className="h-4 w-4 mr-2" />
                Agenda
              </Button>
            </Link>
            {user.role === 'super_admin' && (
              <Button asChild variant="secondary" size="sm" className="ml-2">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard (Admin)
                </Link>
              </Button>
            )}
            {user.role === 'web_master' && (
              <Button asChild variant="secondary" size="sm" className="ml-2">
                <Link to="/web-master">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Web Master
                </Link>
              </Button>
            )}
            {isRegistered && (
              <Button asChild variant="secondary" size="sm">
                <Link to="/student">
                  <User className="h-4 w-4 mr-2" />
                  Mi espacio
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className={textClass}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </>
        )}
      </div>
    </nav>
  )
}
