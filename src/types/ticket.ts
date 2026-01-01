export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface TicketReply {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: "tenant" | "super_admin";
  message: string;
  createdAt: Date;
  attachments?: string[];
}

export interface SupportTicket {
  id: string | number;
  ticket_id: string;
  tenantId?: string;
  tenant_name: string;
  tenant_email: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  sla_status: "within_sla" | "breached" | "warning" | "met";
  priority: "urgent" | "high" | "medium" | "low";
  category: string;
  created_by: string;
  assignedTo?: string | null;
  created_at: string;
  updated_at: string;
  createdAt?: Date;
  updatedAt?: Date;
  replies: TicketReply[];

  formatted_created_at?: string;
  formatted_updated_at?: string;
  reply_count?: number;
}
