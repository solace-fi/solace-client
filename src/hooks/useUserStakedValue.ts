import { useState, useEffect } from 'react'
import { useWallet } from '../context/Web3Manager'
import { formatEther } from '@ethersproject/units'
import { Contract } from '@ethersproject/contracts'

export const useUserStakedValue = (farm: Contract | null | undefined) => {
  const wallet = useWallet()
  const [userStakedValue, setUserStakedValue] = useState<string>('0.00')

  useEffect(() => {
    const getUserStakedValue = async () => {
      if (!farm) return
      const user = await farm.userInfo(wallet.account)
      const userStakedValue = user.value
      const formattedUserStakedValue = formatEther(userStakedValue)
      // console.log('user staked value', formattedUserStakedValue)
      setUserStakedValue(formattedUserStakedValue)
    }
    getUserStakedValue()
  }, [wallet, farm])

  return userStakedValue
}
