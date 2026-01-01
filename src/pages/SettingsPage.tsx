import { useSettings } from "@/hooks/useSettings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StatsCard from "@/components/StatsCard";
import {
  Bell,
  Settings as SettingsIcon,
  Shield,
  Mail,
  MessageSquare,
  CreditCard,
  MapPin,
  Webhook,
  Key,
  CheckCircle,
  Save,
  Eye,
  EyeOff,
  Send,
  Sparkles,
  Plus,
  Copy,
  Trash2,
  AlertCircle,
  Code,
  Cpu,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useCreateWebHookMutation,
  useGenerateApiKeyMutation,
  useGetApiKeyListQuery,
  useGetOverviewSettingsQuery,
  useGetSettingsQuery,
  useGetWebHookListQuery,
} from "@/redux/api/settingsApi";
import { formatDate, getPermissionLabel } from "@/lib/utils";

export default function SettingsPage() {
  const {
    settings,
    isLoading,
    updateNotificationSettings,
    updateSystemSettings,
  } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState("general");
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Dialog states
  const [showGenerateKeyDialog, setShowGenerateKeyDialog] = useState(false);
  const [showAddWebhookDialog, setShowAddWebhookDialog] = useState(false);

  // API Key form
  const [newApiKeyForm, setNewApiKeyForm] = useState({
    name: "",
    prefix: "",
    expires_in_days: "",
    description: "",
    permissions: { read: true, write: false, delete: false },
  });

  // Webhook form
  const [newWebhookForm, setNewWebhookForm] = useState({
    url: "",
    events: [] as string[],
    secret: "",
  });

  // Mock API keys list
  const [apiKeys, setApiKeys] = useState([
    {
      id: "1",
      name: "Production API Key",
      key: "pk_live_...abc123",
      created: "2024-01-15",
      permissions: "Full Access",
    },
    {
      id: "2",
      name: "Development API Key",
      key: "pk_test_...xyz789",
      created: "2024-01-10",
      permissions: "Read Only",
    },
    {
      id: "3",
      name: "Mobile App Key",
      key: "pk_mobile_...def456",
      created: "2024-01-05",
      permissions: "Limited",
    },
  ]);

  // Mock webhooks list
  const [webhooks, setWebhooks] = useState([
    {
      id: "1",
      url: "https://api.example.com/webhooks/tenant-created",
      events: ["tenant.created", "tenant.updated"],
      status: "active",
    },
    {
      id: "2",
      url: "https://api.example.com/webhooks/payments",
      events: ["payment.success", "payment.failed"],
      status: "active",
    },
  ]);

  // Service configurations
  const [emailConfig, setEmailConfig] = useState({
    provider: "smtp",
    host: "smtp.example.com",
    port: "587",
    username: "",
    password: "",
    fromEmail: "noreply@yourdomain.com",
    fromName: "Visit Tracking Pro",
    enabled: true,
  });

  const [smsConfig, setSmsConfig] = useState({
    provider: "twilio",
    accountSid: "",
    authToken: "",
    fromNumber: "",
    enabled: false,
  });

  const [paymentConfig, setPaymentConfig] = useState({
    provider: "stripe",
    publishableKey: "",
    secretKey: "",
    webhookSecret: "",
    clientId: "",
    clientSecret: "",
    currency: "sar",
    testMode: true,
    enabled: true,
  });

  const [mapsConfig, setMapsConfig] = useState({
    provider: "google",
    apiKey: "",
    defaultZoom: 12,
    defaultCenter: "40.7128, -74.0060",
    enabled: true,
  });

  const [aiConfig, setAiConfig] = useState({
    provider: "openai",
    apiKey: "",
    model: "gpt-4",
    maxTokens: 2000,
    temperature: 0.7,
    enabled: false,
  });

  const [webhookConfig, setWebhookConfig] = useState({
    enabled: true,
    secret: "",
    maxRetries: 3,
    timeout: 30,
  });

  // Handlers

  // API KEY -- APIS
  const { data: ApiKeyList } = useGetApiKeyListQuery({});
  const [generateApiKey, { isLoading: isGenerating }] =
    useGenerateApiKeyMutation();

  // WEBHOOK -- APIS

  const { data: WebhookList } = useGetWebHookListQuery({});
  const [createWebHook, { isLoading: isWebhookCreating }] =
    useCreateWebHookMutation();

  const handleSaveConfig = async (configName: string) => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(`${configName.toUpperCase()} settings saved successfully`);
    } catch (error) {
      toast.error(`Failed to save ${configName} settings`);
    } finally {
      setIsSaving(false);
    }
  };

  
  // OTHER SERVICES APIS

  const { data:statsOverview } = useGetOverviewSettingsQuery({});

  const { data: OtherServices } = useGetSettingsQuery({});
  console.log(OtherServices);

  // Add this useEffect after your state declarations
  useEffect(() => {
    if (OtherServices?.success && OtherServices.data) {
      const { ai_services, maps, sms, payments } =
        OtherServices.data;

      // AI Config
      setAiConfig({
        provider:
          ai_services.find((s: any) => s.setting_key === "ai_provider")
            ?.setting_value || "openai",
        apiKey:
          ai_services.find((s: any) => s.setting_key === "openai_api_key")
            ?.setting_value || "",
        model:
          ai_services.find((s: any) => s.setting_key === "ai_model")
            ?.setting_value || "gpt-4",
        maxTokens: parseInt(
          ai_services.find((s: any) => s.setting_key === "max_tokens")
            ?.setting_value || "2000"
        ),
        temperature: parseFloat(
          ai_services.find((s: any) => s.setting_key === "temperature")
            ?.setting_value || "0.7"
        ),
        enabled:
          ai_services.find((s: any) => s.setting_key === "enable_ai_services")
            ?.setting_value === "true",
      });

      // Maps Config
      setMapsConfig({
        provider:
          maps.find((s: any) => s.setting_key === "maps_provider")
            ?.setting_value || "google_maps",
        apiKey:
          maps.find((s: any) => s.setting_key === "maps_api_key")
            ?.setting_value || "",
        defaultZoom: parseInt(
          maps.find((s: any) => s.setting_key === "default_zoom_level")
            ?.setting_value || "12"
        ),
        defaultCenter: `${
          maps.find((s: any) => s.setting_key === "default_center_lat")
            ?.setting_value || "40.7128"
        }, ${
          maps.find((s: any) => s.setting_key === "default_center_lng")
            ?.setting_value || "-74.0060"
        }`,
        enabled:
          maps.find((s: any) => s.setting_key === "enable_maps_service")
            ?.setting_value === "true",
      });

      // SMS Config
      setSmsConfig({
        provider:
          sms.find((s: any) => s.setting_key === "sms_provider")
            ?.setting_value || "twilio",
        accountSid:
          sms.find((s: any) => s.setting_key === "account_sid")
            ?.setting_value || "",
        authToken:
          sms.find((s: any) => s.setting_key === "auth_token")?.setting_value ||
          "",
        fromNumber:
          sms.find((s: any) => s.setting_key === "from_phone_number")
            ?.setting_value || "",
        enabled:
          sms.find((s: any) => s.setting_key === "enable_sms_service")
            ?.setting_value === "true",
      });

      // Payment Config
      setPaymentConfig({
        provider:
          payments.find((s: any) => s.setting_key === "payment_provider")
            ?.setting_value || "stripe",
        publishableKey:
          payments.find((s: any) => s.setting_key === "stripe_publishable_key")
            ?.setting_value || "",
        secretKey:
          payments.find((s: any) => s.setting_key === "stripe_secret_key")
            ?.setting_value || "",
        webhookSecret:
          payments.find((s: any) => s.setting_key === "stripe_webhook_secret")
            ?.setting_value || "",
        clientId: "", // No matching field in API
        clientSecret: "", // No matching field in API
        currency:
          payments
            .find((s: any) => s.setting_key === "default_currency")
            ?.setting_value?.toLowerCase() || "sar",
        testMode:
          payments.find((s: any) => s.setting_key === "test_mode")
            ?.setting_value === "true",
        enabled:
          payments.find((s: any) => s.setting_key === "enable_payments")
            ?.setting_value === "true",
      });
    }
  }, [OtherServices]);

  const toggleApiKeyVisibility = (key: string) => {
    setShowApiKey((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestConnection = async (service: string) => {
    toast.info(`Testing ${service} connection...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(`${service} connection successful!`);
  };

  const handleGenerateApiKey = async () => {
    if (!newApiKeyForm.name.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    const payload = {
      key_name: newApiKeyForm.name,
      permissions: [
        newApiKeyForm.permissions.read ? "read_access" : "",
        newApiKeyForm.permissions.write ? "write_access" : "",
        newApiKeyForm.permissions.delete ? "delete_access" : "",
      ].filter(Boolean),
      prefix: newApiKeyForm.prefix || "pk_api_key",
      expires_in_days: parseInt(newApiKeyForm.expires_in_days) || 0,
      description: newApiKeyForm.description || "",
    };

    await generateApiKey(payload).unwrap();
    console.log(newApiKeyForm);

    toast.success("API key generated successfully");
    setShowGenerateKeyDialog(false);
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const handleRevokeApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
    toast.error("API key revoked");
  };

  const handleAddWebhook = async () => {
    if (!newWebhookForm.url.trim()) {
      toast.error("Please enter a webhook URL");
      return;
    }

    if (newWebhookForm.events.length === 0) {
      toast.error("Please select at least one event");
      return;
    }

    const payload = {
      url: newWebhookForm.url,
      events: newWebhookForm.events,
      description: newWebhookForm.secret,
    };

    await createWebHook(payload).unwrap();
    setShowAddWebhookDialog(false);
    setNewWebhookForm({ url: "", events: [], secret: "" });
    toast.success("Webhook added successfully");
  };

  const handleRemoveWebhook = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
    toast.error("Webhook removed");
  };

  const handleTestWebhook = async (url: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Test webhook sent to ${url}`);
    } catch (error) {
      toast.error(`Failed to send test webhook to ${url}`);
    }
  };

  const toggleWebhookEvent = (event: string) => {
    setNewWebhookForm((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  const handleNotificationToggle = (
    key: keyof typeof settings.notifications
  ) => {
    const newValue = !localSettings.notifications[key];
    setLocalSettings({
      ...localSettings,
      notifications: {
        ...localSettings.notifications,
        [key]: newValue,
      },
    });
    updateNotificationSettings({ [key]: newValue });
  };

  const handleSystemToggle = (key: keyof typeof settings.system) => {
    const newValue =
      typeof settings.system[key] === "boolean"
        ? !localSettings.system[key]
        : localSettings.system[key];
    setLocalSettings({
      ...localSettings,
      system: {
        ...localSettings.system,
        [key]: newValue,
      },
    });
    updateSystemSettings({ [key]: newValue });
  };

  const handleSystemValueChange = (
    key: keyof typeof settings.system,
    value: number
  ) => {
    setLocalSettings({
      ...localSettings,
      system: {
        ...localSettings.system,
        [key]: value,
      },
    });
  };

  const handleSystemValueSave = (key: keyof typeof settings.system) => {
    updateSystemSettings({ [key]: localSettings.system[key] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          System Settings
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Configure integrations, services, and system preferences
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatsCard
          title="Active Services"
          value={statsOverview?.data?.active_services?.count?.toString() || "0"}
          icon={CheckCircle}
          trend={{ value: 0, isPositive: true }}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="API Integrations"
          value={
            statsOverview?.data?.api_integrations?.count?.toString() || "0"
          }
          icon={Code}
          trend={{ value: 0, isPositive: true }}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="Webhooks"
          value={statsOverview?.data?.webhooks?.count?.toString() || "0"}
          icon={Webhook}
          trend={{ value: 0, isPositive: true }}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <StatsCard
          title="Security Status"
          value={statsOverview?.data?.security_status || "Secure"}
          icon={Shield}
          trend={{ value: 0, isPositive: true }}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
      </div>

      {/* Enhanced Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Card className="bg-white/90 backdrop-blur-xl shadow-lg mb-6">
          <CardContent className="p-0">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap lg:flex-wrap h-auto gap-0 p-0 bg-transparent border-b border-gray-200 rounded-none">
              <TabsTrigger
                value="general"
                className="flex-shrink-0 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 hover:bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 rounded-none border-b-2 border-transparent transition-all"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-xs sm:text-sm">
                    General
                  </span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="email"
                className="flex-shrink-0 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 hover:bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 rounded-none border-b-2 border-transparent transition-all"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-xs sm:text-sm">Email</span>
                  {emailConfig.enabled && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span>
                  )}
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="sms"
                className="flex-shrink-0 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 hover:bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 rounded-none border-b-2 border-transparent transition-all"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-xs sm:text-sm">SMS</span>
                  {smsConfig.enabled && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span>
                  )}
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="payment"
                className="flex-shrink-0 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 hover:bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 rounded-none border-b-2 border-transparent transition-all"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-xs sm:text-sm">
                    Payments
                  </span>
                  {paymentConfig.enabled && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span>
                  )}
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="maps"
                className="flex-shrink-0 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 hover:bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 rounded-none border-b-2 border-transparent transition-all"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-xs sm:text-sm">Maps</span>
                  {mapsConfig.enabled && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span>
                  )}
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="ai"
                className="flex-shrink-0 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 hover:bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 rounded-none border-b-2 border-transparent transition-all"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-xs sm:text-sm">
                    AI Services
                  </span>
                  {aiConfig.enabled && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span>
                  )}
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="api"
                className="flex-shrink-0 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 hover:bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 rounded-none border-b-2 border-transparent transition-all"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Code className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-xs sm:text-sm">
                    API Keys
                  </span>
                  <span className="px-1.5 sm:px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    {apiKeys.length}
                  </span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="webhooks"
                className="flex-shrink-0 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 hover:bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 rounded-none border-b-2 border-transparent transition-all"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Webhook className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium text-xs sm:text-sm">
                    Webhooks
                  </span>
                  {webhookConfig.enabled && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span>
                  )}
                </div>
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          {/* Notification Settings */}
          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-6 h-6 text-blue-600" />
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage email notifications and alerts
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
                >
                  <div>
                    <Label className="text-base font-medium text-gray-900">
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </Label>
                    <p className="text-sm text-gray-600">
                      Receive notifications for{" "}
                      {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleNotificationToggle(
                        key as keyof typeof settings.notifications
                      )
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-6 h-6 text-purple-600" />
                <div>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>
                    Configure system-wide preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <Label className="text-base font-medium text-gray-900">
                      Maintenance Mode
                    </Label>
                    <p className="text-sm text-gray-600">
                      Put system in maintenance mode
                    </p>
                  </div>
                  <button
                    onClick={() => handleSystemToggle("maintenanceMode")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.system.maintenanceMode
                        ? "bg-red-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.system.maintenanceMode
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <Label className="text-base font-medium text-gray-900">
                      Allow Signups
                    </Label>
                    <p className="text-sm text-gray-600">
                      Allow new tenant registrations
                    </p>
                  </div>
                  <button
                    onClick={() => handleSystemToggle("allowSignups")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.system.allowSignups
                        ? "bg-blue-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.system.allowSignups
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <Label className="text-base font-medium text-gray-900">
                      Email Verification
                    </Label>
                    <p className="text-sm text-gray-600">
                      Require email verification for new accounts
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleSystemToggle("requireEmailVerification")
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.system.requireEmailVerification
                        ? "bg-blue-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.system.requireEmailVerification
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Trial Days</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={localSettings.system.defaultTrialDays}
                      onChange={(e) =>
                        handleSystemValueChange(
                          "defaultTrialDays",
                          parseInt(e.target.value)
                        )
                      }
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleSystemValueSave("defaultTrialDays")}
                    >
                      Save
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={localSettings.system.sessionTimeout}
                      onChange={(e) =>
                        handleSystemValueChange(
                          "sessionTimeout",
                          parseInt(e.target.value)
                        )
                      }
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleSystemValueSave("sessionTimeout")}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Security Notice
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Changes to system settings affect all tenants. Please review
                    changes carefully before saving.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Service Configuration */}
        <TabsContent value="email" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="w-6 h-6 text-blue-600" />
                <div>
                  <CardTitle>Email Service Configuration</CardTitle>
                  <CardDescription>
                    Configure email delivery settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email Provider</Label>
                <select
                  value={emailConfig.provider}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, provider: e.target.value })
                  }
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="smtp">Custom SMTP</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="mailgun">Mailgun</option>
                  <option value="aws-ses">AWS SES</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input
                    value={emailConfig.host}
                    onChange={(e) =>
                      setEmailConfig({ ...emailConfig, host: e.target.value })
                    }
                    placeholder="smtp.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input
                    value={emailConfig.port}
                    onChange={(e) =>
                      setEmailConfig({ ...emailConfig, port: e.target.value })
                    }
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Username / API Key</Label>
                <Input
                  value={emailConfig.username}
                  onChange={(e) =>
                    setEmailConfig({ ...emailConfig, username: e.target.value })
                  }
                  placeholder="your-username"
                />
              </div>

              <div className="space-y-2">
                <Label>Password / API Secret</Label>
                <div className="relative">
                  <Input
                    type={showApiKey.email ? "text" : "password"}
                    value={emailConfig.password}
                    onChange={(e) =>
                      setEmailConfig({
                        ...emailConfig,
                        password: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    onClick={() => toggleApiKeyVisibility("email")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey.email ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input
                    value={emailConfig.fromEmail}
                    onChange={(e) =>
                      setEmailConfig({
                        ...emailConfig,
                        fromEmail: e.target.value,
                      })
                    }
                    placeholder="noreply@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>From Name</Label>
                  <Input
                    value={emailConfig.fromName}
                    onChange={(e) =>
                      setEmailConfig({
                        ...emailConfig,
                        fromName: e.target.value,
                      })
                    }
                    placeholder="Your App Name"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <div>
                  <Label className="text-base font-medium">
                    Enable Email Service
                  </Label>
                  <p className="text-sm text-gray-600">
                    Activate email notifications
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEmailConfig({
                      ...emailConfig,
                      enabled: !emailConfig.enabled,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emailConfig.enabled ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailConfig.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleTestConnection("email")}
                  variant="outline"
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
                <Button
                  onClick={() => handleSaveConfig("email")}
                  disabled={isSaving}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Service Configuration */}
        <TabsContent value="sms" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-green-600" />
                <div>
                  <CardTitle>SMS Service Configuration</CardTitle>
                  <CardDescription>
                    Configure SMS notification settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>SMS Provider</Label>
                <select
                  value={smsConfig.provider}
                  onChange={(e) =>
                    setSmsConfig({ ...smsConfig, provider: e.target.value })
                  }
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="twilio">Twilio</option>
                  <option value="nexmo">Nexmo</option>
                  <option value="aws-sns">AWS SNS</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Account SID / Account ID</Label>
                <Input
                  value={smsConfig.accountSid}
                  onChange={(e) =>
                    setSmsConfig({ ...smsConfig, accountSid: e.target.value })
                  }
                  placeholder="AC..."
                />
              </div>

              <div className="space-y-2">
                <Label>Auth Token / API Key</Label>
                <div className="relative">
                  <Input
                    type={showApiKey.sms ? "text" : "password"}
                    value={smsConfig.authToken}
                    onChange={(e) =>
                      setSmsConfig({ ...smsConfig, authToken: e.target.value })
                    }
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    onClick={() => toggleApiKeyVisibility("sms")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey.sms ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>From Phone Number</Label>
                <Input
                  value={smsConfig.fromNumber}
                  onChange={(e) =>
                    setSmsConfig({ ...smsConfig, fromNumber: e.target.value })
                  }
                  placeholder="+1234567890"
                />
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <div>
                  <Label className="text-base font-medium">
                    Enable SMS Service
                  </Label>
                  <p className="text-sm text-gray-600">
                    Activate SMS notifications
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSmsConfig({ ...smsConfig, enabled: !smsConfig.enabled })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    smsConfig.enabled ? "bg-green-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      smsConfig.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleTestConnection("sms")}
                  variant="outline"
                  className="flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Test SMS
                </Button>
                <Button
                  onClick={() => handleSaveConfig("sms")}
                  disabled={isSaving}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Gateway Configuration */}
        <TabsContent value="payment" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-purple-600" />
                <div>
                  <CardTitle>Payment Gateway Configuration</CardTitle>
                  <CardDescription>
                    Configure payment processing
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Provider</Label>
                <select
                  value={paymentConfig.provider}
                  onChange={(e) =>
                    setPaymentConfig({
                      ...paymentConfig,
                      provider: e.target.value,
                    })
                  }
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="stripe">Stripe</option>
                  <option value="paypal">PayPal</option>
                  <option value="square">Square</option>
                </select>
              </div>

              {paymentConfig.provider === "stripe" && (
                <>
                  <div className="space-y-2">
                    <Label>Stripe Publishable Key</Label>
                    <Input
                      value={paymentConfig.publishableKey}
                      onChange={(e) =>
                        setPaymentConfig({
                          ...paymentConfig,
                          publishableKey: e.target.value,
                        })
                      }
                      placeholder="pk_..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Stripe Secret Key</Label>
                    <div className="relative">
                      <Input
                        type={showApiKey.payment ? "text" : "password"}
                        value={paymentConfig.secretKey}
                        onChange={(e) =>
                          setPaymentConfig({
                            ...paymentConfig,
                            secretKey: e.target.value,
                          })
                        }
                        placeholder="sk_..."
                        className="pr-10"
                      />
                      <button
                        onClick={() => toggleApiKeyVisibility("payment")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showApiKey.payment ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Webhook Secret</Label>
                    <Input
                      value={paymentConfig.webhookSecret}
                      onChange={(e) =>
                        setPaymentConfig({
                          ...paymentConfig,
                          webhookSecret: e.target.value,
                        })
                      }
                      placeholder="whsec_..."
                    />
                  </div>
                </>
              )}

              {paymentConfig.provider === "paypal" && (
                <>
                  <div className="space-y-2">
                    <Label>PayPal Client ID</Label>
                    <Input
                      value={paymentConfig.clientId}
                      onChange={(e) =>
                        setPaymentConfig({
                          ...paymentConfig,
                          clientId: e.target.value,
                        })
                      }
                      placeholder="..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>PayPal Client Secret</Label>
                    <div className="relative">
                      <Input
                        type={showApiKey.payment ? "text" : "password"}
                        value={paymentConfig.clientSecret}
                        onChange={(e) =>
                          setPaymentConfig({
                            ...paymentConfig,
                            clientSecret: e.target.value,
                          })
                        }
                        placeholder="..."
                        className="pr-10"
                      />
                      <button
                        onClick={() => toggleApiKeyVisibility("payment")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showApiKey.payment ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Default Currency</Label>
                <select
                  value={paymentConfig.currency}
                  onChange={(e) =>
                    setPaymentConfig({
                      ...paymentConfig,
                      currency: e.target.value,
                    })
                  }
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="sar">SAR (ر.س)</option>
                  <option value="usd">USD ($)</option>
                  <option value="eur">EUR (€)</option>
                  <option value="gbp">GBP (£)</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <div>
                  <Label className="text-base font-medium">Test Mode</Label>
                  <p className="text-sm text-gray-600">
                    Use test credentials for development
                  </p>
                </div>
                <button
                  onClick={() =>
                    setPaymentConfig({
                      ...paymentConfig,
                      testMode: !paymentConfig.testMode,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    paymentConfig.testMode ? "bg-yellow-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      paymentConfig.testMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <div>
                  <Label className="text-base font-medium">
                    Enable Payments
                  </Label>
                  <p className="text-sm text-gray-600">
                    Activate payment processing
                  </p>
                </div>
                <button
                  onClick={() =>
                    setPaymentConfig({
                      ...paymentConfig,
                      enabled: !paymentConfig.enabled,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    paymentConfig.enabled ? "bg-purple-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      paymentConfig.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleTestConnection("payment")}
                  variant="outline"
                  className="flex-1"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
                <Button
                  onClick={() => handleSaveConfig("payment")}
                  disabled={isSaving}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maps Service Configuration */}
        <TabsContent value="maps" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-red-600" />
                <div>
                  <CardTitle>Maps Service Configuration</CardTitle>
                  <CardDescription>
                    Configure map and location services
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Maps Provider</Label>
                <select
                  value={mapsConfig.provider}
                  onChange={(e) =>
                    setMapsConfig({ ...mapsConfig, provider: e.target.value })
                  }
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="google">Google Maps</option>
                  <option value="mapbox">Mapbox</option>
                  <option value="here">HERE Maps</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="relative">
                  <Input
                    type={showApiKey.maps ? "text" : "password"}
                    value={mapsConfig.apiKey}
                    onChange={(e) =>
                      setMapsConfig({ ...mapsConfig, apiKey: e.target.value })
                    }
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    onClick={() => toggleApiKeyVisibility("maps")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey.maps ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Zoom Level</Label>
                  <Input
                    type="number"
                    value={mapsConfig.defaultZoom}
                    onChange={(e) =>
                      setMapsConfig({
                        ...mapsConfig,
                        defaultZoom: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    max="20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Center (Lat, Lng)</Label>
                  <Input
                    value={mapsConfig.defaultCenter}
                    onChange={(e) =>
                      setMapsConfig({
                        ...mapsConfig,
                        defaultCenter: e.target.value,
                      })
                    }
                    placeholder="40.7128, -74.0060"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <div>
                  <Label className="text-base font-medium">
                    Enable Maps Service
                  </Label>
                  <p className="text-sm text-gray-600">Activate map features</p>
                </div>
                <button
                  onClick={() =>
                    setMapsConfig({
                      ...mapsConfig,
                      enabled: !mapsConfig.enabled,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    mapsConfig.enabled ? "bg-red-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      mapsConfig.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleTestConnection("maps")}
                  variant="outline"
                  className="flex-1"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Test Map Loading
                </Button>
                <Button
                  onClick={() => handleSaveConfig("maps")}
                  disabled={isSaving}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Services Configuration */}
        <TabsContent value="ai" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-600" />
                <div>
                  <CardTitle>AI Services Configuration</CardTitle>
                  <CardDescription>
                    Configure AI and machine learning services
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>AI Provider</Label>
                <select
                  value={aiConfig.provider}
                  onChange={(e) =>
                    setAiConfig({ ...aiConfig, provider: e.target.value })
                  }
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="google">Google AI</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="relative">
                  <Input
                    type={showApiKey.ai ? "text" : "password"}
                    value={aiConfig.apiKey}
                    onChange={(e) =>
                      setAiConfig({ ...aiConfig, apiKey: e.target.value })
                    }
                    placeholder="sk-..."
                    className="pr-10"
                  />
                  <button
                    onClick={() => toggleApiKeyVisibility("ai")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey.ai ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Model</Label>
                <select
                  value={aiConfig.model}
                  onChange={(e) =>
                    setAiConfig({ ...aiConfig, model: e.target.value })
                  }
                  className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {aiConfig.provider === "openai" && (
                    <>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </>
                  )}
                  {aiConfig.provider === "anthropic" && (
                    <>
                      <option value="claude-3-opus">Claude 3 Opus</option>
                      <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    </>
                  )}
                  {aiConfig.provider === "google" && (
                    <>
                      <option value="gemini-pro">Gemini Pro</option>
                      <option value="gemini-pro-vision">
                        Gemini Pro Vision
                      </option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Tokens</Label>
                  <Input
                    type="number"
                    value={aiConfig.maxTokens}
                    onChange={(e) =>
                      setAiConfig({
                        ...aiConfig,
                        maxTokens: parseInt(e.target.value),
                      })
                    }
                    placeholder="2000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Temperature (0-1)</Label>
                  <Input
                    type="number"
                    value={aiConfig.temperature}
                    onChange={(e) =>
                      setAiConfig({
                        ...aiConfig,
                        temperature: parseFloat(e.target.value),
                      })
                    }
                    step="0.1"
                    min="0"
                    max="1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <div>
                  <Label className="text-base font-medium">
                    Enable AI Services
                  </Label>
                  <p className="text-sm text-gray-600">Activate AI features</p>
                </div>
                <button
                  onClick={() =>
                    setAiConfig({ ...aiConfig, enabled: !aiConfig.enabled })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    aiConfig.enabled ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      aiConfig.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleTestConnection("ai")}
                  variant="outline"
                  className="flex-1"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Test API Connection
                </Button>
                <Button
                  onClick={() => handleSaveConfig("ai")}
                  disabled={isSaving}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Management */}
        <TabsContent value="api" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-6 h-6 text-orange-600" />
                  <div>
                    <CardTitle>API Keys Management</CardTitle>
                    <CardDescription>
                      Manage API keys for external integrations
                    </CardDescription>
                  </div>
                </div>
                <Button onClick={() => setShowGenerateKeyDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate New Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ApiKeyList?.data?.map((apiKey: any) => (
                  <div
                    key={apiKey.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Key className="w-4 h-4 text-orange-600" />
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {apiKey.key_name}
                            </h4>
                            <p className="text-sm text-gray-600 font-mono">
                              {apiKey.api_key}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>Created: {formatDate(apiKey.created_at)}</span>
                          <span>•</span>
                          <span>
                            Permissions:
                            {getPermissionLabel(apiKey.permissions)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyApiKey(apiKey.key)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokeApiKey(apiKey.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-orange-900">
                      Security Best Practices
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      Never share your API keys publicly. Rotate keys regularly
                      and use read-only keys when possible.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Configuration */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Webhook className="w-6 h-6 text-teal-600" />
                  <div>
                    <CardTitle>Webhooks Configuration</CardTitle>
                    <CardDescription>
                      Manage webhook endpoints and events
                    </CardDescription>
                  </div>
                </div>
                <Button onClick={() => setShowAddWebhookDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook Secret</Label>
                <div className="relative">
                  <Input
                    type={showApiKey.webhook ? "text" : "password"}
                    value={webhookConfig.secret}
                    onChange={(e) =>
                      setWebhookConfig({
                        ...webhookConfig,
                        secret: e.target.value,
                      })
                    }
                    placeholder="whsec_..."
                    className="pr-10"
                  />
                  <button
                    onClick={() => toggleApiKeyVisibility("webhook")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey.webhook ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Retry Attempts</Label>
                  <Input
                    type="number"
                    value={webhookConfig.maxRetries}
                    onChange={(e) =>
                      setWebhookConfig({
                        ...webhookConfig,
                        maxRetries: parseInt(e.target.value),
                      })
                    }
                    min="0"
                    max="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timeout (seconds)</Label>
                  <Input
                    type="number"
                    value={webhookConfig.timeout}
                    onChange={(e) =>
                      setWebhookConfig({
                        ...webhookConfig,
                        timeout: parseInt(e.target.value),
                      })
                    }
                    min="5"
                    max="60"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <div>
                  <Label className="text-base font-medium">
                    Enable Webhooks
                  </Label>
                  <p className="text-sm text-gray-600">
                    Activate webhook notifications
                  </p>
                </div>
                <button
                  onClick={() =>
                    setWebhookConfig({
                      ...webhookConfig,
                      enabled: !webhookConfig.enabled,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    webhookConfig.enabled ? "bg-teal-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      webhookConfig.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Active Webhooks
                </h4>
                <div className="space-y-3">
                  {WebhookList?.data?.map((webhook: any) => (
                    <div
                      key={webhook.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Webhook className="w-4 h-4 text-teal-600" />
                            <div>
                              <p className="font-mono text-sm text-gray-900">
                                {webhook.url}
                              </p>
                              <div className="flex gap-2 mt-1">
                                {webhook.events.map((event: string, i: any) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {event}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestWebhook(webhook.url)}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveWebhook(webhook.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => handleSaveConfig("webhooks")}
                disabled={isSaving}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Webhook Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate API Key Dialog */}
      <Dialog
        open={showGenerateKeyDialog}
        onOpenChange={setShowGenerateKeyDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate New API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for external integrations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                placeholder="e.g., Mobile App Key"
                value={newApiKeyForm.name}
                onChange={(e) =>
                  setNewApiKeyForm({ ...newApiKeyForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prefix">Add Prefix</Label>
              <Input
                id="prefix"
                placeholder="e.g., pk_mobile"
                value={newApiKeyForm.prefix}
                onChange={(e) =>
                  setNewApiKeyForm({ ...newApiKeyForm, prefix: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expire">Expire in days</Label>
              <Input
                id="expire"
                placeholder="e.g., 10"
                value={newApiKeyForm.expires_in_days}
                onChange={(e) =>
                  setNewApiKeyForm({
                    ...newApiKeyForm,
                    expires_in_days: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., API key for mobile application"
                value={newApiKeyForm.description}
                onChange={(e) =>
                  setNewApiKeyForm({
                    ...newApiKeyForm,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newApiKeyForm.permissions.read}
                    onChange={(e) =>
                      setNewApiKeyForm({
                        ...newApiKeyForm,
                        permissions: {
                          ...newApiKeyForm.permissions,
                          read: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Read Access</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newApiKeyForm.permissions.write}
                    onChange={(e) =>
                      setNewApiKeyForm({
                        ...newApiKeyForm,
                        permissions: {
                          ...newApiKeyForm.permissions,
                          write: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Write Access</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newApiKeyForm.permissions.delete}
                    onChange={(e) =>
                      setNewApiKeyForm({
                        ...newApiKeyForm,
                        permissions: {
                          ...newApiKeyForm.permissions,
                          delete: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Delete Access</span>
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowGenerateKeyDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleGenerateApiKey}>
              {isGenerating ? (
                "Generating..."
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  "Generate Key"
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Webhook Dialog */}
      <Dialog
        open={showAddWebhookDialog}
        onOpenChange={setShowAddWebhookDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
            <DialogDescription>
              Configure a new webhook endpoint
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://api.example.com/webhooks"
                value={newWebhookForm.url}
                onChange={(e) =>
                  setNewWebhookForm({ ...newWebhookForm, url: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook-secret">Webhook Secret (Optional)</Label>
              <Input
                id="webhook-secret"
                type="password"
                placeholder="Enter secret for signature verification"
                value={newWebhookForm.secret}
                onChange={(e) =>
                  setNewWebhookForm({
                    ...newWebhookForm,
                    secret: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-3">
              <Label>Events to Subscribe</Label>
              <div className="space-y-2">
                {[
                  "tenant.created",
                  "tenant.updated",
                  "tenant.deleted",
                  "payment.success",
                  "payment.failed",
                  "subscription.renewed",
                ].map((event) => (
                  <label key={event} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newWebhookForm.events.includes(event)}
                      onChange={() => toggleWebhookEvent(event)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{event}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAddWebhookDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddWebhook}>
              {isWebhookCreating ? (
                "Adding..."
              ) : (
                <>
                  <Webhook className="w-4 h-4 mr-2" />
                  Add Webhook
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
