import { NavLink } from 'react-router-dom'
import { BarChart3, Table2, TrendingUp, Settings as SettingsIcon, Cloud } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { isSupabaseConfigured } from '../../lib/supabase'
import VexelLogo from '../ui/VexelLogo'

interface Props {
  onLinkClick?: () => void
}

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/trades', label: 'Trades', icon: Table2 },
  { to: '/analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar({ onLinkClick }: Props) {
  const email = useAuthStore(s => s.email)

  return (
    <aside className="w-64 h-screen bg-neutral-900 border-r border-neutral-800 flex flex-col">
      <div className="p-5 border-b border-neutral-800">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <VexelLogo size={22} />
          VEXEL
        </h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-green-500/10 text-green-500 font-medium'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-neutral-800">
        {isSupabaseConfigured() && email ? (
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-500">
            <Cloud className="w-3 h-3 text-green-500" />
            {email}
          </div>
        ) : isSupabaseConfigured() ? (
          <NavLink to="/login"
            onClick={onLinkClick}
            className="flex items-center gap-2 px-3 py-2 text-xs text-neutral-500 hover:text-green-500 transition-colors rounded-lg">
            <Cloud className="w-3 h-3" />
            Sign in to sync
          </NavLink>
        ) : null}
      </div>
    </aside>
  )
}
