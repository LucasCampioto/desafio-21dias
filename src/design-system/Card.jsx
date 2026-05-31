import { cn } from '../lib/utils'

const gradientBorderClass = 'bg-gradient-to-br from-[#FBFCD4] to-[#EBC8D6]'

export default function Card({ children, variant = 'light', className, ...props }) {
  const variants = {
    dark: 'bg-stone-900 border-stone-700 text-beige shadow-2xl',
    glass: 'bg-pale-yellow border-stone-300/40 text-stone-900 shadow-sm',
    immersive: 'bg-stone-900/80 border-white/10 text-beige backdrop-blur-xl shadow-2xl',
    accent: 'bg-lime border-lime-hover/40 text-stone-900 shadow-lg shadow-lime/15',
    fasting: 'bg-pale-blue border-stone-400/25 text-stone-900 shadow-md',
    panel: 'border-stone-300/40 bg-white/40 text-stone-900 backdrop-blur-md',
  }

  if (variant === 'light') {
    return (
      <div
        className={cn('rounded-3xl p-[1px] shadow-sm', gradientBorderClass, className)}
        {...props}
      >
        <div className="rounded-3xl bg-[#201d1b] p-6 md:p-8">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('rounded-3xl border p-6 md:p-8', variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  )
}
