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

  const timeLeft = async (claimID: any): Promise<any> => {
    if (!claimsEscrow || !claimID) return
    try {
      const timeLeft = await claimsEscrow.timeLeft(claimID)
      console.log('timeLeft', timeLeft)
    } catch (err) {
      console.log('timeLeft', err)
    }
  }

  return { isWithdrawable, timeLeft }
}
