import { ZERO } from '@solace-fi/sdk-nightly'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useContracts } from '../../context/ContractsManager'

export const useUwe = () => {
  const { keyContracts } = useContracts()
  const { uwe } = useMemo(() => keyContracts, [keyContracts])

  const isPaused = async (): Promise<boolean> => {
    if (!uwe) return true
    try {
      const isPaused = await uwe.isPaused()
      return isPaused
    } catch (error) {
      console.error(error)
      return true
    }
  }

  /**
   * @notice Calculates the amount of `UWE` minted for an amount of UWP deposited.
   * @param uwpAmount The amount of UWP to deposit.
   * @return uweAmount The amount of `UWE` that will be minted to the receiver.
   */
  const calculateDeposit = async (uwpAmount: BigNumber): Promise<BigNumber> => {
    if (!uwe) return ZERO
    try {
      const calculateDeposit = await uwe.calculateDeposit(uwpAmount)
      return calculateDeposit
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  /**
   * @notice Calculates the amount of UWP returned for an amount of `UWE` withdrawn.
   * @param uweAmount The amount of `UWE` to redeem.
   * @return uwpAmount The amount of UWP that will be returned to the receiver.
   */
  const calculateWithdraw = async (uweAmount: BigNumber): Promise<BigNumber> => {
    if (!uwe) return ZERO
    try {
      const calculateWithdraw = await uwe.calculateWithdraw(uweAmount)
      return calculateWithdraw
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  return {
    isPaused,
    calculateDeposit,
    calculateWithdraw,
  }
}
