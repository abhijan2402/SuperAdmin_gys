import { useState, useEffect } from "react";
import { mockInvoices } from "@/services/mockData";
import type { Invoice, InvoiceFormData, InvoiceStatus } from "@/types/invoice";
import { toast } from "sonner";
import {
  useCreateInvoicesMutation,
  useDeleteInvoiceItemMutation,
  useGetinvoiceDashboardQuery,
  useGetinvoiceQuery,
  useUpdateInvoicesMutation,
  useUpdateInvoicesStatusMutation,
} from "@/redux/api/invoiceApi";

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const { data: dashboardStats } = useGetinvoiceDashboardQuery("");

  const { data, isLoading, refetch } = useGetinvoiceQuery({});
  const [createInvoices] = useCreateInvoicesMutation();
  const [updateInvoices] = useUpdateInvoicesMutation();
  const [deleteInvoiceItem] = useDeleteInvoiceItemMutation();
  const [updateInvoicesStatus] = useUpdateInvoicesStatusMutation();

  useEffect(() => {
    setInvoices(data?.data);
  }, [data]);

  const createInvoice = async (formData: InvoiceFormData) => {
    try {
      const payload = {
        tenant_id: formData.tenantId,
        tenant_name: formData.tenantName,
        amount: formData.amount,
        billing_period: formData.billingPeriod,
        due_date: formData.dueDate.toISOString().split("T")[0],
        notes: formData.notes,
      };

      await createInvoices(payload).unwrap();
      toast.success("Invoice created successfully");
      refetch(); // Refresh list
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to create invoice");
    }
  };

  const updateInvoice = async (
    formData: InvoiceFormData,
    selectedInvoice: any
  ) => {
    if (!selectedInvoice) return;

    try {
      const payload = {
        tenant_id: formData.tenantId,
        tenant_name: formData.tenantName,
        amount: formData.amount,
        billing_period: formData.billingPeriod,
        due_date: formData.dueDate.toISOString().split("T")[0],
        notes: formData.notes,
      };

      await updateInvoices({
        id: selectedInvoice.id,
        payload,
      }).unwrap();
      toast.success("Invoice updated successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update invoice");
    }
  };

  const updateInvoiceStatus = async (payload: any, selectedInvoice: any) => {
    if (!selectedInvoice) return;
    await updateInvoicesStatus({
      id: selectedInvoice?.id,
      payload,
    }).unwrap();
    toast.success(`Invoice marked as ${status}`);
    refetch();
  };

  const deleteInvoice = async (selectedInvoice: any) => {
    await deleteInvoiceItem(selectedInvoice?.id).unwrap();
    toast.success("Invoice deleted successfully");
  };

  return {
    invoices,
    dashboardStats,
    isLoading,
    createInvoice,
    updateInvoice,
    updateInvoiceStatus,
    deleteInvoice,
  };
}
