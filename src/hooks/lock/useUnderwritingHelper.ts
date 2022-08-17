import { ERC20_ABI, rangeFrom0 } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, Contract } from 'ethers'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ReadToken } from '../../constants/types'
import { useProvider } from '../../context/ProviderManager'
import { queryBalance, queryDecimals, queryName, querySymbol } from '../../utils/contract'

import { ZERO, ZERO_ADDRESS } from '@solace-fi/sdk-nightly'
import { useMemo } from 'react'
import { TokenData } from '../../constants/types'
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

export const useTokenHelper = () => {
  const { tokensLength, tokenList } = useUwp()
  const { provider } = useProvider()
  const { account } = useWeb3React()
  const [tokens, setTokens] = useState<(ReadToken & { balance: BigNumber })[]>([])
  const running = useRef(false)

  const [loading, setLoading] = useState(false)

  const getTokenList = useCallback(async () => {
    if (!account) return
    setLoading(true)
    const _tokensLength = await tokensLength()
    const indices = rangeFrom0(_tokensLength.toNumber())
    const _tokenList = await Promise.all(
      indices.map(async (i) => {
        return await tokenList(BigNumber.from(i))
      })
    )
    const addresses = _tokenList.map((token) => token.token)
    const contracts = addresses.map((address) => new Contract(address, ERC20_ABI, provider))
    const names = await Promise.all(addresses.map((addr, i) => queryName(contracts[i], provider)))
    const symbols = await Promise.all(addresses.map((addr, i) => querySymbol(contracts[i], provider)))
    const decimals = await Promise.all(addresses.map((addr, i) => queryDecimals(contracts[i])))
    const balances = await Promise.all(addresses.map((addr, i) => queryBalance(contracts[i], account)))
    const tokens = addresses.map((address, i) => ({
      address,
      name: names[i],
      symbol: symbols[i],
      decimals: decimals[i],
      balance: balances[i],
    }))
    setTokens(tokens)
    setLoading(false)
  }, [account, provider])

  useEffect(() => {
    const callTokenList = async () => {
      if (running.current) return
      running.current = true
      await getTokenList()
      running.current = false
    }
    callTokenList()
  }, [getTokenList])

  return { loading, tokens }
}

export const useBalanceConversion = () => {
  const { valuePerShare, calculateIssue, calculateRedeem } = useUwp()
  const { calculateDeposit, calculateWithdraw } = useUwe()

  const tokensToUwe = useCallback(async (depositTokens: string[], depositAmounts: BigNumber[]) => {
    const uwp = await calculateIssue(depositTokens, depositAmounts)
    const uwe = await calculateDeposit(uwp)
    return uwe
  }, [])

  const uweToTokens = useCallback(async (uwe: BigNumber) => {
    const uwp = await calculateWithdraw(uwe)
    const usdValueOfOneUwp = await valuePerShare()
    const usdValue = uwp.mul(usdValueOfOneUwp)
    const depositTokens = await calculateRedeem(uwp)
    return { depositTokens, usdValue }
  }, [])

  return { tokensToUwe, uweToTokens }
}
