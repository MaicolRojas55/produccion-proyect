export type ServiceHealthStatus = 'up' | 'down' | 'checking'

export interface ServiceHealth {
  id: string
  name: string
  endpoint: string
  status: ServiceHealthStatus
  latencyMs?: number
  payload?: Record<string, unknown>
  error?: string
}
