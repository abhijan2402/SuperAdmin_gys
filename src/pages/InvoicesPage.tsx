import { useMemo, useState } from "react";
import { useInvoices } from "@/hooks/useInvoices";
import { useTenants } from "@/hooks/useTenants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import StatsCard from "@/components/StatsCard";
import StatusBadge from "@/components/StatusBadge";
import {
  Search,
  Plus,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Receipt,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Invoice, InvoiceFormData, InvoiceStatus } from "@/types/invoice";

export default function InvoicesPage() {
  const {
    invoices,
    dashboardStats,
    isLoading,
    createInvoice,
    updateInvoice,
    updateInvoiceStatus,
    deleteInvoice,
  } = useInvoices();
  const { tenants } = useTenants();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<InvoiceStatus>("pending");
  const [statusNotes, setStatusNotes] = useState("");

  // Form state
  const [formData, setFormData] = useState<InvoiceFormData>({
    tenantId: "",
    planName: "",
    tenantName: "",
    amount: 0,
    description: "",
    billingPeriod: "",
    dueDate: new Date(),
    notes: "",
  });

  const statusCounts = useMemo(() => {
    if (!invoices)
      return { all: 0, paid: 0, pending: 0, overdue: 0, cancelled: 0 };

    return {
      all: invoices.length,
      paid: invoices.filter((i) => i.status === "paid").length,
      pending: invoices.filter((i) => i.status === "pending").length,
      overdue: invoices.filter((i) => i.status === "overdue").length,
      cancelled: invoices.filter((i) => i.status === "cancelled").length,
    };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];

    return invoices.filter((invoice) => {
      const matchesSearch = invoice.tenant_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Handlers
  const handleCreateInvoice = () => {
    setFormData({
      tenantId: "",
      planName: "",
      tenantName: "",
      amount: 0,
      description: "",
      billingPeriod: "",
      dueDate: new Date(),
      notes: "",
    });
    setShowCreateDialog(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.tenantId || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    await createInvoice(formData);
    setShowCreateDialog(false);
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsDialog(true);
    setShowActionsMenu(null);
  };

  const handleEditClick = (invoice: Invoice) => {
    setFormData({
      tenantId: invoice.tenant_id.toString(),
      planName: invoice.tenant_plan,
      tenantName: invoice.tenant_name,
      amount: parseFloat(invoice.amount),
      description: invoice.notes || "",
      billingPeriod: invoice.billing_period,
      dueDate: new Date(invoice.due_date),
      notes: invoice.notes || "",
    });
    setSelectedInvoice(invoice);

    setShowEditDialog(true);
    setShowActionsMenu(null);
  };

  const resetForm = () => {
    setFormData({
      tenantId: "",
      planName: "",
      tenantName: "",
      amount: 0,
      description: "",
      billingPeriod: "",
      dueDate: new Date(),
      notes: "",
    });
    setSelectedInvoice(null);
  };

  const handleUpdateInvoice = async () => {
    if (!selectedInvoice) return;

    await updateInvoice(formData, selectedInvoice);
    toast.success("Invoice updated successfully");
    setShowEditDialog(false);
  };

  const handleStatusChange = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setNewStatus(invoice.status);
    setShowStatusDialog(true);
    setShowActionsMenu(null);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedInvoice) return;
    const payload = {
      status: newStatus,
      changed_by: "admin",
      notes: statusNotes,
    };
    await updateInvoiceStatus(payload, selectedInvoice);
    setShowStatusDialog(false);
  };

  const handleDeleteClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDeleteDialog(true);
    setShowActionsMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedInvoice) return;
    await deleteInvoice(selectedInvoice);
    setShowDeleteDialog(false);
  };

  const handleDownload = (invoice: Invoice) => {
    toast.success(`Downloading invoice ${invoice.id}`);
    setShowActionsMenu(null);
  };

  const handleSendReminder = (invoice: Invoice) => {
    setShowActionsMenu(null);
  };

  const handleExport = () => {
    const csvContent = [
      [
        "Invoice ID",
        "Tenant",
        "Plan",
        "Amount",
        "Status",
        "Due Date",
        "Billing Period",
      ],
      ...filteredInvoices.map((inv) => [
        inv.id,
        inv.tenant_name,
        inv.tenant_plan,
        inv.amount.toString(),
        inv.status,
        formatDate(inv.due_date),
        inv.billing_period,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-${Date.now()}.csv`;
    a.click();
    toast.success("Invoices exported successfully");
  };

  const handleActionsClick = (invoiceId: number) => {
    setShowActionsMenu(showActionsMenu === invoiceId ? null : invoiceId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Track and manage tenant invoices</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-5 w-5" />
            Export
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={handleCreateInvoice}
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={
            dashboardStats?.data.summary.total_revenue.formatted || "SAR 0.00"
          }
          icon={DollarSign}
          trend={{
            value: dashboardStats?.data.summary.total_revenue.change || 0,
            isPositive:
              dashboardStats?.data.summary.total_revenue.isPositive || false,
          }}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatsCard
          title="Paid Invoices"
          value={
            dashboardStats?.data.summary.paid_invoices.count?.toString() || "0"
          }
          icon={CheckCircle}
          trend={{
            value: dashboardStats?.data.summary.paid_invoices.change || 0,
            isPositive:
              dashboardStats?.data.summary.paid_invoices.isPositive || false,
          }}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="Pending"
          value={dashboardStats?.data.summary.pending.formatted || "SAR 0.00"}
          icon={Clock}
          trend={{
            value: dashboardStats?.data.summary.pending.change || 0,
            isPositive:
              dashboardStats?.data.summary.pending.isPositive || false,
          }}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-100"
        />
        <StatsCard
          title="Overdue"
          value={dashboardStats?.data.summary.overdue.formatted || "SAR 0.00"}
          icon={AlertTriangle}
          trend={{
            value: dashboardStats?.data.summary.overdue.change || 0,
            isPositive:
              dashboardStats?.data.summary.overdue.isPositive || false,
          }}
          iconColor="text-red-600"
          iconBg="bg-red-100"
        />
      </div>

      {/* Filters */}
      <Card className="bg-white/90 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by tenant name or invoice ID..."
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
                  All Statuses ({statusCounts.all})
                </SelectItem>
                <SelectItem value="paid">Paid ({statusCounts.paid})</SelectItem>
                <SelectItem value="pending">
                  Pending ({statusCounts.pending})
                </SelectItem>
                <SelectItem value="overdue">
                  Overdue ({statusCounts.overdue})
                </SelectItem>
                <SelectItem value="cancelled">
                  Cancelled ({statusCounts.cancelled})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Showing {filteredInvoices.length} of {invoices?.length ?? 0}{" "}
              invoices
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="bg-white/90 backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {invoice.id}
                          </p>
                          <p className="text-sm text-gray-600">
                            {invoice.billing_period}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-900">
                        {invoice.tenant_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {invoice.tenant_plan}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-bold text-gray-900">
                        {invoice.amount}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={invoice.status} type="invoice" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(invoice.due_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(invoice)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActionsClick(invoice.id)}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                          {showActionsMenu === invoice.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                onClick={() => handleViewDetails(invoice)}
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                onClick={() => handleEditClick(invoice)}
                              >
                                <Edit className="w-4 h-4" />
                                Edit Invoice
                              </button>
                              <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                onClick={() => handleStatusChange(invoice)}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Change Status
                              </button>
                              {invoice.status === "pending" ||
                              invoice.status === "overdue" ? (
                                <button
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                  onClick={() => handleSendReminder(invoice)}
                                >
                                  <Send className="w-4 h-4" />
                                  Send Reminder
                                </button>
                              ) : null}
                              <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                onClick={() => handleDownload(invoice)}
                              >
                                <Download className="w-4 h-4" />
                                Download PDF
                              </button>
                              <div className="border-t border-gray-200 my-1"></div>
                              <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                onClick={() => handleDeleteClick(invoice)}
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Invoice Dialog */}
      <Dialog
        open={showCreateDialog || showEditDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          setShowEditDialog(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {showCreateDialog ? "Create New Invoice" : "Edit Invoice"}
            </DialogTitle>
            <DialogDescription>
              {showCreateDialog
                ? "Generate a new invoice for a tenant"
                : "Update invoice details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tenant">Tenant *</Label>
                <Select
                  value={formData.tenantId}
                  onValueChange={(value) => {
                    const tenant = tenants.find((t) => String(t.id) === value);
                    setFormData({
                      ...formData,
                      tenantId: value,
                      tenantName: tenant?.companyName || "",
                      planName: tenant?.planName || "",
                      amount: tenant?.mrr || 0,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants?.map((tenant) => (
                      <SelectItem key={tenant.id} value={String(tenant.id)}>
                        {" "}
                        {/* ✅ String value */}
                        {tenant.companyName} - {tenant.planName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingPeriod">Billing Period *</Label>
                <Input
                  id="billingPeriod"
                  value={formData.billingPeriod}
                  onChange={(e) =>
                    setFormData({ ...formData, billingPeriod: e.target.value })
                  }
                  placeholder="e.g., January 2024"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    ر.س
                  </span>
                  <Input
                    id="amount"
                    type="text" // ✅ Text input
                    value={formData.amount || ""} // ✅ String value
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dueDate: new Date(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes or comments"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={
                showCreateDialog ? handleSubmitCreate : handleUpdateInvoice
              }
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {showCreateDialog ? "Create Invoice" : "Update Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              Complete information about this invoice
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6 py-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Receipt className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedInvoice.id}
                  </h3>
                  <p className="text-gray-600">
                    {selectedInvoice.billing_period}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge
                      status={selectedInvoice.status}
                      type="invoice"
                    />
                    <span className="text-sm text-gray-600">
                      {selectedInvoice.status === "paid" &&
                      selectedInvoice.paid_date
                        ? `Paid on ${formatDate(selectedInvoice.paid_date)}`
                        : `Due ${formatDate(selectedInvoice?.paid_date)}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Tenant Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Company</p>
                      <p className="font-medium text-gray-900">
                        {selectedInvoice.tenant_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Plan</p>
                      <p className="font-medium text-gray-900">
                        {selectedInvoice.tenant_plan}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Invoice Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(selectedInvoice.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Issue Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(selectedInvoice.issue_date)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedInvoice.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">
                      {selectedInvoice.notes}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDownload(selectedInvoice)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDetailsDialog(false);
                    handleEditClick(selectedInvoice);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Invoice
                </Button>
                {selectedInvoice.status !== "paid" && (
                  <Button
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      updateInvoiceStatus(selectedInvoice.id, "paid");
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Invoice Status</DialogTitle>
            <DialogDescription>
              Update the status of invoice {selectedInvoice?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Status Select */}
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as InvoiceStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ✅ NEW NOTES FIELD */}
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Payment received via bank transfer, etc."
                rows={3}
              />
            </div>

            {/* Conditional Messages */}
            {newStatus === "paid" && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  This invoice will be marked as paid and the paid date will be
                  set to today.
                </p>
              </div>
            )}
            {newStatus === "cancelled" && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <XCircle className="w-4 h-4 inline mr-2" />
                  This action will cancel the invoice. This cannot be undone.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowStatusDialog(false);
                setNewStatus("pending");
                setStatusNotes(""); // ✅ Reset notes
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmStatusChange}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Invoice
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice{" "}
              <strong>{selectedInvoice?.id}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              This will permanently delete the invoice for{" "}
              <strong>{selectedInvoice?.tenant_name}</strong> (
              {formatCurrency(selectedInvoice?.amount || 0)}). This action
              cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
