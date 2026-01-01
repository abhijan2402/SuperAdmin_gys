import { useState, useEffect } from 'react'
import { mockUsageMetrics, mockSystemHealth } from '@/services/mockData'
import type { UsageMetrics, SystemHealth } from '@/types/usage'

export function useUsage() {
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUsageData = async () => {
      await new Promise(resolve => setTimeout(resolve, 400))
      setUsageMetrics(mockUsageMetrics)
      setSystemHealth(mockSystemHealth)
      setIsLoading(false)
    }
    loadUsageData()
  }, [])

  const refreshUsageData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setUsageMetrics([...mockUsageMetrics]) // Simulate refresh
    setIsLoading(false)
  }

  return {
    usageMetrics,
    systemHealth,
    isLoading,
    refreshUsageData,
  }
}
