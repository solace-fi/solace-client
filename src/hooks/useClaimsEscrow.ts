import { BigNumber } from 'ethers'
import { useContracts } from '../context/ContractsManager'

export const useClaimsEscrow = () => {
  const { claimsEscrow } = useContracts()

  const isWithdrawable = async (claimID: any): Promise<boolean> => {
    if (!claimsEscrow || !claimID) return false
    try {
      const isWithdrawable = await claimsEscrow.isWithdrawable(claimID)
      return isWithdrawable
    } catch (err) {
      console.log('isWithdrawable', err)
      return false
    }
  }

  const timeLeft = async (claimID: any): Promise<BigNumber | undefined> => {
    if (!claimsEscrow || !claimID) return
    try {
      const timeLeft = await claimsEscrow.timeLeft(claimID)
      return timeLeft.toString()
    } catch (err) {
      console.log('timeLeft', err)
    }
  }

  const listClaims = async (claimant: string): Promise<any> => {
    if (!claimsEscrow || !claimant) return
    try {
      const list = await claimsEscrow.listClaims(claimant)
      return list
    } catch (err) {
      console.log('listClaims', err)
    }
  }

  const getCooldownPeriod = async (): Promise<string> => {
    if (!claimsEscrow) return '-'
    try {
      const cooldown = await claimsEscrow.cooldownPeriod()
      return cooldown.toString()
    } catch (err) {
      console.log('getCooldownPeriod', err)
      return '-'
    }
  }

  const getClaimDetails = async (claimant: string): Promise<any> => {
    if (!claimsEscrow) return []
    try {
      const claimIds = await claimsEscrow.listClaims(claimant)
      const claimsDetails = []
      for (let i = 0; i < claimIds.length; i++) {
        const cooldown = await timeLeft(claimIds[i])
        const canWithdraw = await isWithdrawable(claimIds[i])
        const claim = await claimsEscrow.claims(claimIds[i])
        const amount = claim.amount
        claimsDetails.push({ id: claimIds[i].toString(), cooldown, canWithdraw, amount })
      }
      return claimsDetails
    } catch (err) {
      console.log('getClaimDetails', err)
      return []
    }
  }

  return { isWithdrawable, timeLeft, listClaims, getClaimDetails, getCooldownPeriod }
}
