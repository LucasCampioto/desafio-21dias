import day01 from './days/day-01.js'
import day02 from './days/day-02.js'
import day03 from './days/day-03.js'
import day04 from './days/day-04.js'
import day05 from './days/day-05.js'
import day06 from './days/day-06.js'
import day07 from './days/day-07.js'
import day08 from './days/day-08.js'
import day09 from './days/day-09.js'
import day10 from './days/day-10.js'
import day11 from './days/day-11.js'
import day12 from './days/day-12.js'
import day13 from './days/day-13.js'
import day14 from './days/day-14.js'
import day15 from './days/day-15.js'
import day16 from './days/day-16.js'
import day17 from './days/day-17.js'
import day18 from './days/day-18.js'
import day19 from './days/day-19.js'
import day20 from './days/day-20.js'
import day21 from './days/day-21.js'
import { getDayExplanation } from './day-explanations.js'

const days = [
  day01, day02, day03, day04, day05, day06, day07,
  day08, day09, day10, day11, day12, day13, day14,
  day15, day16, day17, day18, day19, day20, day21,
]

const daysWithExplanations = days.map((day) => ({
  ...day,
  explanation: getDayExplanation(day.id),
}))

export default days

export function getDayById(id) {
  return daysWithExplanations.find((d) => d.id === Number(id)) ?? null
}

export function getAllDays() {
  return days
}

export { getDayExplanation } from './day-explanations.js'

export function getDaysByWeek(week) {
  return days.filter((d) => d.week === week)
}
