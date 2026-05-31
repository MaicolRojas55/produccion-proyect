import { useCallback, useEffect, useState } from 'react'
import type { ServiceHealth, ServiceHealthStatus } from './types'

const SERVICES: Omit<ServiceHealth, 'status'>[] = [
  {
    id: 'users',
    name: 'Users Service',
    endpoint: '/api/health/users'
  },
  {
    id: 'conferences',
    name: 'Conferences Service',
    endpoint: '/api/health/conferences'
  },
  {
    id: 'notifications',
    name: 'Notification Service',
    endpoint: '/api/health/notifications'
  },
  {
    id: 'backend',
    name: 'Backend legacy',
    endpoint: '/api/health/backend'
  }
]

async function probe(
  endpoint: string
): Promise<Pick<ServiceHealth, 'status' | 'latencyMs' | 'payload' | 'error'>> {
  const started = performance.now()
  try {
    const url = endpoint.startsWith('http')
      ? endpoint
      : new URL(endpoint, window.location.origin).href
    const response = await fetch(url, { cache: 'no-store' })
    const latencyMs = Math.round(performance.now() - started)
    if (!response.ok) {
      return {
        status: 'down',
        latencyMs,
        error: `HTTP ${response.status}`
      }
    }
    const payload = (await response.json()) as Record<string, unknown>
    return { status: 'up', latencyMs, payload }
  } catch (err) {
    return {
      status: 'down',
      latencyMs: Math.round(performance.now() - started),
      error: err instanceof Error ? err.message : 'Error de red'
    }
  }
}

export function useSystemHealth(pollIntervalMs = 15000) {
  const [services, setServices] = useState<ServiceHealth[]>(
    SERVICES.map((s) => ({ ...s, status: 'checking' as ServiceHealthStatus }))
  )
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const refresh = useCallback(async () => {
    setServices((prev) =>
      prev.map((s) => ({ ...s, status: 'checking' as ServiceHealthStatus }))
    )
    const results = await Promise.all(
      SERVICES.map(async (service) => {
        const result = await probe(service.endpoint)
        return { ...service, ...result }
      })
    )
    setServices(results)
    setLastChecked(new Date())
  }, [])

  useEffect(() => {
    void refresh()
    const id = window.setInterval(() => void refresh(), pollIntervalMs)
    return () => window.clearInterval(id)
  }, [refresh, pollIntervalMs])

  const upCount = services.filter((s) => s.status === 'up').length

  return { services, lastChecked, refresh, upCount, total: services.length }
}
