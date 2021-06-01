import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletManager'
import { formatEther } from '@ethersproject/units'
import { Contract } from '@ethersproject/contracts'

export const useUserStakedValue = (farm: Contract | null | undefined): string => {
  const { account, version } = useWallet()
  const [userStakedValue, setUserStakedValue] = useState<string>('0.00')

  useEffect(() => {
    const getUserStakedValue = async () => {
      if (!farm) return
      try {
        const user = await farm.userInfo(account)
        const staked = user.value
        const formattedUserStakedValue = formatEther(staked)
        setUserStakedValue(formattedUserStakedValue)
      } catch (err) {
        console.log('getUserStakedValue', err)
      }
    }
    getUserStakedValue()
  }, [account, version, farm])

  return userStakedValue
}
