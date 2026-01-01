import { useState } from "react";
import { usePlans } from "@/hooks/usePlans";
import { useTenants } from "@/hooks/useTenants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StatsCard from "@/components/StatsCard";
import {
  Check,
  X,
  Plus,
  Package,
  Edit,
  Trash2,
  Eye,
  Users,
  DollarSign,
  AlertTriangle,
  Copy,
  MoreVertical,
  Ban,
  PlayCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Plan, PlanFormData } from "@/types/plan";
import { toast } from "sonner";

export default function PlansPage() {
  const {
    plans,
    planStats,
    isFetching,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus,
  } = usePlans();
  const { tenants } = useTenants();

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Default modules for new plans
  const defaultModules = [
    { name: "Overview", included: true },
    { name: "Tracking", included: true },
    { name: "Customers", included: true },
    { name: "Users", included: true },
    { name: "Team", included: false },
    { name: "Assignments", included: false },
    { name: "My Tasks", included: false },
    { name: "All Tasks", included: false },
    { name: "Visits", included: true },
    { name: "Feedback", included: false },
    { name: "Reminders", included: false },
    { name: "Resources", included: false },
    { name: "Support", included: false },
    { name: "Delivery Management", included: false },
    { name: "Merchandiser Management", included: false },
  ];

  // Form state
  const [formData, setFormData] = useState<PlanFormData>({
    name: "",
    description: "",
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxUsers: 5,
    maxCustomers: 100,
    maxVisits: 500,
    isActive: true,
    features: defaultModules,
  });

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }



  // Handlers
  const handleCreatePlan = () => {
    setFormData({
      name: "",
      description: "",
      monthlyPrice: 0,
      yearlyPrice: 0,
      maxUsers: 5,
      maxCustomers: 100,
      maxVisits: 500,
      isActive: true,
      features: [...defaultModules],
    });
    setShowCreateDialog(true);
  };

  const handleSubmitCreate = () => {
    if (!formData.name || !formData.description || formData.monthlyPrice <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    createPlan(formData);
    setShowCreateDialog(false);
    toast.success(`Plan "${formData.name}" created successfully`);
  };

  const handleEditClick = (plan: Plan) => {
    setSelectedPlan(plan);
    // Merge plan features with all available modules
    const mergedFeatures = defaultModules.map((module) => {
      const existingFeature = plan.features.find((f) => f.name === module.name);
      return existingFeature || module;
    });
    setFormData({
      name: plan.name,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      maxUsers: plan.maxUsers,
      maxCustomers: plan.maxCustomers,
      maxVisits: plan.maxVisits,
      isActive: plan.isActive,
      features: mergedFeatures,
    });
    setShowEditDialog(true);
    setShowActionsMenu(null);
  };

  const handleSubmitUpdate = () => {
    if (!selectedPlan) return;
    updatePlan(selectedPlan.id, formData);
    setShowEditDialog(false);
    toast.success(`Plan "${formData.name}" updated successfully`);
  };

  const handleViewDetails = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowDetailsDialog(true);
    setShowActionsMenu(null);
  };

  const handleDeleteClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowDeleteDialog(true);
    setShowActionsMenu(null);
  };

  const handleConfirmDelete = () => {
    if (!selectedPlan) return;
    deletePlan(selectedPlan.id);
    setShowDeleteDialog(false);
    toast.success(`Plan "${selectedPlan.name}" deleted successfully`);
  };

  const handleToggleStatus = (plan: Plan) => {
    togglePlanStatus(plan.id);
    setShowActionsMenu(null);
    toast.success(
      `Plan "${plan.name}" ${plan.isActive ? "deactivated" : "activated"}`
    );
  };

  const handleDuplicate = (plan: Plan) => {
    // Merge plan features with all available modules
    const mergedFeatures = defaultModules.map((module) => {
      const existingFeature = plan.features.find((f) => f.name === module.name);
      return existingFeature || module;
    });
    setFormData({
      name: `${plan.name} (Copy)`,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      maxUsers: plan.maxUsers,
      maxCustomers: plan.maxCustomers,
      maxVisits: plan.maxVisits,
      isActive: true,
      features: mergedFeatures,
    });
    setShowCreateDialog(true);
    setShowActionsMenu(null);
    toast.info("Plan duplicated - modify and save");
  };

  const handleActionsClick = (planId: string) => {
    setShowActionsMenu(showActionsMenu === planId ? null : planId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Subscription Plans
          </h1>
          <p className="text-gray-600 mt-1">
            Manage pricing plans and features
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={handleCreatePlan}
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Plan
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Plans"
          value={planStats?.data?.summary?.total_plans?.value ?? "NA"}
          icon={Package}
          trend={{
            value: planStats?.data?.summary?.total_plans?.change ?? 0,
            isPositive:
              planStats?.data?.summary?.total_plans?.isPositive ?? true,
          }}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="Active Plans"
          value={planStats?.data?.summary?.active_plans?.value ?? "NA"}
          icon={PlayCircle}
          trend={{
            value: planStats?.data?.summary?.active_plans?.change ?? 0,
            isPositive:
              planStats?.data?.summary?.active_plans?.isPositive ?? true,
          }}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Total Subscriptions"
          value={planStats?.data?.summary?.total_subscriptions?.value ?? "NA"}
          icon={Users}
          trend={{
            value: planStats?.data?.summary?.total_subscriptions?.change ?? 0,
            isPositive:
              planStats?.data?.summary?.total_subscriptions?.isPositive ?? true,
          }}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <StatsCard
          title="Total MRR"
          value={planStats?.data?.summary?.total_mrr?.formatted ?? "NA"}
          icon={DollarSign}
          trend={{
            value: planStats?.data?.summary?.total_mrr?.change ?? 0,
            isPositive: planStats?.data?.summary?.total_mrr?.isPositive ?? true,
          }}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const planTenants = tenants.filter((t) => t.planId === plan.id);
          const planRevenue = planTenants.reduce((sum, t) => sum + t.mrr, 0);

          return (
            <Card
              key={plan.id}
              className="bg-white/90 backdrop-blur-xl hover:shadow-xl transition-all group relative"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.status === "active" ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleActionsClick(plan.id)}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                      {showActionsMenu === plan.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => handleViewDetails(plan)}
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => handleEditClick(plan)}
                          >
                            <Edit className="w-4 h-4" />
                            Edit Plan
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => handleDuplicate(plan)}
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </button>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                              plan.isActive
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                            onClick={() => handleToggleStatus(plan)}
                          >
                            {plan.isActive ? (
                              <>
                                <Ban className="w-4 h-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <PlayCircle className="w-4 h-4" />
                                Activate
                              </>
                            )}
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                            onClick={() => handleDeleteClick(plan)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.plan_name}</CardTitle>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatCurrency(plan.monthly_price)}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    or {formatCurrency(plan.yearly_price)}/year
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">
                        Plan Revenue
                      </span>
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(planRevenue)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {planTenants.length} active subscriptions
                    </p>
                  </div>

                  <div className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Max Users:</span>
                    <span className="font-semibold">{plan.max_users}</span>
                  </div>
                  <div className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Max Customers:</span>
                    <span className="font-semibold">{plan.max_customers}</span>
                  </div>
                  <div className="flex justify-between text-sm p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Max Visits:</span>
                    <span className="font-semibold">{plan.max_visits}</span>
                  </div>
                  <div className="flex justify-between text-sm p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-gray-600">Active Tenants:</span>
                    <span className="font-semibold text-blue-600">
                      {plan.tenantsCount}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {[
                    { name: "Overview", key: "overview" },
                    { name: "Tracking", key: "tracking" },
                    { name: "Customers", key: "customers" },
                    { name: "Users", key: "users" },
                    { name: "Team", key: "team" },
                    { name: "Assignments", key: "assignments" },
                    { name: "My Tasks", key: "myTasks" },
                    { name: "All Tasks", key: "allTasks" },
                    { name: "Visits", key: "visits" },
                    { name: "Feedback", key: "feedback" },
                    { name: "Reminders", key: "reminders" },
                    { name: "Resources", key: "resources" },
                    { name: "Support", key: "support" },
                    { name: "Delivery Management", key: "deliveryManagement" },
                    {
                      name: "Merchandiser Management",
                      key: "merchandiserManagement",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span
                        className={
                          feature.included ? "text-gray-900" : "text-gray-400"
                        }
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewDetails(plan)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditClick(plan)}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant={plan.isActive ? "outline" : "default"}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleToggleStatus(plan)}
                  >
                    {plan.isActive ? (
                      <Ban className="h-3 w-3" />
                    ) : (
                      <PlayCircle className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Plan Dialog */}
      <Dialog
        open={showCreateDialog || showEditDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          setShowEditDialog(open);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showCreateDialog ? "Create New Plan" : "Edit Plan"}
            </DialogTitle>
            <DialogDescription>
              {showCreateDialog
                ? "Define pricing and features for a new subscription plan"
                : "Update plan details and features"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Professional"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the plan"
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyPrice">Monthly Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-semibold text-sm">
                    SAR
                  </span>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    value={formData.monthlyPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="pl-16"
                    placeholder="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearlyPrice">Yearly Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 font-semibold text-sm">
                    SAR
                  </span>
                  <Input
                    id="yearlyPrice"
                    type="number"
                    value={formData.yearlyPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        yearlyPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="pl-16"
                    placeholder="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxUsers">Max Users</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={formData.maxUsers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUsers: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxCustomers">Max Customers</Label>
                <Input
                  id="maxCustomers"
                  type="number"
                  value={formData.maxCustomers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxCustomers: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxVisits">Max Visits</Label>
                <Input
                  id="maxVisits"
                  type="number"
                  value={formData.maxVisits}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxVisits: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Core Modules</Label>
              <p className="text-sm text-gray-500">
                Select which modules are included in this plan
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Overview", key: "overview" },
                  { name: "Tracking", key: "tracking" },
                  { name: "Customers", key: "customers" },
                  { name: "Users", key: "users" },
                  { name: "Team", key: "team" },
                  { name: "Assignments", key: "assignments" },
                  { name: "My Tasks", key: "myTasks" },
                  { name: "All Tasks", key: "allTasks" },
                  { name: "Visits", key: "visits" },
                  { name: "Feedback", key: "feedback" },
                  { name: "Reminders", key: "reminders" },
                  { name: "Resources", key: "resources" },
                  { name: "Support", key: "support" },
                  { name: "Delivery Management", key: "deliveryManagement" },
                  {
                    name: "Merchandiser Management",
                    key: "merchandiserManagement",
                  },
                ].map((module) => {
                  const isEnabled = formData.features.some(
                    (f) => f.name === module.name && f.included
                  );
                  return (
                    <div
                      key={module.key}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {module.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const existingIndex = formData.features.findIndex(
                            (f) => f.name === module.name
                          );
                          if (existingIndex >= 0) {
                            const newFeatures = [...formData.features];
                            newFeatures[existingIndex] = {
                              ...newFeatures[existingIndex],
                              included: !newFeatures[existingIndex].included,
                            };
                            setFormData({ ...formData, features: newFeatures });
                          } else {
                            setFormData({
                              ...formData,
                              features: [
                                ...formData.features,
                                { name: module.name, included: true },
                              ],
                            });
                          }
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isEnabled ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isEnabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={
                showCreateDialog ? handleSubmitCreate : handleSubmitUpdate
              }
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {showCreateDialog ? "Create Plan" : "Update Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Plan Details</DialogTitle>
            <DialogDescription>
              Complete information about this subscription plan
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-6 py-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedPlan.name}
                  </h3>
                  <p className="text-gray-600">{selectedPlan.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedPlan.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                    <Badge variant="outline">
                      {selectedPlan.tenantsCount} subscriptions
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Pricing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Monthly</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(selectedPlan.monthlyPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Yearly</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(selectedPlan.yearlyPrice)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Save{" "}
                        {formatCurrency(
                          selectedPlan.monthlyPrice * 12 -
                            selectedPlan.yearlyPrice
                        )}{" "}
                        per year
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Limits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Max Users:</span>
                      <span className="font-semibold">
                        {selectedPlan.maxUsers}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Max Customers:</span>
                      <span className="font-semibold">
                        {selectedPlan.maxCustomers.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Max Visits:</span>
                      <span className="font-semibold">
                        {selectedPlan.maxVisits.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-gray-600">Plan ID:</span>
                      <span className="font-mono text-xs">
                        {selectedPlan.id}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPlan.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        {feature.included ? (
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <span
                          className={
                            feature.included ? "text-gray-900" : "text-gray-400"
                          }
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      handleEditClick(selectedPlan);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Plan
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      handleDuplicate(selectedPlan);
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={
                      selectedPlan.isActive
                        ? "text-orange-600"
                        : "text-green-600"
                    }
                    onClick={() => {
                      handleToggleStatus(selectedPlan);
                      setShowDetailsDialog(false);
                    }}
                  >
                    {selectedPlan.isActive ? (
                      <>
                        <Ban className="mr-2 h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Activate
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      handleDeleteClick(selectedPlan);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
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
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this plan? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="py-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-900">Warning</span>
                </div>
                <p className="text-sm text-red-700">
                  You are about to permanently delete{" "}
                  <strong>{selectedPlan.name}</strong>.
                </p>
                {selectedPlan.tenantsCount > 0 && (
                  <p className="text-sm text-red-700">
                    This plan has{" "}
                    <strong>
                      {selectedPlan.tenantsCount} active subscription(s)
                    </strong>
                    . Deleting it may affect these tenants.
                  </p>
                )}
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
              Delete Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
