import { BigNumber } from 'ethers'
import { queryNativeTokenBalance } from '../getBalances'
import { getMainNetworkTokenAddress } from './getPositions'

export const getAppraisals = async (tokens: any[], chainId: number): Promise<BigNumber[]> => {
  const appraisals: BigNumber[] = []
  for (const i in tokens) {
    const appraisal = await queryNativeTokenBalance(tokens[i], chainId, getMainNetworkTokenAddress)
    appraisals.push(appraisal)
  }
  return appraisals
}
