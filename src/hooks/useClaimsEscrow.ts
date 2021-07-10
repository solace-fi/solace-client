import { BigNumber, BigNumberish } from 'ethers'
import { useContracts } from '../context/ContractsManager'

export const useClaimsEscrow = () => {
  const { claimsEscrow } = useContracts()

  const isWithdrawable = async (claimID: any): Promise<boolean> => {
    if (!claimsEscrow || !claimID) return false
    try {
      const isWithdrawable = await claimsEscrow.isWithdrawable(claimID)
      console.log('isWithdrawable', isWithdrawable)
      return isWithdrawable
    } catch (err) {
      console.log('isWithdrawable', err)
      return false
    }
  }

  /* snippet by Andrew for future dev
  const [claimInfo, cooldownPeriod] = await Promise.all([
  claimsEscrow.claims(claimID),
  claimsEscrow.cooldownPeriod()
  ]);
  const cooldownEndsAt = claimInfo.receivedAt + cooldownPeriod;
  */

  const timeLeft = async (claimID: BigNumberish): Promise<BigNumber | undefined> => {
    if (!claimsEscrow || !claimID) return
    try {
      const timeLeft = await claimsEscrow.timeLeft(claimID)
      console.log('timeLeft', timeLeft)
      return timeLeft
    } catch (err) {
      console.log('timeLeft', err)
    }
  }

  const listClaims = async (claimant: string): Promise<any> => {
    if (!claimsEscrow || !claimant) return
    try {
      const list = await claimsEscrow.listClaims(claimant)
      console.log('listClaims', list)
      return list
    } catch (err) {
      console.log('listClaims', err)
    }
  }

  return { isWithdrawable, timeLeft, listClaims }
}
