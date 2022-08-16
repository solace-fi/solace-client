import { ZERO, ZERO_ADDRESS } from '@solace-fi/sdk-nightly'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { TokenData } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'

export const useUwp = () => {
  const { keyContracts } = useContracts()
  const { uwp } = useMemo(() => keyContracts, [keyContracts])

  const tokensLength = async (): Promise<BigNumber> => {
    if (!uwp) return ZERO
    try {
      const tokensLength = await uwp.tokensLength()
      return tokensLength
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  const tokenData = async (tokenAddr: string): Promise<TokenData> => {
    const res = {
      token: ZERO_ADDRESS,
      oracle: ZERO_ADDRESS,
      min: ZERO,
      max: ZERO,
    }
    if (!uwp) return res
    try {
      const tokenData = await uwp.tokenData(tokenAddr)
      return tokenData
    } catch (error) {
      console.error(error)
      return res
    }
  }

  const tokenList = async (index: BigNumber): Promise<TokenData> => {
    const res = {
      token: ZERO_ADDRESS,
      oracle: ZERO_ADDRESS,
      min: ZERO,
      max: ZERO,
    }
    if (!uwp) return res
    try {
      const tokenList = await uwp.tokenList(index)
      return tokenList
    } catch (error) {
      console.error(error)
      return res
    }
  }

  const isPaused = async (): Promise<boolean> => {
    if (!uwp) return true
    try {
      const isPaused = await uwp.isPaused()
      return isPaused
    } catch (error) {
      console.error(error)
      return true
    }
  }

  const valueOfPool = async (): Promise<BigNumber> => {
    if (!uwp) return ZERO
    try {
      const valueOfPool = await uwp.valueOfPool()
      return valueOfPool
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  /**
   * @notice Calculates the value of one `UWP` in `USD`.
   * @return valueInUSD The value of one token in `USD` with 18 decimals.
   */
  const valuePerShare = async (): Promise<BigNumber> => {
    if (!uwp) return ZERO
    try {
      const valuePerShare = await uwp.valuePerShare()
      return valuePerShare
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  /**
   * @notice Determines the amount of tokens that would be minted for a given deposit.
   * @param depositTokens The list of tokens to deposit.
   * @param depositAmounts The amount of each token to deposit.
   * @return amount The amount of `UWP` minted.
   */
  const calculateIssue = async (depositTokens: string[], depositAmounts: BigNumber[]): Promise<BigNumber> => {
    if (!uwp) return ZERO
    try {
      const calculateIssue = await uwp.calculateIssue(depositTokens, depositAmounts)
      return calculateIssue
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }

  /**
   * @notice Determines the amount of underlying tokens that would be received for an amount of `UWP`.
   * @param amount The amount of `UWP` to burn.
   * @return amounts The amount of each token received.
   */
  const calculateRedeem = async (amount: BigNumber): Promise<BigNumber[]> => {
    if (!uwp) return []
    try {
      const calculateRedeem = await uwp.calculateRedeem(amount)
      return calculateRedeem
    } catch (error) {
      console.error(error)
      return []
    }
  }

  return {
    tokensLength,
    tokenData,
    tokenList,
    isPaused,
    valueOfPool,
    valuePerShare,
    calculateIssue,
    calculateRedeem,
  }
}
