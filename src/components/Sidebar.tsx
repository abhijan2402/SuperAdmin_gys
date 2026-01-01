import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  Package, 
  Activity, 
  MessageSquare, 
  Bell, 
  FileText, 
  Settings,
  Zap,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tenants', href: '/tenants', icon: Building2 },
  { name: 'Plans', href: '/plans', icon: Package },
  { name: 'Invoices', href: '/invoices', icon: CreditCard },
  { name: 'Usage & Health', href: '/usage', icon: Activity },
  { name: 'Support Tickets', href: '/support', icon: MessageSquare },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Audit Logs', href: '/audit-logs', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  mobileMenuOpen?: boolean
  setMobileMenuOpen?: (open: boolean) => void
}

export default function Sidebar({ mobileMenuOpen = false, setMobileMenuOpen }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/80 lg:hidden"
          onClick={() => setMobileMenuOpen?.(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 z-50 flex w-72 flex-col transition-transform duration-300 lg:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-blue-600 to-purple-700 px-6 pb-4">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Visit Tracking Pro</h1>
            <p className="text-blue-100 text-xs">Super Admin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        onClick={() => setMobileMenuOpen?.(false)}
                        className={cn(
                          isActive
                            ? 'bg-white/20 text-white shadow-lg'
                            : 'text-blue-100 hover:text-white hover:bg-white/10',
                          'group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-semibold transition-all duration-200'
                        )}
                      >
                        <item.icon
                          className={cn(
                            isActive ? 'text-white' : 'text-blue-200 group-hover:text-white',
                            'h-6 w-6 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-white/20 pt-4">
          <p className="text-xs text-blue-100 text-center">
            © 2024 Visit Tracking Pro
          </p>
        </div>
        </div>
      </div>
    </>
  )
}
