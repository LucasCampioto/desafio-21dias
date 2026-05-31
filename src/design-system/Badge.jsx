import { cn } from '../lib/utils'

const variants = {
  default:
    'border-stone-400/30 bg-stone-100/20 text-stone-700',
  accent: 'border-lime-hover/50 bg-lime font-medium text-stone-900',
  dark: 'border-white/20 bg-stone-900/40 text-beige',
}

export default function Badge({ children, pulse = false, variant = 'default', className }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm backdrop-blur-sm',
        variants[variant],
        className,
      )}
    >
      {pulse && <span className="h-2 w-2 animate-pulse rounded-full bg-green-600" />}
      {children}
    </div>
  )
}
