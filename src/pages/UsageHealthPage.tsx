import { useState, useEffect } from 'react'
import { useUsage } from '@/hooks/useUsage'
import { useTenants } from '@/hooks/useTenants'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import StatsCard from '@/components/StatsCard'
import StatusBadge from '@/components/StatusBadge'
import { RefreshCw, Zap, Server, Cpu, HardDrive, Network, Users, AlertTriangle, CheckCircle, Clock, Search, Download, Eye, Bell, XCircle, Cloud } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export default function UsageHealthPage() {
  const { usageMetrics, systemHealth, isLoading, refreshUsageData } = useUsage()
  const { tenants } = useTenants()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showAlertsDialog, setShowAlertsDialog] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<any>(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        refreshUsageData()
        setLastUpdated(new Date())
        toast.success('Data refreshed automatically')
      }, 30000) // Every 30 seconds
    }
    return () => clearInterval(interval)
  }, [autoRefresh, refreshUsageData])

  // Handlers
  const handleRefresh = () => {
    refreshUsageData()
    setLastUpdated(new Date())
    toast.success('Data refreshed successfully')
  }

  const handleViewDetails = (metric: any) => {
    const tenant = tenants.find(t => t.id === metric.tenantId)
    setSelectedTenant({ ...metric, ...tenant })
    setShowDetailsDialog(true)
  }

  const handleExport = () => {
    const csvContent = [
      ['Tenant', 'Users', 'Customers', 'Visits', 'Storage (GB)', 'API Calls', 'Health Status'],
      ...filteredMetrics.map(m => [
        m.tenantName,
        `${m.currentUsers}/${m.maxUsers}`,
        `${m.currentCustomers}/${m.maxCustomers}`,
        `${m.currentVisits}/${m.maxVisits}`,
        `${m.storageUsed}/${m.storageLimit}`,
        m.apiCallsThisMonth.toString(),
        m.healthStatus
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `usage-metrics-${Date.now()}.csv`
    a.click()
    toast.success('Usage metrics exported successfully')
  }

  const handleShowAlerts = () => {
    setShowAlertsDialog(true)
  }

  // Filter metrics
  const filteredMetrics = usageMetrics.filter((metric) => {
    const matchesSearch = metric.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || metric.healthStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate alerts
  const criticalAlerts = usageMetrics.filter(m => 
    (m.currentUsers / m.maxUsers) > 0.9 || 
    (m.currentCustomers / m.maxCustomers) > 0.9 || 
    (m.currentVisits / m.maxVisits) > 0.9 ||
    (m.storageUsed / m.storageLimit) > 0.9
  )

  const warningAlerts = usageMetrics.filter(m => 
    ((m.currentUsers / m.maxUsers) > 0.75 && (m.currentUsers / m.maxUsers) <= 0.9) || 
    ((m.currentCustomers / m.maxCustomers) > 0.75 && (m.currentCustomers / m.maxCustomers) <= 0.9) || 
    ((m.currentVisits / m.maxVisits) > 0.75 && (m.currentVisits / m.maxVisits) <= 0.9) ||
    ((m.storageUsed / m.storageLimit) > 0.75 && (m.storageUsed / m.storageLimit) <= 0.9)
  )

  // Calculate system stats
  const avgResponseTime = systemHealth ? systemHealth.responseTime : 0
  const totalApiCalls = usageMetrics.reduce((sum, m) => sum + m.apiCallsThisMonth, 0)
  const totalStorage = usageMetrics.reduce((sum, m) => sum + m.storageUsed, 0)
  const healthyTenants = usageMetrics.filter(m => m.healthStatus === 'healthy').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Usage & Health Monitoring</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Real-time tracking of tenant resources and system performance</p>
          <p className="text-xs text-gray-500 mt-1">Last updated: {formatDate(lastUpdated)}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button 
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            size="sm"
            className="text-xs sm:text-sm"
          >
            <Clock className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">{autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}</span>
            <span className="sm:hidden">Auto</span>
          </Button>
          <Button variant="outline" onClick={handleShowAlerts} size="sm" className="text-xs sm:text-sm">
            <Bell className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Alerts</span> ({criticalAlerts.length + warningAlerts.length})
          </Button>
          <Button variant="outline" onClick={handleExport} size="sm" className="text-xs sm:text-sm">
            <Download className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={handleRefresh} disabled={isLoading} size="sm" className="text-xs sm:text-sm">
            <RefreshCw className={`mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="System Uptime"
          value={`${systemHealth?.uptime || 0}%`}
          icon={Server}
          trend={{ value: 0.2, isPositive: true }}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Avg Response Time"
          value={`${avgResponseTime}ms`}
          icon={Zap}
          trend={{ value: 12, isPositive: false }}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="Total API Calls"
          value={totalApiCalls.toLocaleString()}
          icon={Network}
          trend={{ value: 23, isPositive: true }}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <StatsCard
          title="Healthy Tenants"
          value={`${healthyTenants}/${usageMetrics.length}`}
          icon={CheckCircle}
          trend={{ value: 5, isPositive: true }}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
        />
      </div>

      {/* System Performance */}
      {systemHealth && (
        <Card className="bg-white/90 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>System Performance Metrics</CardTitle>
            <CardDescription>Real-time system health indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-1 sm:gap-2 mb-2">
                  <Server className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  <p className="text-xs text-gray-600">Uptime</p>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{systemHealth.uptime}%</p>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
              <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-1 sm:gap-2 mb-2">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  <p className="text-xs text-gray-600">Response</p>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{systemHealth.responseTime}ms</p>
                <p className="text-xs text-gray-500 mt-1">Avg response</p>
              </div>
              <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-1 sm:gap-2 mb-2">
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                  <p className="text-xs text-gray-600">Error Rate</p>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">{systemHealth.errorRate}%</p>
                <p className="text-xs text-gray-500 mt-1">Last hour</p>
              </div>
              <div className="p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-1 sm:gap-2 mb-2">
                  <Network className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                  <p className="text-xs text-gray-600">Connections</p>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{systemHealth.activeConnections}</p>
                <p className="text-xs text-gray-500 mt-1">Active now</p>
              </div>
              <div className="p-3 sm:p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-1 sm:gap-2 mb-2">
                  <Cpu className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                  <p className="text-xs text-gray-600">CPU Usage</p>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-indigo-600">42%</p>
                <p className="text-xs text-gray-500 mt-1">Avg load</p>
              </div>
              <div className="p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-1 sm:gap-2 mb-2">
                  <HardDrive className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                  <p className="text-xs text-gray-600">Storage</p>
                </div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">{totalStorage.toFixed(1)}GB</p>
                <p className="text-xs text-gray-500 mt-1">Total used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="bg-white/90 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by tenant name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status ({usageMetrics.length})</SelectItem>
                <SelectItem value="healthy">Healthy ({usageMetrics.filter(m => m.healthStatus === 'healthy').length})</SelectItem>
                <SelectItem value="warning">Warning ({usageMetrics.filter(m => m.healthStatus === 'warning').length})</SelectItem>
                <SelectItem value="critical">Critical ({usageMetrics.filter(m => m.healthStatus === 'critical').length})</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Showing {filteredMetrics.length} of {usageMetrics.length} tenants
            </span>
            {criticalAlerts.length > 0 && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">{criticalAlerts.length} critical alerts</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tenant Usage Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMetrics.map((metric) => {
          const usagePercentages = {
            users: (metric.currentUsers / metric.maxUsers) * 100,
            customers: (metric.currentCustomers / metric.maxCustomers) * 100,
            visits: (metric.currentVisits / metric.maxVisits) * 100,
            storage: (metric.storageUsed / metric.storageLimit) * 100
          }
          const avgUsage = Object.values(usagePercentages).reduce((a, b) => a + b, 0) / 4
          const tenant = tenants.find(t => t.id === metric.tenantId)

          return (
          <Card key={metric.tenantId} className="bg-white/90 backdrop-blur-xl hover:shadow-lg transition-shadow group">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    metric.healthStatus === 'healthy' ? 'bg-green-100' :
                    metric.healthStatus === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                    <Users className={`w-5 h-5 sm:w-6 sm:h-6 ${
                      metric.healthStatus === 'healthy' ? 'text-green-600' :
                      metric.healthStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base sm:text-lg truncate">{metric.tenantName}</CardTitle>
                      {tenant && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs flex-shrink-0 ${
                            tenant.deploymentType === 'centralized' 
                              ? 'bg-cyan-50 text-cyan-700' 
                              : 'bg-purple-50 text-purple-700'
                          }`}
                        >
                          {tenant.deploymentType === 'centralized' ? (
                            <><Cloud className="w-3 h-3 mr-1 inline" />Centralized</>
                          ) : (
                            <><Server className="w-3 h-3 mr-1 inline" />Self-Hosted</>
                          )}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {tenant?.deploymentType === 'self-hosted' ? 'Self-Managed • ' : ''}
                      Avg Usage: {avgUsage.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={metric.healthStatus} type="health" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    onClick={() => handleViewDetails(metric)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              {/* Users */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Users</span>
                  <span className="font-semibold">
                    {metric.currentUsers} / {metric.maxUsers}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(metric.currentUsers / metric.maxUsers) * 100}%` }}
                  />
                </div>
              </div>

              {/* Customers */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Customers</span>
                  <span className="font-semibold">
                    {metric.currentCustomers.toLocaleString()} / {metric.maxCustomers.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(metric.currentCustomers / metric.maxCustomers) * 100}%` }}
                  />
                </div>
              </div>

              {/* Visits */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Visits</span>
                  <span className="font-semibold">
                    {metric.currentVisits.toLocaleString()} / {metric.maxVisits.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${(metric.currentVisits / metric.maxVisits) * 100}%` }}
                  />
                </div>
              </div>

              {/* Storage */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Storage</span>
                  <span className="font-semibold">
                    {metric.storageUsed}GB / {metric.storageLimit}GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${(metric.storageUsed / metric.storageLimit) * 100}%` }}
                  />
                </div>
              </div>

              {/* API Calls */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Zap className="w-4 h-4" />
                    API Calls This Month
                  </div>
                  <span className="font-semibold text-gray-900">
                    {metric.apiCallsThisMonth.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleViewDetails(metric)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Full Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )})}
      </div>

      {/* View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Tenant Usage Details</DialogTitle>
            <DialogDescription>Comprehensive resource usage and health metrics</DialogDescription>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-6 py-4">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                  selectedTenant.healthStatus === 'healthy' ? 'bg-green-100' :
                  selectedTenant.healthStatus === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <Users className={`w-8 h-8 ${
                    selectedTenant.healthStatus === 'healthy' ? 'text-green-600' :
                    selectedTenant.healthStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedTenant.tenantName}</h3>
                  <p className="text-gray-600">{selectedTenant.companyName}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={selectedTenant.healthStatus} type="health" />
                    <span className="text-sm text-gray-600">Plan: {selectedTenant.planName}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Resource Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Users:</span>
                        <span className="font-semibold">{selectedTenant.currentUsers}/{selectedTenant.maxUsers}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(selectedTenant.currentUsers / selectedTenant.maxUsers) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Customers:</span>
                        <span className="font-semibold">{selectedTenant.currentCustomers.toLocaleString()}/{selectedTenant.maxCustomers.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(selectedTenant.currentCustomers / selectedTenant.maxCustomers) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Visits:</span>
                        <span className="font-semibold">{selectedTenant.currentVisits.toLocaleString()}/{selectedTenant.maxVisits.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(selectedTenant.currentVisits / selectedTenant.maxVisits) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storage:</span>
                        <span className="font-semibold">{selectedTenant.storageUsed}GB/{selectedTenant.storageLimit}GB</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${(selectedTenant.storageUsed / selectedTenant.storageLimit) * 100}%` }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">API & Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">API Calls:</span>
                      <span className="font-semibold">{selectedTenant.apiCallsThisMonth.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Activity:</span>
                      <span className="font-semibold">{formatDate(selectedTenant.lastActivity)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className="font-semibold capitalize">{selectedTenant.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">MRR:</span>
                      <span className="font-semibold text-green-600">ر.س{selectedTenant.mrr}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alerts Dialog */}
      <Dialog open={showAlertsDialog} onOpenChange={setShowAlertsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>System Alerts</DialogTitle>
            <DialogDescription>Resource usage warnings and critical alerts</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            {criticalAlerts.length === 0 && warningAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>No alerts at this time</p>
                <p className="text-sm">All systems operating normally</p>
              </div>
            ) : (
              <>
                {criticalAlerts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600 flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      Critical Alerts ({criticalAlerts.length})
                    </h4>
                    {criticalAlerts.map((metric) => (
                      <div key={metric.tenantId} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-medium text-gray-900">{metric.tenantName}</p>
                        <div className="text-sm text-gray-700 mt-1 space-y-1">
                          {(metric.currentUsers / metric.maxUsers) > 0.9 && (
                            <p>• Users: {metric.currentUsers}/{metric.maxUsers} ({((metric.currentUsers / metric.maxUsers) * 100).toFixed(1)}%)</p>
                          )}
                          {(metric.currentCustomers / metric.maxCustomers) > 0.9 && (
                            <p>• Customers: {metric.currentCustomers}/{metric.maxCustomers} ({((metric.currentCustomers / metric.maxCustomers) * 100).toFixed(1)}%)</p>
                          )}
                          {(metric.currentVisits / metric.maxVisits) > 0.9 && (
                            <p>• Visits: {metric.currentVisits}/{metric.maxVisits} ({((metric.currentVisits / metric.maxVisits) * 100).toFixed(1)}%)</p>
                          )}
                          {(metric.storageUsed / metric.storageLimit) > 0.9 && (
                            <p>• Storage: {metric.storageUsed}GB/{metric.storageLimit}GB ({((metric.storageUsed / metric.storageLimit) * 100).toFixed(1)}%)</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {warningAlerts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-yellow-600 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Warnings ({warningAlerts.length})
                    </h4>
                    {warningAlerts.map((metric) => (
                      <div key={metric.tenantId} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="font-medium text-gray-900">{metric.tenantName}</p>
                        <div className="text-sm text-gray-700 mt-1 space-y-1">
                          {((metric.currentUsers / metric.maxUsers) > 0.75 && (metric.currentUsers / metric.maxUsers) <= 0.9) && (
                            <p>• Users approaching limit: {metric.currentUsers}/{metric.maxUsers}</p>
                          )}
                          {((metric.currentCustomers / metric.maxCustomers) > 0.75 && (metric.currentCustomers / metric.maxCustomers) <= 0.9) && (
                            <p>• Customers approaching limit: {metric.currentCustomers}/{metric.maxCustomers}</p>
                          )}
                          {((metric.currentVisits / metric.maxVisits) > 0.75 && (metric.currentVisits / metric.maxVisits) <= 0.9) && (
                            <p>• Visits approaching limit: {metric.currentVisits}/{metric.maxVisits}</p>
                          )}
                          {((metric.storageUsed / metric.storageLimit) > 0.75 && (metric.storageUsed / metric.storageLimit) <= 0.9) && (
                            <p>• Storage approaching limit: {metric.storageUsed}GB/{metric.storageLimit}GB</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlertsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
