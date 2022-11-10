import { MassUwpDataPortfolio } from '../../../constants/types'
import { BlockData } from '../types/UWPData'

export const getPortfolioDetailData = (
  json: BlockData[],
  simulatedReturns: { [key: string]: number[] },
  tokenKeys: string[]
): MassUwpDataPortfolio[] => {
  if (!json || json.length == 0) return []
  const latestData = json[json.length - 1]
  const tokens = latestData.tokens
  const tokenDetails = tokenKeys.map((key: string) => {
    const balance = Number(tokens[key.toUpperCase()].balance) - 0
    const price = Number(tokens[key.toUpperCase()].price) - 0
    const usd = balance * price
    const _tokenDetails = {
      symbol: key.toLowerCase(),
      balance: balance,
      price: price,
      usdBalance: usd,
      weight: 0,
      simulation: simulatedReturns[key.toLowerCase()] ?? [],
    }
    return _tokenDetails
  })
  return tokenDetails
}
