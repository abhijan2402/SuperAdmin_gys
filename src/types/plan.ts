export type BillingInterval = 'monthly' | 'yearly'

export interface PlanFeature {
  name: string
  included: boolean
  limit?: number
}

export interface Plan {
  id: string
  plan_name: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: PlanFeature[]
  maxUsers: number
  maxCustomers: number
  maxVisits: number
  isActive: boolean
  tenantsCount: number
  createdAt: Date
}

export interface PlanFormData {
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  maxUsers: number
  maxCustomers: number
  maxVisits: number
  isActive: boolean
  features: PlanFeature[]
}
