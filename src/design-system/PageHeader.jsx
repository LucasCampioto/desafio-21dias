export default function PageHeader({ badge, title, subtitle, dark = false }) {
  return (
    <header className="mb-8 md:mb-12">
      {badge && <div className="mb-4">{badge}</div>}
      <h1
        className={`font-serif text-4xl font-light leading-tight tracking-tight md:text-5xl lg:text-6xl ${
          dark ? 'text-beige' : 'text-stone-900'
        }`}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className={`mt-4 max-w-2xl text-lg leading-relaxed ${
            dark ? 'text-stone-300' : 'text-stone-600'
          }`}
        >
          {subtitle}
        </p>
      )}
    </header>
  )
}
