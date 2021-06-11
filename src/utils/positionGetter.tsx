const MIN_RETRY_DELAY = 1000
const RETRY_BACKOFF_FACTOR = 2
const MAX_RETRY_DELAY = 10000

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

export const range = (stop: number) => {
  const arr = []
  for (let i = 0; i < stop; ++i) {
    arr.push(i)
  }
  return arr
}

export const equalsIgnoreCase = (baseString: string, compareString: string) => {
  return baseString.toUpperCase() === compareString.toUpperCase()
}

export const numberify = (number: any) => {
  if (typeof number == 'number') return number
  if (typeof number == 'string') return parseFloat(number)
  return number.toNumber() // hopefully bignumber
}
