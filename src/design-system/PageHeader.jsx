export default function PageHeader({ badge, title, subtitle, dark = false, compact = false }) {
  return (
    <header className={compact ? 'mb-4' : 'mb-8 md:mb-12'}>
      {badge && <div className={compact ? 'mb-2' : 'mb-4'}>{badge}</div>}
      <h1
        className={`font-serif font-light leading-tight tracking-tight ${
          compact ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl lg:text-6xl'
        } ${dark ? 'text-beige' : 'text-stone-900'}`}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className={`max-w-2xl leading-relaxed ${
            compact ? 'mt-2 text-sm md:text-base' : 'mt-4 text-lg'
          } ${dark ? 'text-stone-300' : 'text-stone-600'}`}
        >
          {subtitle}
        </p>
      )}
    </header>
  )
}
