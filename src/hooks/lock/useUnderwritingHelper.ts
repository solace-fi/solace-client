import { ERC20_ABI } from '@solace-fi/sdk-nightly'
import { BigNumber, Contract } from 'ethers'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PoolTokenInfo } from '../../constants/types'
import { useProvider } from '../../context/ProviderManager'
import fluxMegaOracleABI from '../../constants/abi/FluxMegaOracle.json'

import { ZERO, ZERO_ADDRESS } from '@solace-fi/sdk-nightly'
import { useMemo } from 'react'
import { TokenData } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'
import { floatUnits } from '../../utils/formatting'

export const useUwe = () => {
  const { keyContracts } = useContracts()
  const { uwe } = useMemo(() => keyContracts, [keyContracts])

  const isPaused = useCallback(async (): Promise<boolean> => {
    if (!uwe) return true
    try {
      const isPaused = await uwe.isPaused()
      return isPaused
    } catch (error) {
      console.error(error)
      return true
    }
  }, [uwe])

  /**
   * @notice Calculates the amount of `UWE` minted for an amount of UWP deposited.
   * @param uwpAmount The amount of UWP to deposit.
   * @return uweAmount The amount of `UWE` that will be minted to the receiver.
   */
  const calculateDeposit = useCallback(
    async (uwpAmount: BigNumber): Promise<BigNumber> => {
      if (!uwe) return ZERO
      try {
        const calculateDeposit = await uwe.calculateDeposit(uwpAmount)
        return calculateDeposit
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [uwe]
  )

  /**
   * @notice Calculates the amount of UWP returned for an amount of `UWE` withdrawn.
   * @param uweAmount The amount of `UWE` to redeem.
   * @return uwpAmount The amount of UWP that will be returned to the receiver.
   */
  const calculateWithdraw = useCallback(
    async (uweAmount: BigNumber): Promise<BigNumber> => {
      if (!uwe) return ZERO
      try {
        const calculateWithdraw = await uwe.calculateWithdraw(uweAmount)
        return calculateWithdraw
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [uwe]
  )

  const totalSupply = useCallback(async (): Promise<BigNumber> => {
    if (!uwe) return ZERO
    try {
      const totalSupply = await uwe.totalSupply()
      return totalSupply
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }, [uwe])

  return {
    isPaused,
    calculateDeposit,
    calculateWithdraw,
    totalSupply,
  }
}

export const useUwp = () => {
  const { keyContracts } = useContracts()
  const { uwp } = useMemo(() => keyContracts, [keyContracts])

  const tokensLength = useCallback(async (): Promise<BigNumber> => {
    if (!uwp) return ZERO
    try {
      const tokensLength = await uwp.tokensLength()
      return tokensLength
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }, [uwp])

  const tokenData = useCallback(
    async (tokenAddr: string): Promise<TokenData> => {
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
    },
    [uwp]
  )

  const tokenList = useCallback(
    async (index: BigNumber): Promise<TokenData> => {
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
    },
    [uwp]
  )

  const isPaused = useCallback(async (): Promise<boolean> => {
    if (!uwp) return true
    try {
      const isPaused = await uwp.isPaused()
      return isPaused
    } catch (error) {
      console.error(error)
      return true
    }
  }, [uwp])

  const valueOfPool = useCallback(async (): Promise<BigNumber> => {
    if (!uwp) return ZERO
    try {
      const valueOfPool = await uwp.valueOfPool()
      return valueOfPool
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }, [uwp])

  /**
   * @notice Calculates the value of an amount of `UWP` shares in `USD`.
   * @param shares The amount of shares to query.
   * @return valueInUSD The value of the shares in `USD` with 18 decimals.
   */

  const valueOfShares = useCallback(
    async (shares: BigNumber): Promise<BigNumber> => {
      if (!uwp) return ZERO
      try {
        const valuePerShare = await uwp.valueOfShares(shares)
        return valuePerShare
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [uwp]
  )

  /**
   * @notice Calculates the value of a holders `UWP` shares in `USD`.
   * @param holder The holder to query.
   * @return valueInUSD The value of the users shares in `USD` with 18 decimals.
   */

  const valueOfHolder = useCallback(
    async (holder: string): Promise<BigNumber> => {
      if (!uwp) return ZERO
      try {
        const valueOfHolder = await uwp.valueOfHolder(holder)
        return valueOfHolder
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [uwp]
  )

  /**
   * @notice Determines the amount of tokens that would be minted for a given deposit.
   * @param depositTokens The list of tokens to deposit.
   * @param depositAmounts The amount of each token to deposit.
   * @return amount The amount of `UWP` minted.
   */
  const calculateIssue = useCallback(
    async (depositTokens: string[], depositAmounts: BigNumber[]): Promise<BigNumber> => {
      if (!uwp) return ZERO
      try {
        const calculateIssue = await uwp.calculateIssue(depositTokens, depositAmounts)
        return calculateIssue
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [uwp]
  )

  /**
   * @notice Determines the amount of underlying tokens that would be received for an amount of `UWP`.
   * @param amount The amount of `UWP` to burn.
   * @return amounts The amount of each token received.
   */
  const calculateRedeem = useCallback(
    async (amount: BigNumber): Promise<BigNumber[]> => {
      if (!uwp) return []
      try {
        const calculateRedeem = await uwp.calculateRedeem(amount)
        return calculateRedeem
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [uwp]
  )

  return {
    tokensLength,
    tokenData,
    tokenList,
    isPaused,
    valueOfPool,
    valueOfShares,
    valueOfHolder,
    calculateIssue,
    calculateRedeem,
    uwp,
  }
}

export const useTokenHelper = () => {
  const { tokensLength, tokenList, uwp } = useUwp()
  const { provider } = useProvider()
  const [tokens, setTokens] = useState<PoolTokenInfo[]>([])
  const running = useRef(false)

  const [loading, setLoading] = useState(false)

  const getTokenList = useCallback(async () => {
    if (!uwp) return
    setLoading(true)
    const _tokensLength = await tokensLength()
    const len = _tokensLength.toNumber()
    const tokenData = []
    const tokenMetadata = []
    const oracleData = []
    for (let tokenID = 0; tokenID < len; ++tokenID) {
      const data = await tokenList(BigNumber.from(tokenID))
      tokenData.push(data)
      const token = new Contract(data.token, ERC20_ABI, provider)
      const metadata = await Promise.all([token.name(), token.symbol(), token.decimals(), token.balanceOf(uwp.address)])
      tokenMetadata.push(metadata)
      const oracle2 = new Contract(data.oracle, fluxMegaOracleABI, provider)
      oracleData.push(
        await Promise.all([
          oracle2.valueOfTokens(data.token, BigNumber.from(10).pow(metadata[2])), // one token
          oracle2.valueOfTokens(data.token, metadata[3]), // balance
        ])
      )
    }
    const res = []
    for (let tokenId = 0; tokenId < len; ++tokenId) {
      const poolTokenInfo: PoolTokenInfo = {
        name: tokenMetadata[tokenId][0],
        symbol: tokenMetadata[tokenId][1],
        decimals: tokenMetadata[tokenId][2],
        address: tokenData[tokenId].token,
        price: floatUnits(oracleData[tokenId][0], 18),
        balance: ZERO,
        poolBalance: oracleData[tokenId][1],
      }
      res.push(poolTokenInfo)
    }
    setTokens(res)
    setLoading(false)
  }, [uwp, provider, tokensLength, tokenList])

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
  const { valueOfShares, calculateRedeem } = useUwp()
  const { calculateWithdraw, totalSupply } = useUwe()

  const uweToTokens = useCallback(
    async (uwe: BigNumber) => {
      const _totalUweSupply = await totalSupply()
      if (uwe.gt(_totalUweSupply))
        return {
          depositTokens: [],
          usdValueOfUwpAmount: ZERO,
          successful: false,
        }
      const uwpAmount = await calculateWithdraw(uwe)
      const usdValueOfUwpAmount = await valueOfShares(uwpAmount)
      const depositTokens = await calculateRedeem(uwpAmount)
      return { depositTokens, usdValueOfUwpAmount, successful: true }
    },
    [calculateWithdraw, calculateRedeem, valueOfShares, totalSupply]
  )

  return { uweToTokens }
}
