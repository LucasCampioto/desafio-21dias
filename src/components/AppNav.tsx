import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, Sparkles, BarChart3 } from "lucide-react";

const items = [
  { to: "/", label: "Mural", icon: Home },
  { to: "/jornada", label: "Jornada", icon: Compass },
  { to: "/evolucao", label: "Evolução", icon: BarChart3 },
  { to: "/aurora", label: "Aurora", icon: Sparkles },
] as const;

export function AppNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {/* Desktop top bar */}
      <header className="hidden md:flex fixed top-4 left-1/2 z-40 -translate-x-1/2">
        <nav className="glass-strong rounded-full px-2 py-2 flex items-center gap-1">
          <Link to="/" className="px-4 py-2 font-display text-lg tracking-wide">
            <span className="text-aurora">Quantum</span>
          </Link>
          <span className="mx-1 h-6 w-px bg-border" />
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                  active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 glass-strong rounded-2xl p-2 flex justify-around">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== "/" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] transition ${
                active ? "bg-primary/15 text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
