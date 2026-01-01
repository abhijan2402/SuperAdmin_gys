# Visit Tracking Pro - Super Admin Dashboard

🚀 **Frontend-only** Super Admin dashboard for managing tenants, plans, invoices, support tickets, and system health.

## 📋 Features

- **Dashboard Overview** - Key metrics, charts, and recent activity
- **Tenant Management** - View, create, edit, suspend/activate tenants
- **Plan Management** - Manage subscription plans and pricing
- **Invoice Management** - Track payments, generate invoices
- **Usage & Health Monitoring** - Real-time tenant usage metrics
- **Support Tickets** - Handle tenant support requests
- **Notifications** - Send system-wide or targeted notifications
- **Audit Logs** - Track all admin actions
- **Settings** - Configure system settings and preferences

## 🎨 Design System

This Super Admin dashboard **matches the styling** of the main SaaS application:
- Same color scheme (blue/purple gradients)
- Same glassmorphism effects
- Same component library (Radix UI + Tailwind)
- Same animations (Framer Motion)
- Consistent typography and spacing

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Recharts** - Data visualization
- **Sonner** - Toast notifications

## 📦 Installation

```powershell
# Navigate to the super admin folder
cd "c:\Users\User\Desktop\Folders\Visit Tracking Pro\Rebuilt Saas Software\complete frontend superadmin"

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3010`

## 🔐 Demo Credentials

```
Email: superadmin@visittrackingpro.com
Password: SuperAdmin123!
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, Input, etc.)
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── Topbar.tsx      # Top navigation bar
│   ├── StatsCard.tsx   # Dashboard statistics card
│   ├── DataTable.tsx   # Generic data table
│   └── ...
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── TenantsPage.tsx
│   ├── PlansPage.tsx
│   ├── InvoicesPage.tsx
│   ├── UsageHealthPage.tsx
│   ├── SupportTicketsPage.tsx
│   ├── NotificationsPage.tsx
│   ├── AuditLogsPage.tsx
│   └── SettingsPage.tsx
├── layouts/            # Layout components
│   ├── AppLayout.tsx   # Main app layout (sidebar + content)
│   └── AuthLayout.tsx  # Login layout
├── context/            # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── ThemeContext.tsx # Theme (light/dark mode)
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useTenants.ts
│   ├── usePlans.ts
│   └── ...
├── services/           # API services (mock data for now)
│   └── mockData.ts
├── types/              # TypeScript type definitions
│   ├── tenant.ts
│   ├── plan.ts
│   ├── invoice.ts
│   └── ...
├── lib/                # Utilities
│   └── utils.ts
└── styles/             # Global styles
    └── index.css
```

## 🔄 Mock Data

All data is currently **mocked in the frontend** (`src/services/mockData.ts`). The application uses React state and local storage to simulate CRUD operations.

### Ready for Backend Integration

The architecture is designed for easy API integration:

1. **Hooks** (`src/hooks/`) - Replace mock data with real API calls
2. **Types** (`src/types/`) - Already defined for all entities
3. **Services** - Add Axios client similar to main SaaS app

Example migration:
```typescript
// Current (mock)
const { tenants } = useTenants()

// Future (real API)
const { tenants } = useTenants() // Same hook, different implementation
```

## 🎯 Key Features Explained

### 1. **Tenant Management**
- View all tenants in a searchable table
- Filter by status (active, suspended, trial, cancelled)
- Create new tenants with plan assignment
- Edit tenant details
- Suspend/activate tenants
- View detailed tenant profile with usage metrics

### 2. **Plan Management**
- View all subscription plans
- Create/edit plans with custom pricing
- Set feature limits (users, customers, visits)
- Track how many tenants use each plan
- Activate/deactivate plans

### 3. **Invoice Management**
- View all invoices with status filtering
- Generate invoices for tenants
- Track payment status (paid, pending, overdue)
- View billing history

### 4. **Usage & Health Monitoring**
- Real-time usage metrics for each tenant
- Health status indicators (healthy, warning, critical)
- Storage usage tracking
- API call monitoring
- System health dashboard

### 5. **Support Tickets**
- View all support tickets with filters
- Reply to tickets
- Change ticket status and priority
- View ticket history
- Assign tickets to admins

### 6. **Notifications**
- Create system-wide notifications
- Target specific tenants
- Notification types (info, success, warning, error)
- Mark notifications as read
- Notification history

### 7. **Audit Logs**
- Complete audit trail of all admin actions
- Filter by action type
- View IP addresses and user agents
- Export logs (future feature)

### 8. **Settings**
- Email notification preferences
- System-wide settings (maintenance mode, signups, etc.)
- Session timeout configuration
- Trial period defaults

## 🚀 Development Workflow

### Adding a New Feature

1. **Define Types** - Add TypeScript interfaces in `src/types/`
2. **Add Mock Data** - Update `src/services/mockData.ts`
3. **Create Hook** - Add custom hook in `src/hooks/`
4. **Build UI** - Create page component in `src/pages/`
5. **Add Route** - Update `src/routes.tsx`
6. **Add to Sidebar** - Update `src/components/Sidebar.tsx`

### Connecting to Real Backend

1. Create API client (similar to `base44Client.js` in main app)
2. Update hooks to use API instead of mock data
3. Add error handling and loading states
4. Update environment variables for API URL

Example:
```typescript
// src/services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
})

export const tenantsAPI = {
  getAll: () => api.get('/admin/tenants'),
  getById: (id: string) => api.get(`/admin/tenants/${id}`),
  create: (data: TenantFormData) => api.post('/admin/tenants', data),
  update: (id: string, data: Partial<Tenant>) => api.put(`/admin/tenants/${id}`, data),
  suspend: (id: string) => api.post(`/admin/tenants/${id}/suspend`),
}
```

## 🎨 Styling Guidelines

### Colors (matches main SaaS app)
- Primary: Blue (#3B82F6)
- Secondary: Purple (#8B5CF6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)

### Component Patterns
- Cards with `bg-white/90 backdrop-blur-xl` for glassmorphism
- Gradient backgrounds with animated blobs
- Rounded corners (`rounded-lg`, `rounded-xl`)
- Shadows (`shadow-sm`, `shadow-lg`, `shadow-2xl`)
- Hover effects with smooth transitions

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Sidebar collapses on mobile
- Tables adapt to card view on small screens

## 🔒 Security Notes

**Frontend Only - No Authentication Yet**

Current implementation:
- Mock login with hardcoded credentials
- Session stored in React Context
- No actual JWT tokens or backend validation

For production:
- Implement real authentication backend
- Use HTTP-only cookies or secure localStorage
- Add JWT token refresh logic
- Implement role-based access control (RBAC)
- Add CSRF protection

## 📝 TODO for Production

- [ ] Connect to real backend API
- [ ] Implement real authentication
- [ ] Add data validation with Zod
- [ ] Add loading skeletons
- [ ] Implement error boundaries
- [ ] Add unit tests (Vitest)
- [ ] Add E2E tests (Playwright)
- [ ] Optimize bundle size
- [ ] Add PWA support
- [ ] Implement i18n (internationalization)
- [ ] Add dark mode persistence
- [ ] Implement CSV/Excel export
- [ ] Add advanced filtering and sorting
- [ ] Implement real-time updates (WebSockets)

## 🤝 Contributing

This is a proprietary project. For questions or support, contact the development team.

## 📄 License

© 2024 Visit Tracking Pro. All rights reserved.
