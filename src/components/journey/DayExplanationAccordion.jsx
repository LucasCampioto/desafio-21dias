import { useState } from 'react'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

function ExplanationSection({ section, isOpen, onToggle }) {
  return (
    <div className="border-b border-stone-700/40 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left md:px-6"
        aria-expanded={isOpen}
      >
        <span className="font-serif text-lg text-beige md:text-xl">{section.title}</span>
        <div
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-300',
            isOpen
              ? 'border-lime/40 bg-lime/10 text-lime'
              : 'border-stone-600/50 text-stone-400',
          )}
        >
          <Icon
            icon="solar:alt-arrow-down-linear"
            width={18}
            className={cn('transition-transform duration-300', isOpen && 'rotate-180')}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-5 pb-5 md:px-6 md:pb-6">
              {section.body && (
                <p className="text-sm leading-relaxed text-stone-300 md:text-base">{section.body}</p>
              )}

              {section.bullets?.length > 0 && (
                <ul className="space-y-2 pl-1">
                  {section.bullets.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-sm leading-relaxed text-stone-400 md:text-base"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.highlight && (
                <p className="rounded-2xl border border-lime/20 bg-lime/5 px-4 py-3 text-sm font-medium leading-relaxed text-lime md:text-base">
                  {section.highlight}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DayExplanationAccordion({ explanation }) {
  const [openSections, setOpenSections] = useState(() => new Set([0]))

  if (!explanation?.sections?.length) return null

  const toggleSection = (index) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-stone-700/40 bg-stone-900/30">
      <div className="border-b border-stone-700/40 px-5 py-5 md:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">
          Entenda este dia
        </p>
        <h2 className="mt-2 font-serif text-2xl font-light text-beige md:text-3xl">
          Por que este exercício importa
        </h2>
        <p className="mt-2 text-sm text-stone-400">
          Abra cada bloco para entender o propósito e o impacto deste dia.
        </p>
      </div>

      <div>
        {explanation.sections.map((section, index) => (
          <ExplanationSection
            key={section.title}
            section={section}
            isOpen={openSections.has(index)}
            onToggle={() => toggleSection(index)}
          />
        ))}
      </div>
    </section>
  )
}
