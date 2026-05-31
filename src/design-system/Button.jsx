import { cn } from '../lib/utils'

const variants = {
  primary:
    'bg-stone-900 text-beige hover:bg-stone-800 shadow-xl shadow-stone-900/10',
  secondary:
    'bg-transparent border border-stone-800/20 text-stone-900 hover:bg-stone-800/5',
  accent:
    'bg-lime hover:bg-lime-hover text-stone-900 shadow-lg shadow-lime/10 hover:-translate-y-0.5',
  ghost: 'bg-white/20 backdrop-blur-md text-beige hover:bg-white/30',
  dark: 'bg-stone-800 text-beige hover:bg-stone-700',
}

const sizes = {
  sm: 'px-5 py-2.5 text-sm',
  md: 'px-8 py-4 text-base',
  lg: 'px-8 py-4 text-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  icon,
  iconRight,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-3 rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  )
}
