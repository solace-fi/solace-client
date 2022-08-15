import { ZERO, ZERO_ADDRESS } from '@solace-fi/sdk-nightly'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useContracts } from '../../context/ContractsManager'

export const useUwe = () => {
  const { keyContracts } = useContracts()
  const { uwe } = useMemo(() => keyContracts, [keyContracts])

  const issueFee = async (): Promise<BigNumber> => {
    if (!uwe) return ZERO
    try {
      const issueFee = await uwe.issueFee()
      return issueFee
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const issueFeeTo = async (): Promise<string> => {
    if (!uwe) return ZERO_ADDRESS
    try {
      const issueFeeTo = await uwe.issueFeeTo()
      return issueFeeTo
    } catch (error) {
      console.error(error)
      return ZERO_ADDRESS
    }
  }

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
    issueFee,
    issueFeeTo,
    isPaused,
    calculateDeposit,
    calculateWithdraw,
  }
}
