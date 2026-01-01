export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  status: boolean
  created_at: Date
  link?: string
  tenantId?: string
  read?:boolean
}

export interface NotificationFormData {
  targetTenants: string[] // 'all' or specific tenant IDs
  title: string
  message: string
  type: NotificationType
}
