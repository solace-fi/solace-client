import { useWallet } from '../context/WalletManager'
import { useEffect, useState } from 'react'
import { Contract } from 'ethers'
import { useCachedData } from '../context/CachedDataManager'

export const useTokenAllowance = (tokenContract: Contract | null, spender: string | null): string => {
  const { library, account } = useWallet()
  const { version } = useCachedData()
  const [allowance, setAllowance] = useState<string>('')

  const checkAllowance = async () => {
    try {
      if (!library || !account || !tokenContract || !spender) return
      const _allowance = await tokenContract.allowance(account, spender)
      setAllowance(_allowance.toString())
    } catch (err) {
      console.log('checkAllowance', err)
    }
  }

  useEffect(() => {
    checkAllowance()
  }, [tokenContract, spender, account, library, version])

  return allowance
}
