export type HealthStatus = 'healthy' | 'warning' | 'critical'

export interface UsageMetrics {
  tenantId: string
  tenantName: string
  currentUsers: number
  maxUsers: number
  currentCustomers: number
  maxCustomers: number
  currentVisits: number
  maxVisits: number
  storageUsed: number // in GB
  storageLimit: number // in GB
  apiCallsThisMonth: number
  healthStatus: HealthStatus
  lastChecked: Date
}

export interface SystemHealth {
  uptime: number // percentage
  responseTime: number // ms
  errorRate: number // percentage
  activeConnections: number
}
