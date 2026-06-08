import { cn } from '../lib/utils'

const gradientBorderClass = 'bg-gradient-to-br from-[#FBFCD4] to-[#EBC8D6]'

export default function Textarea({
  label,
  className,
  wrapperClassName,
  variant = 'default',
  ...props
}) {
  const isGradient = variant === 'gradient'

  const textareaClassName = cn(
    'min-h-[120px] w-full resize-none overflow-y-auto px-5 py-4 focus:outline-none focus:ring-2',
    isGradient
      ? 'rounded-2xl bg-[#201d1b] text-beige placeholder:text-stone-500 focus:ring-[#FBFCD4]/25'
      : 'rounded-2xl border border-stone-300 bg-white/50 text-stone-900 placeholder:text-stone-500 backdrop-blur-sm focus:ring-stone-900/10',
    className,
  )

  return (
    <label className={cn('block w-full', wrapperClassName)}>
      {label && (
        <span
          className={cn(
            'mb-2 block text-sm font-medium',
            isGradient ? 'text-stone-400' : 'text-stone-600',
          )}
        >
          {label}
        </span>
      )}
      {isGradient ? (
        <div className={cn('rounded-2xl p-[1px]', gradientBorderClass)}>
          <textarea className={textareaClassName} {...props} />
        </div>
      ) : (
        <textarea className={textareaClassName} {...props} />
      )}
    </label>
  )
}
