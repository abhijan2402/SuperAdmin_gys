import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useLicense } from '@/hooks/useLicense'
import { Copy, Download, Key, Server, CheckCircle, XCircle, Loader2, FileText, Calendar, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { Tenant } from '@/types/tenant'

interface LicenseManagementDialogProps {
  open: boolean
  onClose: () => void
  tenant: Tenant
}

export default function LicenseManagementDialog({ open, onClose, tenant }: LicenseManagementDialogProps) {
  const { generateInstallationPackage, downloadPackage, validateLicense, isDownloading } = useLicense()
  const [showInstructions, setShowInstructions] = useState(false)
  const [installationPackage, setInstallationPackage] = useState<any>(null)

  const handleCopyLicenseKey = () => {
    if (tenant.licenseKey) {
      navigator.clipboard.writeText(tenant.licenseKey)
      toast.success('License key copied to clipboard')
    }
  }

  const handleCopyInstanceUrl = () => {
    if (tenant.instanceUrl) {
      navigator.clipboard.writeText(tenant.instanceUrl)
      toast.success('Instance URL copied to clipboard')
    }
  }

  const handleGeneratePackage = async () => {
    try {
      const pkg = await generateInstallationPackage(
        tenant.id,
        tenant.licenseKey || '',
        tenant.companyName,
        tenant.planName,
        tenant.contactEmail
      )
      setInstallationPackage(pkg)
      setShowInstructions(true)
      toast.success('Installation package generated successfully')
    } catch (error) {
      toast.error('Failed to generate installation package')
    }
  }

  const handleDownload = () => {
    if (installationPackage) {
      downloadPackage(installationPackage.packageUrl, `vtp-${tenant.id}-installation.zip`)
      toast.success('Download started')
    }
  }

  const handleValidateLicense = async () => {
    if (!tenant.licenseKey) return
    
    try {
      const result = await validateLicense(tenant.licenseKey)
      if (result.valid) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to validate license')
    }
  }

  const getServerStatusIcon = () => {
    switch (tenant.serverStatus) {
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Server className="w-5 h-5 text-gray-400" />
    }
  }

  const getServerStatusBadge = () => {
    switch (tenant.serverStatus) {
      case 'online':
        return <Badge className="bg-green-100 text-green-700">Online</Badge>
      case 'offline':
        return <Badge className="bg-red-100 text-red-700">Offline</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            License Management - {tenant.companyName}
          </DialogTitle>
          <DialogDescription>
            Manage self-hosted installation and license details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* License Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                License Information
              </h3>
              
              <div className="space-y-4">
                {/* License Key */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">License Key</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={tenant.licenseKey || 'Not generated'}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLicenseKey}
                      disabled={!tenant.licenseKey}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleValidateLicense}
                      disabled={!tenant.licenseKey}
                    >
                      Validate
                    </Button>
                  </div>
                </div>

                {/* Subscription Period */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Issued Date</Label>
                    <div className="flex items-center gap-2 mt-1 p-2 bg-gray-50 rounded">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{formatDate(tenant.subscriptionStart)}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Expiry Date</Label>
                    <div className="flex items-center gap-2 mt-1 p-2 bg-gray-50 rounded">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{formatDate(tenant.subscriptionEnd)}</span>
                    </div>
                  </div>
                </div>

                {/* Plan & Features */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Plan</Label>
                  <div className="mt-1">
                    <Badge className="bg-purple-100 text-purple-700">{tenant.planName}</Badge>
                    <span className="text-sm text-gray-600 ml-2">
                      Max {tenant.totalUsers} users
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Server Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Server className="w-5 h-5" />
                Server Information
              </h3>

              <div className="space-y-4">
                {/* Instance URL */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">Instance URL</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={tenant.instanceUrl || 'Not configured'}
                      readOnly
                      className="text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyInstanceUrl}
                      disabled={!tenant.instanceUrl}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Server Status */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Server Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getServerStatusIcon()}
                      {getServerStatusBadge()}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Server IP</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded text-sm font-mono">
                      {tenant.serverIp || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Database</Label>
                    <div className="mt-1">
                      <Badge variant="outline">{tenant.databaseType?.toUpperCase() || 'N/A'}</Badge>
                    </div>
                  </div>
                </div>

                {/* Last Heartbeat */}
                {tenant.lastHeartbeat && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Last Heartbeat</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                      {formatDate(tenant.lastHeartbeat)} at {new Date(tenant.lastHeartbeat).toLocaleTimeString()}
                    </div>
                  </div>
                )}

                {/* Installation Date */}
                {tenant.installationDate && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Installation Date</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                      {formatDate(tenant.installationDate)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Installation Package */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Installation Package
              </h3>

              {!showInstructions ? (
                <Button 
                  onClick={handleGeneratePackage}
                  disabled={isDownloading}
                  className="w-full"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Generating Package...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 w-4 h-4" />
                      Generate Installation Package
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Package Ready</h4>
                    <p className="text-sm text-blue-700">
                      Installation package has been generated. Download and send to the client.
                    </p>
                  </div>

                  {installationPackage && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Package Size</Label>
                          <p className="text-sm font-medium">{installationPackage.packageSize}</p>
                        </div>
                        <div>
                          <Label className="text-sm">Version</Label>
                          <p className="text-sm font-medium">v{installationPackage.version}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm">Admin Credentials</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded text-sm space-y-1">
                          <div><strong>Email:</strong> {installationPackage.credentials.adminEmail}</div>
                          <div><strong>Password:</strong> {installationPackage.credentials.temporaryPassword}</div>
                        </div>
                        <p className="text-xs text-orange-600 mt-1">⚠️ These credentials are temporary. Client must change on first login.</p>
                      </div>

                      <Button onClick={handleDownload} className="w-full">
                        <Download className="mr-2 w-4 h-4" />
                        Download Installation Package
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
