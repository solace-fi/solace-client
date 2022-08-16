import { ERC20_ABI, rangeFrom0 } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, Contract } from 'ethers'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ReadToken } from '../../constants/types'
import { useProvider } from '../../context/ProviderManager'
import { queryBalance, queryDecimals, queryName, querySymbol } from '../../utils/contract'
import { useUwe } from './useUwe'
import { useUwp } from './useUwp'

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
