import { useEffect, useState, useMemo } from 'react'
import { Contract } from '@ethersproject/contracts'
import { useCachedData } from '../../context/CachedDataManager'
import { hasApproval } from '../../utils'
import { withBackoffRetries } from '../../utils/time'
import { useWeb3React } from '@web3-react/core'
import { useProvider } from '../../context/ProviderManager'

export const useTokenAllowance = (
  tokenContract: Contract | null,
  spender: string | null,
  parsedAmount: string
): boolean => {
  const { account } = useWeb3React()
  const { library } = useProvider()
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
