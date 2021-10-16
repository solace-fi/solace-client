import { NetworkConfig, Token } from '../../../constants/types'
import { ETHERSCAN_API_KEY } from '../../../constants'
import ierc20Json from '../_contracts/IERC20Metadata.json'
import { getContract } from '../../../utils'
import { ZERO } from '../../../constants'

export const getTokens = async (provider: any, activeNetwork: NetworkConfig, metadata?: any): Promise<Token[]> => {
  const tokens: Token[] = []
  if (!metadata.user) return []
  const url = `https://api.etherscan.io/api?module=account&action=tokennfttx&address=${
    metadata.user
  }&startblock=0&endblock=latest&apikey=${String(ETHERSCAN_API_KEY)}`

  const touchedUniV3Addresses = await fetch(url)
    .then((res) => res.json())
    .then((result) => result.result)
    .then((result) => {
      if (result != 'Max rate limit reached')
        return result.filter((r: any) => r.tokenSymbol == 'UNI-V3-POS').map((r: any) => r.contractAddress)
      return []
    })

  const uniqueUniV3Addresses = touchedUniV3Addresses.filter(
    (item: string, index: number) => touchedUniV3Addresses.indexOf(item) == index
  )

  console.log(uniqueUniV3Addresses)
  return []
}
