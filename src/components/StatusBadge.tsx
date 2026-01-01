import { Badge } from '@/components/ui/badge'
import type { TenantStatus } from '@/types/tenant'
import type { InvoiceStatus } from '@/types/invoice'
import type { TicketStatus } from '@/types/ticket'
import type { HealthStatus } from '@/types/usage'

interface StatusBadgeProps {
  status: TenantStatus | InvoiceStatus | TicketStatus | HealthStatus | string
  type?: 'tenant' | 'invoice' | 'ticket' | 'health'
}

export default function StatusBadge({ status, type = 'tenant' }: StatusBadgeProps) {
  const getVariant = () => {
    const statusLower = status.toLowerCase()
    
    // Tenant status
    if (type === 'tenant') {
      switch (statusLower) {
        case 'active':
          return 'success'
        case 'trial':
          return 'warning'
        case 'suspended':
        case 'cancelled':
          return 'destructive'
        default:
          return 'default'
      }
    }
    
    // Invoice status
    if (type === 'invoice') {
      switch (statusLower) {
        case 'paid':
          return 'success'
        case 'pending':
          return 'warning'
        case 'overdue':
        case 'cancelled':
          return 'destructive'
        default:
          return 'default'
      }
    }
    
    // Ticket status
    if (type === 'ticket') {
      switch (statusLower) {
        case 'resolved':
        case 'closed':
          return 'success'
        case 'in_progress':
          return 'warning'
        case 'open':
          return 'default'
        default:
          return 'default'
      }
    }
    
    // Health status
    if (type === 'health') {
      switch (statusLower) {
        case 'healthy':
          return 'success'
        case 'warning':
          return 'warning'
        case 'critical':
          return 'destructive'
        default:
          return 'default'
      }
    }
    
    return 'default'
  }

  const formatStatus = (s: string) => {
    return s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <Badge variant={getVariant()}>
      {formatStatus(status)}
    </Badge>
  )
}
