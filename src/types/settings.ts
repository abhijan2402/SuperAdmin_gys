export interface NotificationSettings {
  emailNotifications: boolean
  tenantSignups: boolean
  paymentAlerts: boolean
  systemAlerts: boolean
  supportTickets: boolean
}

export interface SystemSettings {
  maintenanceMode: boolean
  allowSignups: boolean
  defaultTrialDays: number
  requireEmailVerification: boolean
  sessionTimeout: number // minutes
}

export interface Settings {
  notifications: NotificationSettings
  system: SystemSettings
}
