import { BigNumber } from 'ethers'

export const rangeFrom1 = (stop: number): number[] => {
  const arr = []
  for (let i = 1; i <= stop; ++i) {
    arr.push(i)
  }
  return arr
}

export const rangeFrom0 = (stop: number): number[] => {
  const arr = []
  for (let i = 0; i < stop; ++i) {
    arr.push(i)
  }
  return arr
}

export const range = (start: number, stop: number, step = 1): number[] => {
  const arr = []
  for (let i = start; i < stop; i += step) arr.push(i)
  return arr
}

export const numberify = (number: any): number => {
  if (typeof number == 'number') return number
  if (typeof number == 'string') return parseFloat(number)
  return number.toNumber() // hopefully bignumber
}

export const decimals = (d: number): string => {
  let s = '1'
  for (let i = 0; i < d; ++i) {
    s = `${s}0`
  }
  return s
}

export const bnCmp = (x: BigNumber, y: BigNumber): number => {
  return x.eq(y) ? 0 : x.lt(y) ? 1 : -1
}
