export type AuditAction =
  | "tenant_created"
  | "tenant_updated"
  | "tenant_suspended"
  | "tenant_activated"
  | "plan_created"
  | "plan_updated"
  | "invoice_created"
  | "ticket_resolved"
  | "settings_updated"
  | "notification_sent";

export interface AuditLog {
  id: string;
  adminId: string;
  admin_name: string;
  action_type: AuditAction;
  entity_type: string;
  entity_id: string;
  entityName?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  formatted_created_at: Date;
  adminName?:string
  action?:string
}

export interface RecentActivity {
  id: string;
  log_id: string;
  entity_type: string;
  entity_id: string;
  action_type: string;
  admin_id: number;
  admin_role: string;
  admin_name: string;
  ip_address: string;
  details: string;
  timestamp: string;
  created_at: string;
  admin_username: string;
  formatted_timestamp: string;
}

export interface AuditOverview {
  total_logs: number;
  todays_activity: number;
  create_update_actions: number;
  critical_actions: number;
  entity_statistics: any[];
  recent_activities: RecentActivity[];
  period: string;
}

export interface AuditOverviewResponse {
  success: boolean;
  data: AuditOverview;
}
