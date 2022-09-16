import { leftPad } from './formatting'
import { range } from './numeric'

export function xtickLabelFormatter(str: any) {
  const d = new Date(str * 1000)
  const monthMap = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = monthMap[d.getUTCMonth()]
  const day = leftPad(d.getUTCDate(), 2, '0')
  const res = `${month} ${day}`
  return res
}

export function calculateWeeklyTicks(start: number, stop: number) {
  const one_week = 60 * 60 * 24 * 7
  const three_days = 60 * 60 * 24 * 3
  const rstop = stop
  const rstart = Math.ceil(start / one_week) * one_week + three_days
  let xticks = range(rstart, rstop, one_week)
  xticks.push(start)
  xticks.push(stop)
  xticks = Array.from(new Set(xticks)).sort()
  return xticks
}

export function calculateMonthlyTicks(start: number, stop: number) {
  let xticks = [start, stop]
  const startDate = new Date(start * 1000)
  const stopDate = new Date(stop * 1000)
  const d = new Date(0)
  d.setUTCFullYear(startDate.getUTCFullYear())
  d.setUTCMonth(startDate.getUTCMonth() + 1)
  while (d.getTime() < stopDate.getTime()) {
    // push
    xticks.push(d.getTime() / 1000)
    // roll over year
    if (d.getUTCMonth() == 11) {
      d.setUTCFullYear(d.getUTCFullYear() + 1)
      d.setUTCMonth(0)
    }
    // next month same year
    else {
      d.setUTCMonth(d.getUTCMonth() + 1)
    }
  }
  xticks = Array.from(new Set(xticks)).sort()
  return xticks
}
