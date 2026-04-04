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
import WebMasterDashboard from './pages/WebMasterDashboard'
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
      path: '/web-master',
      element: (
        <ProtectedRoute allowedRoles={['super_admin', 'web_master']}>
          <WebMasterDashboard />
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

const App = () => {
  // Users are now managed by the backend API
  useEffect(() => {
    console.log('✓ App initialized - users managed by backend API')
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
