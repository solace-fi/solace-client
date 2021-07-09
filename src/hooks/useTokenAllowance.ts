import { useWallet } from '../context/WalletManager'
import { useEffect, useState } from 'react'
import { Contract } from 'ethers'

export const useTokenAllowance = (tokenContract: Contract | null, spender: string | null): string => {
  const { library, account, version } = useWallet()
  const [allowance, setAllowance] = useState<string>('')

  const checkAllowance = async () => {
    if (!library || !account || !tokenContract || !spender) return
    const _allowance = await tokenContract.allowance(account, spender)
    setAllowance(_allowance.toString())
  }

  useEffect(() => {
    checkAllowance()
  }, [tokenContract, spender, account, library, version])

  return allowance
}
