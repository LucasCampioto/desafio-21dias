import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { NAV_ITEMS, APP_NAME, STORAGE_KEYS } from '../../lib/constants'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'
import Button from '../../design-system/Button'
import BrowserNotificationScheduler from '../notifications/BrowserNotificationScheduler'

function readCollapsedPreference() {
  const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED)
  if (stored === '1' || stored === '0') return stored === '1'
  return window.innerWidth < 1280
}

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(readCollapsedPreference)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, next ? '1' : '0')
      return next
    })
  }

  return (
    <div className="h-screen overflow-hidden bg-beige">
      <BrowserNotificationScheduler />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden h-screen flex-col border-r border-stone-300/30 bg-beige-light/95 backdrop-blur-md transition-[width] duration-200 md:flex',
          collapsed ? 'w-[4.5rem] px-2 py-4' : 'w-64 p-6',
        )}
      >
        <div className={cn('shrink-0', collapsed ? 'mb-6 flex justify-center' : 'mb-8 flex items-start justify-between gap-2')}>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-serif text-2xl font-light leading-tight text-stone-900">{APP_NAME}</p>
              <p className="mt-1 truncate text-sm text-stone-500">Olá, {user?.name}</p>
            </div>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            className="rounded-xl p-2 text-stone-600 transition-colors hover:bg-stone-900/5"
          >
            <Icon
              icon={collapsed ? 'solar:alt-arrow-right-linear' : 'solar:alt-arrow-left-linear'}
              width={20}
            />
          </button>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              aria-label={item.label}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center rounded-xl py-3 text-sm font-medium transition-colors',
                  collapsed ? 'justify-center px-2' : 'gap-3 px-4',
                  isActive ? 'bg-stone-900 text-beige' : 'text-stone-600 hover:bg-stone-900/5',
                )
              }
            >
              <Icon icon={item.icon} width={20} />
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        <div className={cn('mt-4 shrink-0', collapsed && 'flex justify-center')}>
          {collapsed ? (
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sair"
              title="Sair"
              className="rounded-xl p-2 text-stone-600 transition-colors hover:bg-stone-900/5"
            >
              <Icon icon="solar:logout-2-linear" width={20} />
            </button>
          ) : (
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Sair
            </Button>
          )}
        </div>
      </aside>

      <div
        className={cn(
          'flex h-screen min-w-0 flex-col transition-[padding] duration-200',
          collapsed ? 'md:pl-[4.5rem]' : 'md:pl-64',
        )}
      >
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-300/30 bg-beige/95 px-4 py-3 backdrop-blur-md md:hidden">
          <p className="font-serif text-lg text-stone-900">{APP_NAME}</p>
          <button type="button" onClick={handleLogout} className="text-sm text-stone-600">
            Sair
          </button>
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-auto pb-20 md:pb-0">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-stone-300/30 bg-beige/95 backdrop-blur-md md:hidden">
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
