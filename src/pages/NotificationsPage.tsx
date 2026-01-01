import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useTenants } from "@/hooks/useTenants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatsCard from "@/components/StatsCard";
import {
  Bell,
  Plus,
  Check,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  Search,
  Download,
  Mail,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import type {
  NotificationFormData,
  NotificationType,
} from "@/types/notification";
import { useGetExportNotificationsQuery } from "@/redux/api/notificationApi";

export default function NotificationsPage() {
  const { data: csvData } = useGetExportNotificationsQuery({
    type: "payment",
    status: "unread",
  });
  const downloadCSV = () => {
    if (!csvData) return;
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "notifications.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const {
    notifications,
    isFetching,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    unreadCount,
    isSendingNotification,
  } = useNotifications();
  const { tenants } = useTenants();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );
  const [formData, setFormData] = useState<NotificationFormData>({
    targetTenants: [],
    title: "",
    message: "",
    type: "info",
  });

  // Handlers
  const handleSendNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.targetTenants.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    try {
      await createNotification(formData);
      setShowSendDialog(false);
      setFormData({
        targetTenants: [],
        title: "",
        message: "",
        type: "info",
      });
    } catch (error) {
      toast.error("Failed to send notification");
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nid) => nid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n.id));
    }
  };

  const handleDeleteSelected = async () => {
    for (const id of selectedNotifications) {
      await deleteNotification(id);
    }
    setSelectedNotifications([]);
    toast.success(`${selectedNotifications.length} notification(s) deleted`);
  };

  const handleMarkSelectedAsRead = async () => {
    for (const id of selectedNotifications) {
      await markAsRead(id);
    }
    setSelectedNotifications([]);
    toast.success(
      `${selectedNotifications.length} notification(s) marked as read`
    );
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "warning":
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      case "error":
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  // Stats calculations
  const totalNotifications = notifications.length;
  const readCount = (notifications || []).filter(
    (n: any) => n.status === "read"
  ).length;

  const infoCount = (notifications || []).filter(
    (n: any) => n.type === "info"
  ).length;
  const successCount = (notifications || []).filter(
    (n: any) => n.type === "success"
  ).length;
  const warningCount = (notifications || []).filter(
    (n: any) => n.type === "warning"
  ).length;
  const errorCount = (notifications || []).filter(
    (n: any) => n.type === "error"
  ).length;

  // Filtering
  const filteredNotifications = notifications.filter((notif: any) => {
    const matchesSearch =
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || notif.type === typeFilter;

    const matchesStatus =
      statusFilter === "all" || notif.status === statusFilter; // 👈 FIX

    return matchesSearch && matchesType && matchesStatus;
  });

  const unreadNotifications = filteredNotifications.filter(
    (n: any) => n.status === "unread"
  );

  const readNotifications = filteredNotifications.filter(
    (n: any) => n.status === "read"
  );

  console.log(unreadNotifications);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Notifications
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={downloadCSV}
            size="sm"
            className="flex-1 sm:flex-none text-xs sm:text-sm"
          >
            <Download className="mr-1 sm:mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-1 sm:flex-none text-xs sm:text-sm"
            onClick={() => setShowSendDialog(true)}
            size="sm"
          >
            <Plus className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Send Notification</span>
            <span className="sm:hidden">Send</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatsCard
          title="Total Notifications"
          value={totalNotifications}
          icon={Bell}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Unread"
          value={unreadCount}
          icon={Mail}
          trend={{ value: 0, isPositive: false }}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="Read"
          value={readCount}
          icon={CheckCircle}
          trend={{ value: 0, isPositive: true }}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Alerts"
          value={warningCount + errorCount}
          icon={AlertCircle}
          trend={{ value: 0, isPositive: false }}
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
      </div>

      {/* Filters and Actions */}
      <Card className="bg-white/90 backdrop-blur-xl">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Status ({notifications.length})
                  </SelectItem>
                  <SelectItem value="unread">Unread ({unreadCount})</SelectItem>
                  <SelectItem value="read">Read ({readCount})</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info ({infoCount})</SelectItem>
                  <SelectItem value="success">
                    Success ({successCount})
                  </SelectItem>
                  <SelectItem value="warning">
                    Warning ({warningCount})
                  </SelectItem>
                  <SelectItem value="error">Error ({errorCount})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={
                    selectedNotifications.length ===
                      filteredNotifications.length &&
                    filteredNotifications.length > 0
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-600">
                  {selectedNotifications.length > 0
                    ? `${selectedNotifications.length} selected`
                    : `Showing ${filteredNotifications.length} of ${notifications.length}`}
                </span>
              </div>
              {selectedNotifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkSelectedAsRead}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    Mark All Read
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Unread ({unreadNotifications.length})
          </h2>
          {unreadNotifications.map((notification) => (
            <Card
              key={notification.id}
              className="bg-white/90 backdrop-blur-xl border-blue-200 hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleToggleSelect(notification.id)}
                    className="w-4 h-4 text-blue-600 rounded mt-1"
                  />
                  <div className="flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-bold text-gray-900">
                        {notification.title}
                      </h3>
                      <Badge className="bg-blue-100 text-blue-700">New</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatDateTime(notification.created_at)}</span>
                      {notification.tenantId && (
                        <>
                          <span>•</span>
                          <span>
                            Tenant:{" "}
                            {tenants.find((t) => t.id === notification.tenantId)
                              ?.companyName || "Unknown"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Read Notifications */}
      {readNotifications.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Read ({readNotifications.length})
          </h2>
          {readNotifications.map((notification) => (
            <Card
              key={notification.id}
              className="bg-white/60 backdrop-blur-xl hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleToggleSelect(notification.id)}
                    className="w-4 h-4 text-blue-600 rounded mt-1"
                  />
                  <div className="flex-shrink-0 opacity-50">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-700 mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatDateTime(notification.created_at)}</span>
                      {notification.tenantId && (
                        <>
                          <span>•</span>
                          <span>
                            Tenant:{" "}
                            {tenants.find((t) => t.id === notification.tenantId)
                              ?.companyName || "Unknown"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredNotifications.length === 0 && (
        <Card className="bg-white/90 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {notifications.length === 0
                ? "No notifications yet"
                : "No notifications match your filters"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Send Notification Dialog */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Send a notification to one or more tenants
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="recipients">Recipients *</Label>
              <Select
                value={formData.targetTenants[0] || ""}
                onValueChange={(value) => {
                  if (value === "all") {
                    setFormData({ ...formData, targetTenants: ["all"] });
                  } else {
                    setFormData({ ...formData, targetTenants: [value] });
                  }
                }}
              >
                <SelectTrigger id="recipients">
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tenants</SelectItem>
                  {tenants?.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as NotificationType })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      Info
                    </div>
                  </SelectItem>
                  <SelectItem value="success">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Success
                    </div>
                  </SelectItem>
                  <SelectItem value="warning">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      Warning
                    </div>
                  </SelectItem>
                  <SelectItem value="error">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Error
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Notification title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Notification message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification}>
              {isSendingNotification ? (
                "Sending..."
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Notification
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
