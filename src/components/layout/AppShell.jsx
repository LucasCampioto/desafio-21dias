import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { NAV_ITEMS, APP_NAME } from '../../lib/constants'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'
import Button from '../../design-system/Button'
import BrowserNotificationScheduler from '../notifications/BrowserNotificationScheduler'

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-beige">
      <BrowserNotificationScheduler />

      <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-64 flex-col border-r border-stone-300/30 bg-beige-light/95 p-6 backdrop-blur-md lg:flex">
        <div className="mb-10 shrink-0">
          <p className="font-serif text-2xl font-light text-stone-900">{APP_NAME}</p>
          <p className="mt-1 text-sm text-stone-500">Olá, {user?.name}</p>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  isActive ? 'bg-stone-900 text-beige' : 'text-stone-600 hover:bg-stone-900/5',
                )
              }
            >
              <Icon icon={item.icon} width={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 shrink-0">
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-300/30 bg-beige/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <p className="font-serif text-lg text-stone-900">{APP_NAME}</p>
          <button type="button" onClick={handleLogout} className="text-sm text-stone-600">
            Sair
          </button>
        </header>

        <main className="flex-1 overflow-anchor-none pb-20 lg:pb-0">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-stone-300/30 bg-beige/95 backdrop-blur-md lg:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 py-3 text-xs',
                  isActive ? 'text-stone-900' : 'text-stone-500',
                )
              }
            >
              <Icon icon={item.icon} width={22} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
