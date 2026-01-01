import { useState, useEffect } from 'react'
import type { Settings } from '@/types/settings'
import { toast } from 'sonner'

const defaultSettings: Settings = {
  notifications: {
    emailNotifications: true,
    tenantSignups: true,
    paymentAlerts: true,
    systemAlerts: true,
    supportTickets: true,
  },
  system: {
    maintenanceMode: false,
    allowSignups: true,
    defaultTrialDays: 30,
    requireEmailVerification: true,
    sessionTimeout: 60,
  },
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      await new Promise(resolve => setTimeout(resolve, 200))
      // In production, load from API
      const stored = localStorage.getItem('superadmin_settings')
      if (stored) {
        setSettings(JSON.parse(stored))
      }
      setIsLoading(false)
    }
    loadSettings()
  }, [])

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    localStorage.setItem('superadmin_settings', JSON.stringify(updated))
    toast.success('Settings updated successfully')
  }

  const updateNotificationSettings = async (notificationSettings: Partial<Settings['notifications']>) => {
    const updated = {
      ...settings,
      notifications: { ...settings.notifications, ...notificationSettings },
    }
    setSettings(updated)
    localStorage.setItem('superadmin_settings', JSON.stringify(updated))
    toast.success('Notification settings updated')
  }

  const updateSystemSettings = async (systemSettings: Partial<Settings['system']>) => {
    const updated = {
      ...settings,
      system: { ...settings.system, ...systemSettings },
    }
    setSettings(updated)
    localStorage.setItem('superadmin_settings', JSON.stringify(updated))
    toast.success('System settings updated')
  }

  return {
    settings,
    isLoading,
    updateSettings,
    updateNotificationSettings,
    updateSystemSettings,
  }
}
