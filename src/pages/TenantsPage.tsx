import { useState } from "react";
import { useTenants } from "@/hooks/useTenants";
import { usePlans } from "@/hooks/usePlans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import StatusBadge from "@/components/StatusBadge";
import StatsCard from "@/components/StatsCard";
import LicenseManagementDialog from "@/components/LicenseManagementDialog";
import {
  Search,
  Plus,
  Building2,
  Users,
  DollarSign,
  MoreVertical,
  Mail,
  Calendar,
  CreditCard,
  AlertTriangle,
  Download,
  Edit,
  Eye,
  Trash2,
  Ban,
  PlayCircle,
  Server,
  Cloud,
  Key,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Tenant, TenantStatus, TenantFormData } from "@/types/tenant";
import { toast } from "sonner";

export default function TenantsPage() {
  const {
    tenants,
    stats,
    isLoading,
    changeTenantStatus,
    createTenant,
    updateTenant,
    deleteTenant,
  } = useTenants();
  const { plans } = usePlans();
  console.log(plans);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [deploymentFilter, setDeploymentFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLicenseDialog, setShowLicenseDialog] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Form state
  const [formData, setFormData] = useState<TenantFormData>({
    companyName: "",
    contactEmail: "",
    contactName: "",
    planId: "",
    status: "trial" as TenantStatus,
    totalUsers: 5,
    activeUsers: 0,
    mrr: 0,
    deploymentType: "centralized",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredTenants = tenants?.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || tenant.status === statusFilter;
    const matchesPlan = planFilter === "all" || tenant.planId === planFilter;
    const matchesDeployment =
      deploymentFilter === "all" || tenant.deploymentType === deploymentFilter;
    return matchesSearch && matchesStatus && matchesPlan && matchesDeployment;
  });

  // const activeTenants = tenants.filter(t => t.status === 'active').length
  // const trialTenants = tenants.filter(t => t.status === 'trial').length
  const centralizedTenants = tenants?.filter(
    (t) => t.deploymentType === "centralized"
  )?.length;
  const selfHostedTenants = tenants?.filter(
    (t) => t?.deploymentType === "self-hosted"
  )?.length;
  const totalMRR = tenants?.reduce((sum, t) => sum + t?.mrr, 0);
  const avgMRR = tenants?.length > 0 ? totalMRR / tenants?.length : 0;

  // Handlers
  const handleExport = () => {
    const csvContent = [
      ["Company", "Email", "Plan", "Status", "Users", "MRR", "Created"].join(
        ","
      ),
      ...filteredTenants.map((t) =>
        [
          t.companyName,
          t.contactEmail,
          t.planName,
          t.status,
          `${t.activeUsers}/${t.totalUsers}`,
          t.mrr,
          formatDate(t.createdAt),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tenants-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Tenants data exported successfully");
  };

  const handleAddTenant = () => {
    setFormData({
      companyName: "",
      contactEmail: "",
      contactName: "",
      planId: plans[0]?.id || "",
      status: "trial",
      totalUsers: 5,
      activeUsers: 0,
      mrr: 0,
      deploymentType: "centralized",
    });
    setShowAddDialog(true);
  };

  const handleCreateTenant = async () => {
    if (!formData.companyName || !formData.contactEmail || !formData.planId) {
      toast.error("Please fill in all required fields");
      return;
    }
    await createTenant(formData);
    // setShowAddDialog(false)
    toast.success(`Tenant ${formData.companyName} created successfully`);
  };

  const handleEditClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      companyName: tenant.companyName,
      contactEmail: tenant.contactEmail,
      contactName: tenant.contactName,
      planId: tenant.planId,
      status: tenant.status,
      totalUsers: tenant.totalUsers,
      activeUsers: tenant.activeUsers,
      mrr: tenant.mrr,
      deploymentType: tenant.deploymentType,
      databaseType: tenant.databaseType,
      instanceUrl: tenant.instanceUrl,
    });
    setShowEditDialog(true);
    setShowActionsMenu(null);
  };

  const handleUpdateTenant = () => {
    if (!selectedTenant) return;
    updateTenant(selectedTenant.id, formData);
    setShowEditDialog(false);
    toast.success(`Tenant ${formData.companyName} updated successfully`);
  };

  const handleViewDetails = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowDetailsDialog(true);
    setShowActionsMenu(null);
  };

  const handleDeleteClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowDeleteDialog(true);
    setShowActionsMenu(null);
  };

  const handleConfirmDelete = () => {
    if (!selectedTenant) return;
    deleteTenant(selectedTenant.id);
    setShowDeleteDialog(false);
    toast.success(`Tenant ${selectedTenant.companyName} deleted successfully`);
  };

  const handleStatusChange = (tenant: Tenant, newStatus: TenantStatus) => {
    changeTenantStatus(tenant.id, newStatus);
    setShowActionsMenu(null);
    toast.success(`Tenant status changed to ${newStatus}`);
  };

  const handleActionsClick = (tenantId: string) => {
    setShowActionsMenu(showActionsMenu === tenantId ? null : tenantId);
  };

  const handleManageLicense = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowLicenseDialog(true);
    setShowActionsMenu(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600 mt-1">
            Manage all tenant accounts and subscriptions
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={handleAddTenant}
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Tenant
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Tenants"
          value={stats?.total_tenants}
          icon={Building2}
          trend={{ value: 12, isPositive: true }}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="Centralized"
          value={stats?.centralized_tenants}
          icon={Cloud}
          trend={{ value: 5, isPositive: true }}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-100"
        />
        <StatsCard
          title="Self-Hosted"
          value={stats?.self_hosted_tenants}
          icon={Server}
          trend={{ value: 2, isPositive: true }}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <StatsCard
          title="Total MRR"
          value={formatCurrency(stats?.total_mrr)}
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
      </div>

      {/* Filters */}
      <Card className="bg-white/90 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by company name or email..."
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
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  {plans?.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.plan_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={deploymentFilter}
                onValueChange={setDeploymentFilter}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Deployment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="centralized">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-4 h-4" />
                      Centralized
                    </div>
                  </SelectItem>
                  <SelectItem value="self-hosted">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      Self-Hosted
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {filteredTenants?.length} tenants found
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Avg MRR: {formatCurrency(avgMRR)}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  List
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants?.map((tenant) => {
            const plan = plans?.find((p) => p.id === tenant.planId);
            return (
              <Card
                key={tenant.id}
                className="bg-white/90 backdrop-blur-xl hover:shadow-xl transition-all group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                      {tenant?.name.charAt(0)}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={tenant.status} type="tenant" />
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleActionsClick(tenant.id)}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        {showActionsMenu === tenant.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              onClick={() => handleViewDetails(tenant)}
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              onClick={() => handleEditClick(tenant)}
                            >
                              <Edit className="w-4 h-4" />
                              Edit Tenant
                            </button>
                            {tenant.deploymentType === "self-hosted" && (
                              <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                onClick={() => handleManageLicense(tenant)}
                              >
                                <Key className="w-4 h-4" />
                                Manage License
                              </button>
                            )}
                            <div className="border-t border-gray-200 my-1"></div>
                            {tenant.status !== "active" && (
                              <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                                onClick={() =>
                                  handleStatusChange(tenant, "active")
                                }
                              >
                                <PlayCircle className="w-4 h-4" />
                                Activate
                              </button>
                            )}
                            {tenant.status === "active" && (
                              <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-orange-600"
                                onClick={() =>
                                  handleStatusChange(tenant, "suspended")
                                }
                              >
                                <Ban className="w-4 h-4" />
                                Suspend
                              </button>
                            )}
                            <button
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                              onClick={() => handleDeleteClick(tenant)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                    {tenant.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Mail className="w-3 h-3" />
                    <p className="truncate">{tenant.email || "--"}</p>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Plan:</span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700"
                      >
                        {plan?.name || tenant.plan}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {tenant.deploymentType === "centralized" ? (
                          <Cloud className="w-4 h-4 text-cyan-600" />
                        ) : (
                          <Server className="w-4 h-4 text-purple-600" />
                        )}
                        <span className="text-sm text-gray-600">
                          Deployment:
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          tenant.deploymentType === "centralized"
                            ? "bg-cyan-50 text-cyan-700"
                            : "bg-purple-50 text-purple-700"
                        }
                      >
                        {tenant.deploymentType === "centralized"
                          ? "Centralized"
                          : "Self-Hosted"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">Users:</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {tenant.active_users}/{tenant.max_users}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">MRR:</span>
                      </div>
                      <span className="font-bold text-green-600">
                        {tenant.deploymentType === "centralized"
                          ? formatCurrency(tenant.mrr)
                          : "Annual License"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-gray-600">Created:</span>
                      </div>
                      <span className="text-xs text-gray-900">
                        {formatDate(tenant.created_at)}
                      </span>
                    </div>
                  </div>

                  {tenant.status === "trial" && (
                    <div className="mb-4 p-2 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span className="text-xs text-orange-700">
                        Trial account - Convert to paid plan
                      </span>
                    </div>
                  )}

                  {tenant.status === "suspended" && (
                    <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-xs text-red-700">
                        Account suspended - Requires attention
                      </span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 flex gap-2">
                    {tenant.deploymentType === "self-hosted" ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleManageLicense(tenant)}
                        >
                          <Key className="mr-1 h-3 w-3" />
                          License
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditClick(tenant)}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewDetails(tenant)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditClick(tenant)}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tenants List View */}
      {viewMode === "list" && (
        <Card className="bg-white/90 backdrop-blur-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      MRR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTenants.map((tenant) => {
                    const plan = plans.find((p) => p.id === tenant.planId);
                    return (
                      <tr
                        key={tenant.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {tenant.companyName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {tenant.companyName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {tenant.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {tenant.contactEmail}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700"
                          >
                            {plan?.name || tenant.planName}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-900">
                              {tenant.activeUsers}/{tenant.totalUsers}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-green-600">
                            {formatCurrency(tenant.mrr)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={tenant.status} type="tenant" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(tenant.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="relative inline-block">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActionsClick(tenant.id)}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                            {showActionsMenu === tenant.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                <button
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                  onClick={() => handleViewDetails(tenant)}
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                <button
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                  onClick={() => handleEditClick(tenant)}
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit Tenant
                                </button>
                                <div className="border-t border-gray-200 my-1"></div>
                                {tenant.status !== "active" && (
                                  <button
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600"
                                    onClick={() =>
                                      handleStatusChange(tenant, "active")
                                    }
                                  >
                                    <PlayCircle className="w-4 h-4" />
                                    Activate
                                  </button>
                                )}
                                {tenant.status === "active" && (
                                  <button
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-orange-600"
                                    onClick={() =>
                                      handleStatusChange(tenant, "suspended")
                                    }
                                  >
                                    <Ban className="w-4 h-4" />
                                    Suspend
                                  </button>
                                )}
                                <button
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                  onClick={() => handleDeleteClick(tenant)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredTenants?.length === 0 && (
        <Card className="bg-white/90 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No tenants found matching your criteria
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Tenant Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Tenant</DialogTitle>
            <DialogDescription>
              Create a new tenant account with subscription details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  placeholder="Enter company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                  placeholder="email@company.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData({ ...formData, contactName: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Subscription Plan *</Label>
                <Select
                  value={formData.planId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, planId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans?.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan?.name} - {formatCurrency(plan?.monthly_price)}/mo
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deploymentType">Deployment Type *</Label>
                <Select
                  value={formData.deploymentType}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      deploymentType: value as "centralized" | "self-hosted",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select deployment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="centralized">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-4 h-4" />
                        Centralized (Your Server)
                      </div>
                    </SelectItem>
                    <SelectItem value="self-hosted">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        Self-Hosted (Client Server)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.deploymentType === "self-hosted" && (
                <div className="space-y-2">
                  <Label htmlFor="databaseType">Database Type</Label>
                  <Select
                    value={formData.databaseType || "postgresql"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        databaseType: value as "postgresql" | "mysql",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select database" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {formData.deploymentType === "self-hosted" && (
              <div className="space-y-2">
                <Label htmlFor="instanceUrl">Instance URL (Optional)</Label>
                <Input
                  id="instanceUrl"
                  value={formData.instanceUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, instanceUrl: e.target.value })
                  }
                  placeholder="https://visits.clientdomain.com"
                />
                <p className="text-xs text-gray-500">
                  Client's domain where the system will be installed
                </p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalUsers">Max Users</Label>
                <Input
                  id="totalUsers"
                  type="number"
                  value={formData.totalUsers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalUsers: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activeUsers">Active Users</Label>
                <Input
                  id="activeUsers"
                  type="number"
                  value={formData.activeUsers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      activeUsers: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mrr">MRR</Label>
                <Input
                  id="mrr"
                  type="number"
                  value={formData.mrr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mrr: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTenant}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Create Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tenant Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>
              Update tenant account information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-companyName">Company Name *</Label>
                <Input
                  id="edit-companyName"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contactEmail">Contact Email *</Label>
                <Input
                  id="edit-contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-contactName">Contact Name</Label>
                <Input
                  id="edit-contactName"
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData({ ...formData, contactName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-plan">Subscription Plan *</Label>
                <Select
                  value={formData.planId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, planId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {plans?.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan?.name} - {formatCurrency(plan?.monthlyPrice)}/mo
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-deploymentType">Deployment Type *</Label>
                <Select
                  value={formData.deploymentType}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      deploymentType: value as "centralized" | "self-hosted",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="centralized">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-4 h-4" />
                        Centralized
                      </div>
                    </SelectItem>
                    <SelectItem value="self-hosted">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4" />
                        Self-Hosted
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.deploymentType === "self-hosted" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-databaseType">Database Type</Label>
                  <Select
                    value={formData.databaseType || "postgresql"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        databaseType: value as "postgresql" | "mysql",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {formData.deploymentType === "self-hosted" && (
              <div className="space-y-2">
                <Label htmlFor="edit-instanceUrl">Instance URL</Label>
                <Input
                  id="edit-instanceUrl"
                  value={formData.instanceUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, instanceUrl: e.target.value })
                  }
                  placeholder="https://visits.clientdomain.com"
                />
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-totalUsers">Max Users</Label>
                <Input
                  id="edit-totalUsers"
                  type="number"
                  value={formData.totalUsers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalUsers: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-activeUsers">Active Users</Label>
                <Input
                  id="edit-activeUsers"
                  type="number"
                  value={formData.activeUsers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      activeUsers: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-mrr">MRR</Label>
                <Input
                  id="edit-mrr"
                  type="number"
                  value={formData.mrr}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mrr: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTenant}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Update Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Tenant Details</DialogTitle>
            <DialogDescription>
              Complete information about this tenant
            </DialogDescription>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-6 py-4">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
                  {selectedTenant.companyName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedTenant.companyName}
                  </h3>
                  <p className="text-gray-600">{selectedTenant.contactEmail}</p>
                  <div className="mt-2">
                    <StatusBadge status={selectedTenant.status} type="tenant" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tenant ID:</span>
                      <span className="font-mono text-sm">
                        {selectedTenant.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contact Name:</span>
                      <span className="font-semibold">
                        {selectedTenant.contactName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span>{formatDate(selectedTenant.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="capitalize font-semibold">
                        {selectedTenant.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Subscription Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700"
                      >
                        {selectedTenant.planName}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">MRR:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(selectedTenant.mrr)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Users:</span>
                      <span className="font-semibold">
                        {selectedTenant.activeUsers}/{selectedTenant.totalUsers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan ID:</span>
                      <span className="font-mono text-sm">
                        {selectedTenant.planId}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  {selectedTenant.status !== "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600"
                      onClick={() => {
                        handleStatusChange(selectedTenant, "active");
                        setShowDetailsDialog(false);
                      }}
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Activate Account
                    </Button>
                  )}
                  {selectedTenant.status === "active" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-orange-600"
                      onClick={() => {
                        handleStatusChange(selectedTenant, "suspended");
                        setShowDetailsDialog(false);
                      }}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Suspend Account
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      handleEditClick(selectedTenant);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      handleDeleteClick(selectedTenant);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Tenant
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tenant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tenant? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {selectedTenant && (
            <div className="py-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-900">Warning</span>
                </div>
                <p className="text-sm text-red-700">
                  You are about to permanently delete{" "}
                  <strong>{selectedTenant.companyName}</strong>. All associated
                  data will be lost.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* License Management Dialog */}
      {selectedTenant && selectedTenant.deploymentType === "self-hosted" && (
        <LicenseManagementDialog
          open={showLicenseDialog}
          onClose={() => setShowLicenseDialog(false)}
          tenant={selectedTenant}
        />
      )}
    </div>
  );
}
