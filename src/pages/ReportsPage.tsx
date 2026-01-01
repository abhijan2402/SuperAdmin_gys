import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import StatsCard from '@/components/StatsCard'
import {
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw,
  Clock,
  Eye,
  Trash2,
  Plus,
  Search,
  Mail,
  Settings,
  Zap,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface Report {
  id: number
  name: string
  type: string
  period: string
  generatedAt: string
  generatedBy: string
  size: string
  status: 'completed' | 'processing' | 'failed'
  format: 'pdf' | 'xlsx' | 'csv'
}

interface ScheduledReport {
  id: number
  name: string
  type: string
  frequency: string
  nextRun: string
  recipients: string[]
  enabled: boolean
  format: string
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Report Generation Form
  const [reportForm, setReportForm] = useState({
    name: '',
    type: 'revenue',
    period: 'monthly',
    startDate: '',
    endDate: '',
    format: 'pdf',
    includeCharts: true,
    includeDetails: true
  })

  // Schedule Report Form
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    type: 'revenue',
    frequency: 'weekly',
    time: '09:00',
    recipients: '',
    format: 'pdf',
    enabled: true
  })

  // Generated Reports
  const [reports] = useState<Report[]>([
    {
      id: 1,
      name: 'Monthly Revenue Report',
      type: 'Revenue',
      period: 'November 2025',
      generatedAt: '2025-12-01 09:30',
      generatedBy: 'Super Admin',
      size: '2.4 MB',
      status: 'completed',
      format: 'pdf'
    },
    {
      id: 2,
      name: 'Tenant Activity Report',
      type: 'Activity',
      period: 'Q4 2025',
      generatedAt: '2025-11-28 14:15',
      generatedBy: 'Super Admin',
      size: '1.8 MB',
      status: 'completed',
      format: 'xlsx'
    },
    {
      id: 3,
      name: 'Subscription Analytics',
      type: 'Subscriptions',
      period: 'November 2025',
      generatedAt: '2025-11-27 10:00',
      generatedBy: 'Super Admin',
      size: '856 KB',
      status: 'processing',
      format: 'pdf'
    },
    {
      id: 4,
      name: 'Payment History Report',
      type: 'Payments',
      period: 'October 2025',
      generatedAt: '2025-11-25 16:45',
      generatedBy: 'Super Admin',
      size: '3.1 MB',
      status: 'completed',
      format: 'xlsx'
    },
    {
      id: 5,
      name: 'User Engagement Report',
      type: 'Engagement',
      period: 'Q3 2025',
      generatedAt: '2025-11-20 11:20',
      generatedBy: 'System',
      size: '1.2 MB',
      status: 'failed',
      format: 'pdf'
    }
  ])

  // Scheduled Reports
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: 1,
      name: 'Weekly Revenue Summary',
      type: 'Revenue',
      frequency: 'Weekly (Monday)',
      nextRun: '2025-12-08 09:00',
      recipients: ['admin@example.com', 'finance@example.com'],
      enabled: true,
      format: 'pdf'
    },
    {
      id: 2,
      name: 'Monthly Tenant Report',
      type: 'Tenants',
      frequency: 'Monthly (1st)',
      nextRun: '2026-01-01 08:00',
      recipients: ['admin@example.com'],
      enabled: true,
      format: 'xlsx'
    },
    {
      id: 3,
      name: 'Daily Activity Log',
      type: 'Activity',
      frequency: 'Daily',
      nextRun: '2025-12-02 00:00',
      recipients: ['admin@example.com', 'security@example.com'],
      enabled: false,
      format: 'csv'
    }
  ])

  // Analytics Data
  const analyticsData = {
    totalReports: 156,
    reportsThisMonth: 23,
    scheduledActive: 8,
    averageGenerationTime: '45s',
    topReportType: 'Revenue Reports',
    totalDownloads: 892,
    storageUsed: '1.2 GB'
  }

  const handleGenerateReport = async () => {
    if (!reportForm.name) {
      toast.error('Please enter report name')
      return
    }
    if (reportForm.period === 'custom' && (!reportForm.startDate || !reportForm.endDate)) {
      toast.error('Please select date range')
      return
    }

    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Report generated successfully!')
      setShowGenerateDialog(false)
      setReportForm({
        name: '',
        type: 'revenue',
        period: 'monthly',
        startDate: '',
        endDate: '',
        format: 'pdf',
        includeCharts: true,
        includeDetails: true
      })
    } catch (error) {
      toast.error('Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleScheduleReport = async () => {
    if (!scheduleForm.name || !scheduleForm.recipients) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsGenerating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Report scheduled successfully!')
      setShowScheduleDialog(false)
      setScheduleForm({
        name: '',
        type: 'revenue',
        frequency: 'weekly',
        time: '09:00',
        recipients: '',
        format: 'pdf',
        enabled: true
      })
    } catch (error) {
      toast.error('Failed to schedule report')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadReport = (report: Report) => {
    toast.success(`Downloading ${report.name}...`)
    setTimeout(() => {
      toast.success('Download complete!')
    }, 1500)
  }

  const handleDeleteReport = (_reportId: number) => {
    toast.success('Report deleted successfully')
  }

  const handleToggleSchedule = (scheduleId: number) => {
    setScheduledReports(scheduledReports.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, enabled: !schedule.enabled }
        : schedule
    ))
    const schedule = scheduledReports.find(s => s.id === scheduleId)
    toast.success(`Schedule ${schedule?.enabled ? 'disabled' : 'enabled'}`)
  }

  const handleEmailReport = (_report: Report) => {
    toast.info('Sending report via email...')
    setTimeout(() => {
      toast.success('Report sent successfully!')
    }, 1000)
  }

  const handlePreviewReport = (report: Report) => {
    setSelectedReport(report)
    setShowPreviewDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Processing</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Failed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Unknown</Badge>
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return '📄'
      case 'xlsx': return '📊'
      case 'csv': return '📋'
      default: return '📁'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Generate, schedule, and manage system reports</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button onClick={() => setShowScheduleDialog(true)} variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
            <Clock className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Schedule Report</span>
            <span className="sm:hidden">Schedule</span>
          </Button>
          <Button onClick={() => setShowGenerateDialog(true)} size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
            <Plus className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Generate Report</span>
            <span className="sm:hidden">Generate</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatsCard
          title="Total Reports"
          value={analyticsData.totalReports.toString()}
          icon={FileText}
          trend={{ value: 12, isPositive: true }}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="This Month"
          value={analyticsData.reportsThisMonth.toString()}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Scheduled Active"
          value={analyticsData.scheduledActive.toString()}
          icon={Clock}
          trend={{ value: 2, isPositive: true }}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <StatsCard
          title="Total Downloads"
          value={analyticsData.totalDownloads.toString()}
          icon={Download}
          trend={{ value: 15, isPositive: true }}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Card className="bg-white/90 backdrop-blur-xl shadow-lg mb-6">
          <CardContent className="p-0">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto gap-0 p-0 bg-transparent border-b border-gray-200 rounded-none">
              <TabsTrigger 
                value="overview"
                className="flex-shrink-0 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 hover:bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 rounded-none border-b-2 border-transparent transition-all text-xs sm:text-sm"
              >
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="generated"
                className="flex-shrink-0 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 hover:bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 rounded-none border-b-2 border-transparent transition-all text-xs sm:text-sm"
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">Generated Reports</span>
                <span className="sm:hidden">Reports</span>
              </TabsTrigger>
              <TabsTrigger 
                value="scheduled"
                className="flex-shrink-0 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 hover:bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 rounded-none border-b-2 border-transparent transition-all text-xs sm:text-sm"
              >
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">Scheduled</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="flex-shrink-0 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 hover:bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 rounded-none border-b-2 border-transparent transition-all text-xs sm:text-sm"
              >
                <PieChart className="w-5 h-5 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {/* Quick Generate Cards */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowGenerateDialog(true)}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm">Revenue Report</p>
                    <h3 className="text-lg sm:text-2xl font-bold mt-1">Generate Now</h3>
                  </div>
                  <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white/50" />
                </div>
                <p className="text-blue-100 text-xs sm:text-sm mt-2 sm:mt-4">Track revenue and payments</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowGenerateDialog(true)}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs sm:text-sm">Tenant Report</p>
                    <h3 className="text-lg sm:text-2xl font-bold mt-1">Generate Now</h3>
                  </div>
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white/50" />
                </div>
                <p className="text-green-100 text-xs sm:text-sm mt-2 sm:mt-4">Analyze tenant metrics</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowGenerateDialog(true)}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs sm:text-sm">Activity Report</p>
                    <h3 className="text-lg sm:text-2xl font-bold mt-1">Generate Now</h3>
                  </div>
                  <Activity className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white/50" />
                </div>
                <p className="text-purple-100 text-xs sm:text-sm mt-2 sm:mt-4">Monitor system activity</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Recent Reports</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Latest generated reports</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {reports.slice(0, 5).map((report) => (
                  <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors gap-3">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                      <div className="text-2xl sm:text-3xl flex-shrink-0">{getFormatIcon(report.format)}</div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{report.name}</h4>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-gray-600">
                          <span>{report.type}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{report.period}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{report.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusBadge(report.status)}
                      {report.status === 'completed' && (
                        <Button size="sm" variant="outline" onClick={() => handleDownloadReport(report)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Report Templates */}
          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Report Templates</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Pre-configured report templates</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { name: 'Financial Summary', icon: DollarSign, color: 'blue' },
                  { name: 'User Analytics', icon: Users, color: 'green' },
                  { name: 'Performance Metrics', icon: TrendingUp, color: 'purple' },
                  { name: 'System Health', icon: Activity, color: 'orange' }
                ].map((template, index) => {
                  const IconComponent = template.icon
                  return (
                    <Card key={index} className={`border-2 border-${template.color}-200 hover:border-${template.color}-400 cursor-pointer transition-colors`}>
                      <CardContent className="p-4">
                        <div className={`w-10 h-10 rounded-full bg-${template.color}-100 flex items-center justify-center mb-3`}>
                          <IconComponent className={`w-5 h-5 text-${template.color}-600`} />
                        </div>
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">Quick generate</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generated Reports Tab */}
        <TabsContent value="generated" className="space-y-4 sm:space-y-6">
          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Generated Reports</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">All system-generated reports</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                    <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Search Bar */}
              <div className="mb-4 sm:mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search reports..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Reports Table */}
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Period</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Generated</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="text-xl sm:text-2xl">{getFormatIcon(report.format)}</div>
                            <div className="min-w-0">
                              <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">{report.name}</p>
                              <p className="text-xs text-gray-500">{report.size}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <Badge variant="outline" className="text-xs">{report.type}</Badge>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                          {report.period}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                          <p className="text-xs sm:text-sm text-gray-900">{report.generatedAt}</p>
                          <p className="text-xs text-gray-500">by {report.generatedBy}</p>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          {getStatusBadge(report.status)}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {report.status === 'completed' && (
                              <>
                                <Button size="sm" variant="ghost" onClick={() => handlePreviewReport(report)} title="Preview" className="h-8 w-8 p-0">
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDownloadReport(report)} title="Download" className="h-8 w-8 p-0">
                                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleEmailReport(report)} title="Email" className="h-8 w-8 p-0 hidden sm:flex">
                                  <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteReport(report.id)} className="text-red-600 hover:text-red-700 h-8 w-8 p-0" title="Delete">
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-4 sm:space-y-6">
          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle>Scheduled Reports</CardTitle>
                  <CardDescription>Automated report generation</CardDescription>
                </div>
                <Button onClick={() => setShowScheduleDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledReports.map((schedule) => (
                  <Card key={schedule.id} className="border-2 hover:border-gray-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-full ${schedule.enabled ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                            <Clock className={`w-6 h-6 ${schedule.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-gray-900">{schedule.name}</h4>
                              <Badge variant="outline">{schedule.type}</Badge>
                              {schedule.enabled ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Paused</Badge>
                              )}
                            </div>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <p className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4" />
                                {schedule.frequency}
                              </p>
                              <p className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Next run: {schedule.nextRun}
                              </p>
                              <p className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {schedule.recipients.length} recipient(s)
                              </p>
                              <p className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Format: {schedule.format.toUpperCase()}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-3">
                              {schedule.recipients.map((email, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {email}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleSchedule(schedule.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              schedule.enabled ? 'bg-green-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                schedule.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <Button size="sm" variant="ghost">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/90 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Report Types Distribution</CardTitle>
                <CardDescription>Most generated report types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Revenue Reports', count: 45, percentage: 35, color: 'blue' },
                    { type: 'Tenant Reports', count: 32, percentage: 25, color: 'green' },
                    { type: 'Activity Reports', count: 28, percentage: 22, color: 'purple' },
                    { type: 'Payment Reports', count: 23, percentage: 18, color: 'orange' }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{item.type}</span>
                        <span className="text-sm text-gray-600">{item.count} reports</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-${item.color}-600 h-2 rounded-full`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Generation Trends</CardTitle>
                <CardDescription>Reports generated over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { month: 'November', count: 23, trend: 'up', change: 12 },
                    { month: 'October', count: 19, trend: 'up', change: 8 },
                    { month: 'September', count: 17, trend: 'down', change: 5 },
                    { month: 'August', count: 21, trend: 'up', change: 15 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{item.month}</p>
                          <p className="text-sm text-gray-600">{item.count} reports</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.trend === 'up' ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">{item.change}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Most accessed and downloaded reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Monthly Revenue Report', downloads: 156, views: 342 },
                  { name: 'Tenant Activity Summary', downloads: 134, views: 289 },
                  { name: 'Payment Analytics', downloads: 98, views: 234 },
                  { name: 'User Engagement Report', downloads: 87, views: 198 },
                  { name: 'System Health Check', downloads: 76, views: 167 }
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{report.name}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {report.downloads} downloads
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {report.views} views
                          </span>
                        </div>
                      </div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Report Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>
              Create a custom report with specific parameters
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Report Name</Label>
                <Input
                  value={reportForm.name}
                  onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
                  placeholder="e.g., Q4 Revenue Report"
                />
              </div>
              <div className="space-y-2">
                <Label>Report Type</Label>
                <select
                  value={reportForm.type}
                  onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="revenue">Revenue Report</option>
                  <option value="tenants">Tenant Report</option>
                  <option value="activity">Activity Report</option>
                  <option value="payments">Payment Report</option>
                  <option value="subscriptions">Subscription Report</option>
                  <option value="engagement">Engagement Report</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <select
                value={reportForm.period}
                onChange={(e) => setReportForm({ ...reportForm, period: e.target.value })}
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="thismonth">This Month</option>
                <option value="lastmonth">Last Month</option>
                <option value="thisquarter">This Quarter</option>
                <option value="lastquarter">Last Quarter</option>
                <option value="thisyear">This Year</option>
                <option value="lastyear">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {reportForm.period === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Input
                    type="date"
                    value={reportForm.startDate}
                    onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input
                    type="date"
                    value={reportForm.endDate}
                    onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Format</Label>
              <div className="grid grid-cols-3 gap-3">
                {['pdf', 'xlsx', 'csv'].map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => setReportForm({ ...reportForm, format })}
                    className={`p-3 border-2 rounded-lg text-center font-medium transition-all ${
                      reportForm.format === format
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} disabled={isGenerating} className="flex-1">
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Report Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Report</DialogTitle>
            <DialogDescription>
              Set up automated report generation and delivery
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Schedule Name</Label>
                <Input
                  value={scheduleForm.name}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                  placeholder="e.g., Weekly Revenue Report"
                />
              </div>
              <div className="space-y-2">
                <Label>Report Type</Label>
                <select
                  value={scheduleForm.type}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="revenue">Revenue Report</option>
                  <option value="tenants">Tenant Report</option>
                  <option value="activity">Activity Report</option>
                  <option value="payments">Payment Report</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <select
                  value={scheduleForm.frequency}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, frequency: e.target.value })}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Recipients (comma-separated emails)</Label>
              <Input
                value={scheduleForm.recipients}
                onChange={(e) => setScheduleForm({ ...scheduleForm, recipients: e.target.value })}
                placeholder="admin@example.com, finance@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Report Format</Label>
              <div className="flex gap-4">
                {['pdf', 'xlsx', 'csv'].map((format) => (
                  <label key={format} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="scheduleFormat"
                      value={format}
                      checked={scheduleForm.format === format}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, format: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">{format.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={scheduleForm.enabled}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-blue-900">Enable schedule immediately</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleScheduleReport} disabled={isGenerating} className="flex-1">
              {isGenerating ? 'Scheduling...' : 'Schedule Report'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedReport?.name}</DialogTitle>
            <DialogDescription>
              Report preview - {selectedReport?.period}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Report preview would be displayed here</p>
              <p className="text-sm text-gray-500">Format: {selectedReport?.format.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)} className="flex-1">
              Close
            </Button>
            <Button onClick={() => selectedReport && handleDownloadReport(selectedReport)} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
