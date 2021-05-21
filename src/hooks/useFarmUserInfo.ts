import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletManager'
import { Contract } from '@ethersproject/contracts'

export const useFarmUserInfo = (farm: Contract | null | undefined) => {
  const wallet = useWallet()
  const [farmUserInfo, setFarmUserInfo] = useState<any>(null)

  useEffect(() => {
    const getFarmUserInfo = async () => {
      if (!farm) return
      try {
        const userInfo = await farm.userInfo(wallet.account)
        setFarmUserInfo(userInfo)
      } catch (err) {
        console.log('getFarmUserInfo', err)
      }
    }
    getFarmUserInfo()
  }, [wallet, farm])

  return farmUserInfo
}
