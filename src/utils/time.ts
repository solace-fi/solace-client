import { NUM_BLOCKS_PER_DAY } from '../constants'

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
      result = `${Math.floor((difference / 1000 / 60) % 60)} minute${s} `
    }
  }

  //it has hours
  if ((difference % 1000) * 3600 * 60 > 0) {
    if (Math.floor((difference / 1000 / 60 / 60) % 24) > 0) {
      const s = Math.floor((difference / 1000 / 60 / 60) % 24) == 1 ? '' : 's'
      result = `${Math.floor((difference / 1000 / 60 / 60) % 24)} hour${s}${result == '' ? '' : ','} ` + result
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

export function timeToText(millis: number): string {
  const date = new Date(millis)
  let str = ''
  const days = date.getUTCDate() - 1
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const seconds = date.getUTCSeconds()

  if (days > 0) {
    if (days > 1) {
      str += days + ' days'
    } else {
      str += days + ' day'
    }
  }

  if (hours > 0) {
    if (days > 0) {
      str += ', '
    }
    if (hours > 1) {
      str += hours + ' hours'
    } else {
      str += hours + ' hour'
    }
  }

  if (minutes > 0) {
    if (hours > 0) {
      str += ', '
    }
    if (minutes > 1) {
      str += minutes + ' minutes'
    } else {
      str += minutes + ' minute'
    }
  }

  if (seconds > 0) {
    if (minutes > 0) {
      str += ', '
    }
    if (seconds > 1) {
      str += seconds + ' seconds'
    } else {
      str += seconds + ' second'
    }
  }

  return str
}

export function timer(millis: number): string {
  const date = new Date(millis)
  let str = ''
  const days = date.getUTCDate() - 1
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()

  if (days > 0) {
    str += days + 'd'
  }

  if (hours > 0) {
    if (days > 0) {
      str += ' '
    }
    str += hours + 'hr'
  }

  if (hours > 0) {
    str += ' '
  }
  str += minutes + 'm'

  return str
}

export const getDays = (expirationBlock: number, latestBlock: number): number => {
  return Math.floor((expirationBlock - latestBlock) / NUM_BLOCKS_PER_DAY)
}

export const getDateStringWithMonthName = (date: Date): string => {
  return date.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' })
}

export const getDateExtended = (additionalDays: number): Date => {
  const date = new Date()
  return new Date(date.setDate(date.getDate() + additionalDays))
}
