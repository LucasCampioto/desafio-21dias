import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllDays } from '../../content'
import { weeks } from '../../data/weeks'
import DayCard from './DayCard'
import { cn } from '../../lib/utils'

function getWeekForDay(day) {
  if (!day || day <= 7) return 1
  if (day <= 14) return 2
  return 3
}

function countWeekProgress(weekDays, getStatus) {
  let completed = 0
  weekDays.forEach((d) => {
    if (getStatus(d.id) === 'completed') completed++
  })
  return completed
}

export default function WeekTimeline({ getStatus, currentDay, sessionId, isCompleted = false }) {
  const allDays = getAllDays()
  const [openWeek, setOpenWeek] = useState(() =>
    isCompleted ? null : getWeekForDay(currentDay),
  )

  useEffect(() => {
    if (isCompleted) {
      setOpenWeek(null)
      return
    }
    if (currentDay) {
      setOpenWeek(getWeekForDay(currentDay))
    }
  }, [currentDay, isCompleted, sessionId])

  const toggleWeek = (weekId) => {
    setOpenWeek((prev) => (prev === weekId ? null : weekId))
  }

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {weeks.map((week) => {
        const weekDays = allDays.filter((d) => d.week === week.id)
        const isOpen = openWeek === week.id
        const completedInWeek = countWeekProgress(weekDays, getStatus)

        return (
          <section
            key={week.id}
            className={cn(
              'overflow-hidden rounded-2xl border transition-colors duration-300',
              isOpen ? 'border-stone-600/50 bg-stone-900/40' : 'border-stone-700/30 bg-stone-900/20',
            )}
          >
            <button
              type="button"
              onClick={() => toggleWeek(week.id)}
              className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left md:px-6 md:py-6"
              aria-expanded={isOpen}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage">
                  {week.subtitle}
                </p>
                <h2 className="mt-2 font-serif text-3xl font-light leading-tight text-beige md:text-4xl">
                  {week.title}
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-stone-400">
                  {week.description}
                </p>
                <p className="mt-3 text-xs text-stone-500">
                  {completedInWeek}/{weekDays.length} dias concluídos
                </p>
              </div>
              <div
                className={cn(
                  'mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300',
                  isOpen
                    ? 'border-lime/40 bg-lime/10 text-lime'
                    : 'border-stone-600/50 text-stone-400',
                )}
              >
                <Icon
                  icon="solar:alt-arrow-down-linear"
                  width={20}
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
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-stone-700/40 px-4 pb-6 pt-4 md:px-5">
                    {weekDays.map((day, index) => (
                      <DayCard
                        key={day.id}
                        day={day}
                        status={getStatus(day.id)}
                        currentDay={currentDay}
                        sessionId={sessionId}
                        isLast={index === weekDays.length - 1}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )
      })}
    </div>
  )
}
