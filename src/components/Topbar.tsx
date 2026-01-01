import { Bell, LogOut, User, Menu } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

interface TopbarProps {
  mobileMenuOpen?: boolean
  setMobileMenuOpen?: (open: boolean) => void
}

export default function Topbar({ mobileMenuOpen, setMobileMenuOpen }: TopbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/90 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen?.(!mobileMenuOpen)}
        className="lg:hidden -m-2.5 p-2.5 text-gray-700 hover:text-gray-900"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          <h2 className="text-sm sm:text-xl font-semibold text-gray-900 truncate">
            Super Admin
          </h2>
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
            onClick={() => navigate("/notifications")}
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
            aria-hidden="true"
          />

          {/* Profile */}
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-x-2 sm:gap-x-3 hover:bg-gray-100 rounded-lg p-1 sm:p-2 transition-colors"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-900">
                {user?.full_name}
              </p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
              {localStorage.getItem("profilePicture") ? (
                <img
                  src={localStorage.getItem("profilePicture")!}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              )}
            </div>
          </button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900 p-2"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="ml-2 hidden md:inline">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
