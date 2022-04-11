import { useWallet } from '../../context/WalletManager'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { Contract } from '@ethersproject/contracts'
import { useCachedData } from '../../context/CachedDataManager'
import { queryName, queryDecimals, querySymbol } from '../../utils/contract'
import { ReadToken } from '../../constants/types'
import { hasApproval } from '../../utils'
import { withBackoffRetries } from '../../utils/time'

export const useTokenAllowance = (
  tokenContract: Contract | null,
  spender: string | null,
  parsedAmount: string
): boolean => {
  const { library, account } = useWallet()
  const { version } = useCachedData()
  const [allowance, setAllowance] = useState<string>('0')
  const approval = useMemo(() => hasApproval(allowance, parsedAmount), [parsedAmount, allowance])

  const checkAllowance = async () => {
    try {
      if (!library || !account || !tokenContract || !spender) return
      const _allowance = await withBackoffRetries(async () => tokenContract.allowance(account, spender))
      setAllowance(_allowance.toString())
    } catch (err) {
      console.log('checkAllowance', err)
    }
  }

  useEffect(() => {
    checkAllowance()
  }, [tokenContract, spender, parsedAmount, account, library, version])

  return approval
}

export const useReadToken = (tokenContract: Contract | null | undefined): ReadToken => {
  const { library } = useWallet()
  const [readToken, setReadToken] = useState<ReadToken>({ name: '', decimals: 0, symbol: '', address: '' })

  const callReadToken = useCallback(async () => {
    try {
      if (!tokenContract || !library) return
      const [name, decimals, symbol] = await Promise.all([
        queryName(tokenContract, library),
        queryDecimals(tokenContract),
        querySymbol(tokenContract, library),
      ])
      return {
        name,
        decimals,
        symbol,
        address: tokenContract.address,
      }
    } catch (err) {
      console.log('callReadToken', err)
    }
  }, [tokenContract, library])

  useEffect(() => {
    const doCallReadToken = async () => {
      const token = await callReadToken()
      if (token) setReadToken(token)
    }
    doCallReadToken()
  }, [callReadToken])

  return readToken
}
