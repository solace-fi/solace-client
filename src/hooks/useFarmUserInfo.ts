import { useState, useEffect } from 'react'
import { useWallet } from '../context/Web3Manager'
import { Contract } from '@ethersproject/contracts'

export const useFarmUserInfo = (farm: Contract | null | undefined) => {
  const wallet = useWallet()
  const [farmUserInfo, setFarmUserInfo] = useState<any>(null)

  useEffect(() => {
    const getFarmUserInfo = async () => {
      if (!farm) return
      const userInfo = await farm.userInfo(wallet.account)
      setFarmUserInfo(userInfo)
    }
    getFarmUserInfo()
  }, [wallet, farm])

  return farmUserInfo
}
