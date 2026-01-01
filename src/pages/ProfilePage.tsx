import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import StatsCard from '@/components/StatsCard'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Shield,
  Bell,
  Activity,
  Settings,
  Camera,
  Save,
  Eye,
  EyeOff,
  Key,
  Clock,
  Calendar,
  CheckCircle,
  Globe,
  Smartphone,
  Laptop,
  LogOut,
  Trash2,
  Download
} from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('personal')
  const [isSaving, setIsSaving] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showSessionsDialog, setShowSessionsDialog] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string | null>(localStorage.getItem('profilePicture'))
  const [uploadingPicture, setUploadingPicture] = useState(false)

  // Profile Information
  const [profileInfo, setProfileInfo] = useState({
    name: user?.full_name || "Super Admin",
    email: user?.email || "admin@example.com",
    phone: "+966 50 123 4567",
    location: "Riyadh, Saudi Arabia",
    timezone: "Asia/Riyadh",
    language: "English",
    bio: "System Administrator with full access to manage the platform.",
    department: "IT Operations",
    title: "Chief Technology Officer",
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    biometricEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,
    suspiciousActivityAlerts: true,
    backupCodesGenerated: true
  })

  // Password Change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Notification Preferences
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    systemAlerts: true,
    securityAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
    newTenantSignup: true,
    paymentReceived: true,
    supportTickets: true
  })

  // Active Sessions
  const [activeSessions] = useState([
    {
      id: 1,
      device: 'Windows Desktop',
      browser: 'Chrome 120',
      location: 'Riyadh, SA',
      ip: '192.168.1.100',
      lastActive: '2 minutes ago',
      current: true
    },
    {
      id: 2,
      device: 'iPhone 15 Pro',
      browser: 'Safari Mobile',
      location: 'Jeddah, SA',
      ip: '192.168.1.105',
      lastActive: '1 hour ago',
      current: false
    },
    {
      id: 3,
      device: 'MacBook Pro',
      browser: 'Chrome 120',
      location: 'Dammam, SA',
      ip: '192.168.1.110',
      lastActive: '3 days ago',
      current: false
    }
  ])

  // Recent Activity
  const [recentActivity] = useState([
    { action: 'Updated system settings', time: '5 minutes ago', icon: Settings, color: 'blue' },
    { action: 'Created new tenant: TechCorp', time: '1 hour ago', icon: User, color: 'green' },
    { action: 'Modified subscription plan', time: '3 hours ago', icon: Activity, color: 'purple' },
    { action: 'Resolved support ticket #456', time: '5 hours ago', icon: CheckCircle, color: 'green' },
    { action: 'Reviewed security logs', time: '1 day ago', icon: Shield, color: 'red' },
    { action: 'Generated monthly report', time: '2 days ago', icon: Download, color: 'blue' }
  ])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Password changed successfully')
      setShowPasswordDialog(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle2FA = () => {
    setSecuritySettings({ ...securitySettings, twoFactorEnabled: !securitySettings.twoFactorEnabled })
    toast.success(`Two-factor authentication ${!securitySettings.twoFactorEnabled ? 'enabled' : 'disabled'}`)
  }

  const handleTerminateSession = (_sessionId: number) => {
    toast.success('Session terminated successfully')
  }

  const handleExportData = () => {
    toast.info('Exporting your data...')
    setTimeout(() => {
      toast.success('Data export complete!')
    }, 2000)
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setUploadingPicture(true)

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setProfilePicture(base64String)
      localStorage.setItem('profilePicture', base64String)
      setUploadingPicture(false)
      toast.success('Profile picture updated successfully')
    }
    reader.onerror = () => {
      setUploadingPicture(false)
      toast.error('Failed to upload image')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null)
    localStorage.removeItem('profilePicture')
    toast.success('Profile picture removed')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>
        <Button onClick={handleExportData} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center border-4 border-white/30 overflow-hidden">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <input
                type="file"
                id="profile-picture-upload"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureChange}
                disabled={uploadingPicture}
              />
              <label
                htmlFor="profile-picture-upload"
                className="absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {uploadingPicture ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </label>
              {profilePicture && (
                <button
                  onClick={handleRemoveProfilePicture}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove picture"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profileInfo.name}</h2>
              <p className="text-blue-100 text-sm mt-1">{profileInfo.title}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4" />
                  {profileInfo.email}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  {profileInfo.location}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge className="bg-green-500 hover:bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
                {securitySettings.twoFactorEnabled && (
                  <Badge className="bg-blue-500 hover:bg-blue-600">
                    <Shield className="w-3 h-3 mr-1" />
                    2FA Enabled
                  </Badge>
                )}
                <Badge className="bg-purple-500 hover:bg-purple-600">
                  <Key className="w-3 h-3 mr-1" />
                  Super Admin
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Active Sessions"
          value={activeSessions.length.toString()}
          icon={Laptop}
          trend={{ value: 0, isPositive: true }}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="Account Age"
          value="2 Years"
          icon={Calendar}
          trend={{ value: 0, isPositive: true }}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <StatsCard
          title="Last Login"
          value="2m ago"
          icon={Clock}
          trend={{ value: 0, isPositive: true }}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Security Score"
          value="98%"
          icon={Shield}
          trend={{ value: 5, isPositive: true }}
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
      </div>

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Card className="bg-white/90 backdrop-blur-xl shadow-lg mb-6">
          <CardContent className="p-0">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto gap-0 p-0 bg-transparent border-b border-gray-200 rounded-none">
              <TabsTrigger 
                value="personal"
                className="flex-shrink-0 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 hover:bg-gray-50 px-6 py-4 rounded-none border-b-2 border-transparent transition-all"
              >
                <User className="w-5 h-5 mr-2" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger 
                value="security"
                className="flex-shrink-0 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 hover:bg-gray-50 px-6 py-4 rounded-none border-b-2 border-transparent transition-all"
              >
                <Shield className="w-5 h-5 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="notifications"
                className="flex-shrink-0 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 hover:bg-gray-50 px-6 py-4 rounded-none border-b-2 border-transparent transition-all"
              >
                <Bell className="w-5 h-5 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="activity"
                className="flex-shrink-0 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 hover:bg-gray-50 px-6 py-4 rounded-none border-b-2 border-transparent transition-all"
              >
                <Activity className="w-5 h-5 mr-2" />
                Activity Log
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-6">
          {/* Profile Picture Upload */}
          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Upload a professional photo for your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-gray-200 overflow-hidden">
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  {profilePicture && (
                    <button
                      onClick={handleRemoveProfilePicture}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove picture"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Change Profile Picture</h4>
                    <p className="text-sm text-gray-600">Upload a new profile picture. JPG, PNG or GIF (max 5MB)</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <label htmlFor="profile-picture-upload-main" className="flex-1 sm:flex-none">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingPicture}
                        className="w-full cursor-pointer"
                        onClick={() => document.getElementById('profile-picture-upload-main')?.click()}
                      >
                        {uploadingPicture ? (
                          <>
                            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 mr-2" />
                            Upload New Picture
                          </>
                        )}
                      </Button>
                    </label>
                    <input
                      type="file"
                      id="profile-picture-upload-main"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePictureChange}
                      disabled={uploadingPicture}
                    />
                    {profilePicture && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleRemoveProfilePicture}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={profileInfo.name}
                    onChange={(e) => setProfileInfo({ ...profileInfo, name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input
                    value={profileInfo.title}
                    onChange={(e) => setProfileInfo({ ...profileInfo, title: e.target.value })}
                    placeholder="Enter your title"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      value={profileInfo.email}
                      onChange={(e) => setProfileInfo({ ...profileInfo, email: e.target.value })}
                      className="pl-10"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      value={profileInfo.phone}
                      onChange={(e) => setProfileInfo({ ...profileInfo, phone: e.target.value })}
                      className="pl-10"
                      placeholder="+966 50 123 4567"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      value={profileInfo.location}
                      onChange={(e) => setProfileInfo({ ...profileInfo, location: e.target.value })}
                      className="pl-10"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    value={profileInfo.department}
                    onChange={(e) => setProfileInfo({ ...profileInfo, department: e.target.value })}
                    placeholder="IT Operations"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <select
                    value={profileInfo.timezone}
                    onChange={(e) => setProfileInfo({ ...profileInfo, timezone: e.target.value })}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
                    <option value="America/New_York">America/New_York (GMT-5)</option>
                    <option value="Europe/London">Europe/London (GMT+0)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <select
                    value={profileInfo.language}
                    onChange={(e) => setProfileInfo({ ...profileInfo, language: e.target.value })}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Arabic">Arabic</option>
                    <option value="French">French</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <textarea
                  value={profileInfo.bio}
                  onChange={(e) => setProfileInfo({ ...profileInfo, bio: e.target.value })}
                  className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Password & Authentication</CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Change Password</p>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                </div>
                <Button onClick={() => setShowPasswordDialog(true)} variant="outline">
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                  </div>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    securitySettings.twoFactorEnabled ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securitySettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Biometric Authentication</p>
                    <p className="text-sm text-gray-600">Use fingerprint or face recognition</p>
                  </div>
                </div>
                <button
                  onClick={() => setSecuritySettings({ ...securitySettings, biometricEnabled: !securitySettings.biometricEnabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    securitySettings.biometricEnabled ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securitySettings.biometricEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Laptop className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Active Sessions</p>
                    <p className="text-sm text-gray-600">Manage devices and sessions</p>
                  </div>
                </div>
                <Button onClick={() => setShowSessionsDialog(true)} variant="outline">
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Security Preferences</CardTitle>
              <CardDescription>Configure security alerts and monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <Label className="text-base font-medium">Login Notifications</Label>
                  <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                </div>
                <button
                  onClick={() => setSecuritySettings({ ...securitySettings, loginNotifications: !securitySettings.loginNotifications })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    securitySettings.loginNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securitySettings.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <Label className="text-base font-medium">Suspicious Activity Alerts</Label>
                  <p className="text-sm text-gray-600">Get alerts for unusual activities</p>
                </div>
                <button
                  onClick={() => setSecuritySettings({ ...securitySettings, suspiciousActivityAlerts: !securitySettings.suspiciousActivityAlerts })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    securitySettings.suspiciousActivityAlerts ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securitySettings.suspiciousActivityAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Input
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                  min="5"
                  max="120"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {Object.entries(notificationSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                    <div>
                      <Label className="text-base font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <p className="text-sm text-gray-600">
                        Receive {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => setNotificationSettings({ ...notificationSettings, [key]: !value })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const IconComponent = activity.icon
                  return (
                    <div key={index} className="flex items-start gap-4 py-3 border-b border-gray-200 last:border-0">
                      <div className={`w-10 h-10 rounded-full bg-${activity.color}-100 flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className={`w-5 h-5 text-${activity.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="relative">
                <Input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="pr-10"
                />
                <button
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <button
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="pr-10"
                />
                <button
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={isSaving} className="flex-1">
              {isSaving ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Sessions Dialog */}
      <Dialog open={showSessionsDialog} onOpenChange={setShowSessionsDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Active Sessions</DialogTitle>
            <DialogDescription>
              Manage all devices where you're currently logged in
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {activeSessions.map((session) => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      {session.device.includes('iPhone') || session.device.includes('Mobile') ? (
                        <Smartphone className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Laptop className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{session.device}</h4>
                        {session.current && (
                          <Badge className="bg-green-500 text-white text-xs">Current</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{session.browser}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {session.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {session.ip}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.lastActive}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      Terminate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowSessionsDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
