// src/hooks/useLicense.ts
import { useState, useCallback } from 'react'
import type { LicenseInfo, InstallationPackage } from '@/types/tenant'

export function useLicense() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  // Generate a new license key
  const generateLicenseKey = useCallback((tenantId: string): string => {
    const year = new Date().getFullYear()
    const companyCode = tenantId.substring(0, 4).toUpperCase()
    const randomPart1 = Math.random().toString(36).substring(2, 6).toUpperCase()
    const randomPart2 = Math.random().toString(36).substring(2, 6).toUpperCase()
    const randomPart3 = Math.random().toString(36).substring(2, 6).toUpperCase()
    
    return `VTP-${year}-${companyCode}-${randomPart1}-${randomPart2}-${randomPart3}`
  }, [])

  // Generate license info
  const generateLicense = useCallback(async (
    tenantId: string,
    companyName: string,
    planName: string,
    maxUsers: number,
    features: string[]
  ): Promise<LicenseInfo> => {
    setIsGenerating(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const licenseKey = generateLicenseKey(tenantId)
    const issuedDate = new Date()
    const expiryDate = new Date()
    expiryDate.setFullYear(expiryDate.getFullYear() + 1) // 1 year validity

    const license: LicenseInfo = {
      licenseKey,
      tenantId,
      companyName,
      planName,
      issuedDate,
      expiryDate,
      maxUsers,
      features,
      status: 'active',
    }

    setIsGenerating(false)
    return license
  }, [generateLicenseKey])

  // Revoke a license
  const revokeLicense = useCallback(async (licenseKey: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`License revoked: ${licenseKey}`)
  }, [])

  // Validate a license
  const validateLicense = useCallback(async (licenseKey: string): Promise<{
    valid: boolean
    message: string
    expiresAt?: Date
  }> => {
    setIsValidating(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    setIsValidating(false)

    // Mock validation
    if (licenseKey.startsWith('VTP-')) {
      return {
        valid: true,
        message: 'License is valid and active',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      }
    }

    return {
      valid: false,
      message: 'Invalid license key format',
    }
  }, [])

  // Generate installation package
  const generateInstallationPackage = useCallback(async (
    tenantId: string,
    licenseKey: string,
    _companyName: string,
    _planName: string,
    adminEmail: string
  ): Promise<InstallationPackage> => {
    setIsDownloading(true)

    // Simulate package generation
    await new Promise(resolve => setTimeout(resolve, 2000))

    const tempPassword = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12)
    
    const installPackage: InstallationPackage = {
      tenantId,
      licenseKey,
      packageUrl: `https://downloads.visittrackingpro.com/packages/vtp-${tenantId}-v1.0.0.zip`,
      packageSize: '45.8 MB',
      version: '1.0.0',
      instructions: `
# Visit Tracking Pro - Self-Hosted Installation Guide

## Package Contents
- Backend API (Node.js)
- Frontend Application (React)
- Database Schema (PostgreSQL/MySQL)
- Configuration Templates
- Documentation

## System Requirements
- Node.js 18+ or 20+
- PostgreSQL 14+ or MySQL 8+
- 2GB RAM minimum (4GB recommended)
- 10GB disk space
- SSL certificate (recommended)

## Installation Steps

### 1. Upload Files
Extract the ZIP file to your server:
\`\`\`bash
unzip vtp-${tenantId}-v1.0.0.zip
cd vtp-installation
\`\`\`

### 2. Configure Database
Create a new database:
\`\`\`sql
CREATE DATABASE visittracking;
\`\`\`

### 3. Set Environment Variables
Copy .env.example to .env and configure:
\`\`\`bash
cp .env.example .env
nano .env
\`\`\`

Required variables:
\`\`\`
LICENSE_KEY=${licenseKey}
DATABASE_URL=postgresql://user:pass@localhost:5432/visittracking
JWT_SECRET=your-secret-key
ADMIN_EMAIL=${adminEmail}
ADMIN_PASSWORD=${tempPassword}
\`\`\`

### 4. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 5. Run Database Migrations
\`\`\`bash
npm run migrate
\`\`\`

### 6. Start the Application
\`\`\`bash
# Production mode
npm run start

# Or with PM2 (recommended)
pm2 start ecosystem.config.js
\`\`\`

### 7. Access Your Installation
Open: https://your-domain.com
Login: ${adminEmail}
Password: ${tempPassword}

**Important:** Change your password immediately after first login!

## Support
For installation assistance, contact: support@visittrackingpro.com
License Key: ${licenseKey}
      `.trim(),
      credentials: {
        adminEmail,
        temporaryPassword: tempPassword,
      },
    }

    setIsDownloading(false)
    return installPackage
  }, [])

  // Download installation package
  const downloadPackage = useCallback((packageUrl: string, filename: string) => {
    // Create a temporary link and trigger download
    const link = document.createElement('a')
    link.href = packageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  return {
    isGenerating,
    isDownloading,
    isValidating,
    generateLicense,
    revokeLicense,
    validateLicense,
    generateInstallationPackage,
    downloadPackage,
    generateLicenseKey,
  }
}
