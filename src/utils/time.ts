import { MIN_RETRY_DELAY, RETRY_BACKOFF_FACTOR, MAX_RETRY_DELAY, NUM_BLOCKS_PER_DAY } from '../constants'

export function timeAgo(someDateInThePast: number): string {
  const difference = Date.now() - someDateInThePast
  let result = ''

  if (difference < 5 * 1000) {
    return 'just now'
  } else if (difference < 90 * 1000) {
    return 'moments ago'
  }

  //it has minutes
  if ((difference % 1000) * 3600 > 0) {
    if (Math.floor((difference / 1000 / 60) % 60) > 0) {
      const s = Math.floor((difference / 1000 / 60) % 60) == 1 ? '' : 's'
      result = `${Math.floor((difference / 1000 / 60) % 60)} min${s} `
    }
  }

  //it has hours
  if ((difference % 1000) * 3600 * 60 > 0) {
    if (Math.floor((difference / 1000 / 60 / 60) % 24) > 0) {
      const s = Math.floor((difference / 1000 / 60 / 60) % 24) == 1 ? '' : 's'
      result = `${Math.floor((difference / 1000 / 60 / 60) % 24)} hr${s}${result == '' ? '' : ','} ` + result
    }
  }

  //it has days
  if ((difference % 1000) * 3600 * 60 * 24 > 0) {
    if (Math.floor(difference / 1000 / 60 / 60 / 24) > 0) {
      const s = Math.floor(difference / 1000 / 60 / 60 / 24) == 1 ? '' : 's'
      result = `${Math.floor(difference / 1000 / 60 / 60 / 24)} day${s}${result == '' ? '' : ','} ` + result
    }
  }

  return result + ' ago'
}

export const getTimesFromMillis = (millis: number) => {
  let seconds = parseInt((millis / 1000).toString())
  const days = parseInt((seconds / 86400).toString())
  seconds = seconds % 86400
  const hours = parseInt((seconds / 3600).toString())
  seconds = seconds % 3600
  const minutes = parseInt((seconds / 60).toString())
  seconds = seconds % 60

  return { days, hours, minutes, seconds }
}

export function getLongtimeFromMillis(millis: number): string {
  if (millis == 0) return '0'
  const { days, hours, minutes } = getTimesFromMillis(millis)

  let str = `${days > 0 ? `${days} day${days > 1 ? 's' : ''}` : ''}${hours > 0 ? ' ' : ''}${
    hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : ''
  }${minutes > 0 ? ' ' : ''}${minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`
  if (str == '') str = '< 1 minute'
  return str
}

export const getTimeFromMillis = (millis: number): string => {
  if (millis == 0) return '0'
  const { days, hours, minutes } = getTimesFromMillis(millis)

  let str = `${days > 0 ? `${days}d` : ''}${hours > 0 ? ' ' : ''}${hours > 0 ? `${hours}h` : ''}${
    minutes > 0 ? ' ' : ''
  }${minutes > 0 ? `${minutes}m` : ''}`
  if (str == '') str = '<1m'
  return str
}

export const getDaysLeftByBlockNum = (expirationBlock: number, latestBlockNumber: number): number => {
  return Math.floor((expirationBlock - latestBlockNumber) / NUM_BLOCKS_PER_DAY)
}

export const getDateStringWithMonthName = (date: Date): string => {
  return date.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'GMT' })
}

export const getDateExtended = (additionalDays: number): Date => {
  const date = new Date()
  return new Date(date.setDate(date.getDate() + additionalDays))
}

export const getExpiration = (days: number): string => {
  return getDateStringWithMonthName(getDateExtended(days))
}

export const withBackoffRetries = async (f: any, retryCount = 3, jitter = 250) => {
  let nextWaitTime = MIN_RETRY_DELAY
  let i = 0
  while (true) {
    try {
      return await f()
    } catch (error) {
      i++
      if (i >= retryCount) {
        throw error
      }
      await delay(nextWaitTime + Math.floor(Math.random() * jitter))
      nextWaitTime =
        nextWaitTime === 0 ? MIN_RETRY_DELAY : Math.min(MAX_RETRY_DELAY, RETRY_BACKOFF_FACTOR * nextWaitTime)
    }
  }
}

export const delay = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
