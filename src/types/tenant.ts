export type TenantStatus = 'active' | 'suspended' | 'trial' | 'cancelled'
export type DeploymentType = 'centralized' | 'self-hosted'
export type DatabaseType = 'postgresql' | 'mysql'

export interface Tenant {
  id: string
  companyName: string
  contactName: string
  contactEmail: string
  contactPhone: string
  status: TenantStatus
  planId: string
  planName: string
  subscriptionStart: Date
  subscriptionEnd: Date
  totalUsers: number
  activeUsers: number
  mrr: number // Monthly Recurring Revenue
  address?: string
  city?: string
  country?: string
  logoUrl?: string
  createdAt: Date
  lastActivity?: Date
  
  // NEW: Hybrid System Fields
  deploymentType: DeploymentType
  
  // For Self-Hosted Deployments
  licenseKey?: string
  instanceUrl?: string
  databaseType?: DatabaseType
  installationDate?: Date
  lastHeartbeat?: Date
  serverIp?: string
  serverStatus?: 'online' | 'offline' | 'unknown'
  
  // For Centralized Deployments  
  tenantDatabaseId?: string
  apiEndpoint?: string
}

export interface TenantFormData {
  companyName: string
  contactName: string
  contactEmail: string
  contactPhone?: string
  planId: string
  status?: TenantStatus
  totalUsers?: number
  activeUsers?: number
  mrr?: number
  address?: string
  city?: string
  country?: string
  
  // NEW: Deployment Configuration
  deploymentType: DeploymentType
  databaseType?: DatabaseType
  instanceUrl?: string
}

export interface LicenseInfo {
  licenseKey: string
  tenantId: string
  companyName: string
  planName: string
  issuedDate: Date
  expiryDate: Date
  maxUsers: number
  features: string[]
  status: 'active' | 'expired' | 'revoked'
}

export interface InstallationPackage {
  tenantId: string
  licenseKey: string
  packageUrl: string
  packageSize: string
  version: string
  instructions: string
  credentials: {
    adminEmail: string
    temporaryPassword: string
  }
}
