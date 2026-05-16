import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'

export default function AppGate() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/auth" replace />
  if (user.role === 'super_admin' || user.role === 'web_master')
    return <Navigate to="/dashboard" replace />
  return <Navigate to="/student" replace />
}
