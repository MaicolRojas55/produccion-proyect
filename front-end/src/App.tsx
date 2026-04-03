import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ErrorBoundary } from '@/ErrorBoundary'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import { AuthProvider } from '@/features/auth/AuthContext'
import { RequireAuth } from '@/features/auth/RequireAuth'
import Auth from './pages/Auth'
import CalendarPage from './pages/CalendarPage'
import Agenda from './pages/Agenda'
import AppGate from './pages/AppGate'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import StudentPortal from './pages/StudentPortal'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import Conferencistas from './pages/Conferencistas'

const queryClient = new QueryClient()

const router = createBrowserRouter(
  [
    { path: '/', element: <Index /> },
    { path: '/auth', element: <Auth /> },
    { path: '/agenda', element: <Agenda /> },
    { path: '/conferencistas', element: <Conferencistas /> },
    {
      path: '/calendar',
      element: (
        <RequireAuth>
          <AppGate />
        </RequireAuth>
      )
    },
    {
      path: '/dashboard',
      element: (
        <ProtectedRoute allowedRoles={['super_admin', 'web_master']}>
          <SuperAdminDashboard />
        </ProtectedRoute>
      )
    },
    {
      path: '/student',
      element: (
        <RequireAuth>
          <StudentPortal />
        </RequireAuth>
      )
    },
    {
      path: '/calendar-legacy',
      element: (
        <RequireAuth>
          <CalendarPage />
        </RequireAuth>
      )
    },
    { path: '*', element: <NotFound /> }
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
)

import { useEffect } from 'react'
import { loadUsers, saveUsers } from '@/features/auth/storage'
import type { User } from '@/features/auth/types'

const App = () => {
  // Inject test admin users into localStorage
  useEffect(() => {
    const users = loadUsers()
    let updated = false

    // Force admin@test.com to be super_admin and active
    const adminIndex = users.findIndex((u) => u.email === 'admin@test.com')
    if (adminIndex >= 0) {
      if (
        users[adminIndex].role !== 'super_admin' ||
        !users[adminIndex].activated
      ) {
        users[adminIndex].role = 'super_admin'
        users[adminIndex].activated = true
        updated = true
      }
    } else {
      const superAdmin: User = {
        id: 'test-admin-1',
        nombre: 'Super Administrador',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'super_admin',
        activated: true,
        createdAt: new Date().toISOString()
      }
      users.push(superAdmin)
      updated = true
    }

    // Force webmaster@test.com to be web_master and active
    const webmasterIndex = users.findIndex(
      (u) => u.email === 'webmaster@test.com'
    )
    if (webmasterIndex >= 0) {
      if (
        users[webmasterIndex].role !== 'web_master' ||
        !users[webmasterIndex].activated
      ) {
        users[webmasterIndex].role = 'web_master'
        users[webmasterIndex].activated = true
        updated = true
      }
    } else {
      const webMaster: User = {
        id: 'test-webmaster-1',
        nombre: 'Web Master',
        email: 'webmaster@test.com',
        password: 'webmaster123',
        role: 'web_master',
        activated: true,
        createdAt: new Date().toISOString()
      }
      users.push(webMaster)
      updated = true
    }

    if (updated) {
      saveUsers(users)
      console.log(
        '✓ Usuarios de prueba inyectados y verificados (super_admin y web_master)'
      )
    }
  }, [])

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
