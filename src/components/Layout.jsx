import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, TrendingUp, Coins, Briefcase, LogOut, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/stocks',    icon: TrendingUp,      label: 'Stocks'    },
  { to: '/gold',      icon: Coins,           label: 'Gold'      },
  { to: '/portfolio', icon: Briefcase,       label: 'Portfolio' },
]

export default function Layout() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-6 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center text-black font-bold font-display text-sm">
            ذ
          </div>
          <div>
            <span className="font-display font-bold text-white text-lg leading-none">Dhabab</span>
            <div className="text-white/30 text-[10px] tracking-widest uppercase">Gold & Stocks</div>
          </div>
        </div>
      </div>

      <nav className="px-3 flex-1 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 mt-auto border-t border-white/5">
        <div className="card p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold-400/20 flex items-center justify-center text-gold-400 text-xs font-semibold font-display">
            {(profile?.full_name || user?.email || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium truncate">
              {profile?.full_name || 'User'}
            </div>
            <div className="text-white/30 text-[10px] truncate">{user?.email}</div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-white/30 hover:text-red-400 transition-colors p-1 rounded-lg"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-surface-400 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-surface-300 border-r border-white/5 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-56 h-full bg-surface-300 border-r border-white/5">
            <button
              className="absolute top-4 right-4 text-white/50 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 bg-surface-300">
          <button onClick={() => setMobileOpen(true)} className="text-white/60">
            <Menu size={20} />
          </button>
          <span className="font-display font-bold text-white">Dhabab</span>
          <div className="w-6" />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 grid-pattern">
          <Outlet />
        </main>
      </div>
    </div>
  )
}