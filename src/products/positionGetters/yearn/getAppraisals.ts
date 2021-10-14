import { BigNumber } from 'ethers'
import { queryNativeTokenBalance } from '../getBalances'

export const getAppraisals = async (tokens: any[], chainId: number): Promise<BigNumber[]> => {
  const appraisals: BigNumber[] = []
  for (const i in tokens) {
    const appraisal = await queryNativeTokenBalance(tokens[i], chainId)
    appraisals.push(appraisal)
  }
  return appraisals
}
