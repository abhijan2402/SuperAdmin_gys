import { useState } from "react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import StatsCard from "@/components/StatsCard";
import {
  FileText,
  User,
  Clock,
  Search,
  Download,
  Eye,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import type { AuditLog } from "@/types/auditLog";

export default function AuditLogsPage() {
  const { auditLogs, auditStats, overviewFetching, auditFetching } =
    useAuditLogs();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Handlers
  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailsDialog(true);
  };

  const handleExport = () => {
    const csvContent = [
      [
        "ID",
        "Admin",
        "Action",
        "Entity Type",
        "Entity Name",
        "Details",
        "IP Address",
        "Date",
      ].join(","),
      ...filteredLogs.map((log) =>
        [
          log.id,
          log.admin_name,
          log.action_type,
          log.entity_type,
          `"${log.entityName || ""}"`,
          `"${log.details}"`,
          log.ipAddress || "",
          formatDateTime(log.formatted_created_at),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Audit logs exported successfully");
  };

  if (overviewFetching || auditFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getActionColor = (action: string) => {
    if (action.includes("created")) return "success";
    if (action.includes("deleted") || action.includes("suspended"))
      return "destructive";
    if (action.includes("updated")) return "warning";
    return "default";
  };

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Date filtering helper
  const filterByDate = (log: AuditLog) => {
    if (dateFilter === "all") return true;
    const logDate = new Date(log.formatted_created_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (dateFilter) {
      case "today":
        return logDate >= today;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate >= weekAgo;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return logDate >= monthAgo;
      default:
        return true;
    }
  };

  // Filtering
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false) ||
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction =
      actionFilter === "all" || log.action_type === actionFilter;
    const matchesEntity =
      entityFilter === "all" || log.entity_type === entityFilter;
    const matchesDate = filterByDate(log);
    return matchesSearch && matchesAction && matchesEntity && matchesDate;
  });

  // Get unique entity types for filter
  const uniqueEntityTypes = Array.from(
    new Set(auditLogs.map((log) => log.entity_type))
  );

  // Get unique actions for filter
  const uniqueActions = Array.from(
    new Set(auditLogs.map((log) => log.action_type))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">
            Complete history of all administrative actions
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Logs"
          value={auditStats?.total_logs ?? 0}
          icon={FileText}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Today's Activity"
          value={auditStats?.todays_activity ?? 0}
          icon={Activity}
          trend={{ value: 0, isPositive: true }}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="Create/Update"
          value={auditStats?.create_update_actions ?? 0}
          icon={CheckCircle}
          trend={{ value: 0, isPositive: true }}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Critical Actions"
          value={auditStats?.critical_actions ?? 0}
          icon={AlertTriangle}
          trend={{ value: 0, isPositive: false }}
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
      </div>

      {/* Filters */}
      <Card className="bg-white/90 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {formatAction(action)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {uniqueEntityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredLogs.length} of {auditLogs.length} logs
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Timeline */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <Card
            key={log.id}
            className="bg-white/90 backdrop-blur-xl hover:shadow-lg transition-shadow group"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    log.action_type.includes("created")
                      ? "bg-green-100"
                      : log.action_type.includes("deleted") ||
                        log.action_type.includes("suspended")
                      ? "bg-red-100"
                      : log.action_type.includes("updated")
                      ? "bg-yellow-100"
                      : "bg-blue-100"
                  }`}
                >
                  {log.action_type.includes("created") ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : log.action_type.includes("deleted") ||
                    log.action_type.includes("suspended") ? (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  ) : log.action_type.includes("updated") ? (
                    <Activity className="w-6 h-6 text-yellow-600" />
                  ) : (
                    <Shield className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant={getActionColor(log.action_type)}>
                      {formatAction(log.action_type)}
                    </Badge>
                    <span className="text-sm text-gray-600">•</span>
                    <span className="text-sm text-gray-600">
                      {log.entity_type}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">
                    {log.entityName || `${log.entity_type} ${log.entity_id}`}
                  </p>
                  <p className="text-sm text-gray-700 mb-3">{log.details}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {log.admin_name}
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(log.formatted_created_at)}
                    </div>
                    {log.ipAddress && (
                      <>
                        <span>•</span>
                        <span>IP: {log.ipAddress}</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(log)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <Card className="bg-white/90 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {auditLogs.length === 0
                ? "No audit logs available"
                : "No logs match your filters"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Complete information about this action
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 py-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    selectedLog.action_type.includes("created")
                      ? "bg-green-100"
                      : selectedLog.action_type.includes("deleted") ||
                        selectedLog.action_type.includes("suspended")
                      ? "bg-red-100"
                      : selectedLog.action_type.includes("updated")
                      ? "bg-yellow-100"
                      : "bg-blue-100"
                  }`}
                >
                  {selectedLog.action_type.includes("created") ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : selectedLog.action_type.includes("deleted") ||
                    selectedLog.action_type.includes("suspended") ? (
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  ) : selectedLog.action_type.includes("updated") ? (
                    <Activity className="w-8 h-8 text-yellow-600" />
                  ) : (
                    <Shield className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <Badge
                    variant={getActionColor(selectedLog.action_type)}
                    className="mb-2"
                  >
                    {formatAction(selectedLog.action_type)}
                  </Badge>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedLog.entityName ||
                      `${selectedLog.entity_type} ${selectedLog.entity_id}`}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Log ID</Label>
                  <p className="font-medium font-mono text-sm">
                    {selectedLog.id}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Entity Type</Label>
                  <p className="font-medium">{selectedLog.entity_type}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Entity ID</Label>
                  <p className="font-medium font-mono text-sm">
                    {selectedLog.entity_id}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Admin</Label>
                  <p className="font-medium">{selectedLog.admin_name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Admin ID</Label>
                  <p className="font-medium font-mono text-sm">
                    {selectedLog.adminId}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Timestamp</Label>
                  <p className="font-medium">
                    {formatDateTime(selectedLog.formatted_created_at)}
                  </p>
                </div>
                {selectedLog.ipAddress && (
                  <div>
                    <Label className="text-gray-600">IP Address</Label>
                    <p className="font-medium font-mono text-sm">
                      {selectedLog.ipAddress}
                    </p>
                  </div>
                )}
                {selectedLog.userAgent && (
                  <div className="col-span-2">
                    <Label className="text-gray-600">User Agent</Label>
                    <p className="font-medium text-sm">
                      {selectedLog.userAgent}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-gray-600">Details</Label>
                <p className="mt-1 text-gray-900 p-4 bg-gray-50 rounded-lg">
                  {selectedLog.details}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
