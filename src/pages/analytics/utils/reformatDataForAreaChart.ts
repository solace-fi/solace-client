import { ReformattedData, TimestampedTokenNumberValues } from '../AnalyticsContext'
import { BlockData } from '../types/UWPData'

export const reformatDataForAreaChart = (blockDataArr: BlockData[]): ReformattedData => {
  if (!blockDataArr || blockDataArr.length == 0) return { output: [], allTokenKeys: [] }
  const now = Date.now() / 1000
  const daysCutOffPoint = 30
  const start = now - 60 * 60 * 24 * daysCutOffPoint // filter out data points by time
  const output = []
  const nonZeroBalanceMapping: { [key: string]: boolean } = {}
  let allTokenKeys: string[] = []

  for (let i = 1; i < blockDataArr.length; ++i) {
    const currData = blockDataArr[i]
    const timestamp = currData.timestamp
    if (timestamp < start) continue
    const tokens = currData.tokens
    // todo: vwave is taken out for now
    const tokenKeys = Object.keys(tokens).filter((key) => key.toLowerCase() !== 'vwave')
    allTokenKeys = tokenKeys.map((item) => item.toLowerCase())
    const usdArr = tokenKeys.map((key: string) => {
      const balance = Number(tokens[key].balance) - 0
      const price = Number(tokens[key].price) - 0
      const usd = balance * price
      if (usd > 0) nonZeroBalanceMapping[key.toLowerCase()] = true
      return usd
    })
    const newRow: TimestampedTokenNumberValues = {
      timestamp: parseInt(currData.timestamp.toString()),
    }
    tokenKeys.forEach((key, i) => {
      newRow[key.toLowerCase()] = usdArr[i]
    })
    const inf = tokenKeys.filter((key) => newRow[key.toLowerCase()] == Infinity).length > 0
    if (!inf) output.push(newRow)
  }

  // sort by timestamp and only add tokens that had non-zero balances
  const adjustedOutput = output
    .sort((a: TimestampedTokenNumberValues, b: TimestampedTokenNumberValues) => a.timestamp - b.timestamp)
    .map((oldRow) => {
      const newerRow: TimestampedTokenNumberValues = { timestamp: oldRow.timestamp }
      Object.keys(nonZeroBalanceMapping).forEach((key) => {
        newerRow[key.toLowerCase()] = oldRow[key.toLowerCase()]
      })
      return newerRow
    })
  const formattedData = { output: adjustedOutput, allTokenKeys }
  return formattedData
}
