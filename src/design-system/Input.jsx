import { useState } from 'react'
import { Icon } from '@iconify/react'
import { cn } from '../lib/utils'

const gradientBorderClass = 'bg-gradient-to-br from-[#FBFCD4] to-[#EBC8D6]'

export default function Input({
  label,
  className,
  wrapperClassName,
  variant = 'default',
  showPasswordToggle = false,
  type,
  ...props
}) {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const isGradient = variant === 'gradient'

  const inputType = showPasswordToggle ? (passwordVisible ? 'text' : 'password') : type

  const inputClassName = cn(
    'w-full px-5 py-3.5 transition-all focus:outline-none',
    showPasswordToggle && 'pr-12',
    isGradient
      ? 'rounded-full bg-[#201d1b] text-beige placeholder:text-stone-500 focus:ring-2 focus:ring-[#FBFCD4]/25'
      : 'rounded-full border border-stone-300 bg-white/50 text-stone-900 placeholder:text-stone-500 backdrop-blur-sm focus:ring-2 focus:ring-stone-900/10',
    className,
  )

  const inputElement = <input type={inputType} className={inputClassName} {...props} />

  const field = showPasswordToggle ? (
    <div className="relative">
      {inputElement}
      <button
        type="button"
        tabIndex={-1}
        aria-label={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
        onClick={() => setPasswordVisible((v) => !v)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 transition-colors hover:text-stone-800"
      >
        <Icon
          icon={passwordVisible ? 'solar:eye-closed-linear' : 'solar:eye-linear'}
          width={22}
        />
      </button>
    </div>
  ) : (
    inputElement
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
        <div className={cn('rounded-full p-[1px]', gradientBorderClass)}>{field}</div>
      ) : (
        field
      )}
    </label>
  )
}
