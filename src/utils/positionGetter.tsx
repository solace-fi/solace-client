import { getNetworkName } from '../utils'

export async function getPositions(protocol: string, chainId: number, user: string): Promise<any> {
  return fetch(`https://paclas.solace.fi/positions/appraise/${protocol}/${getNetworkName(chainId)}/${user}`)
    .then((result) => result.json())
    .then((result) => {
      return result
    })
}
