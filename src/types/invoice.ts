export type InvoiceStatus = "paid" | "pending" | "overdue" | "cancelled";

export interface Invoice {
  id: number;
  invoice_number: string | null;
  invoice_id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_plan: string;
  amount: string;
  billing_period: string;
  issue_date: string;
  due_date: string;
  paid_date: string | null;
  status: "paid" | "pending" | "overdue" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at: string;
  formatted_issue_date: string;
  formatted_due_date: string;
  formatted_paid_date: string | null;
  display_status: string;
  formatted_amount: string;
  status_color: string;
  is_overdue: number;
}

export interface InvoiceFormData {
  tenantId: string;
  amount: number;
  dueDate: Date;
  description: string;
  planName: string;
  tenantName: string;
  billingPeriod: string;
  notes?: string;
}
