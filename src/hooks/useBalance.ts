import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { useCachedData } from '../context/CachedDataManager'
import { useState, useEffect } from 'react'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { LpTokenInfo } from '../constants/types'
import { rangeFrom0 } from '../utils/numeric'
import { listTokensOfOwner } from '../utils/token'
import { useNetwork } from '../context/NetworkManager'

export const useNativeTokenBalance = (): string => {
  const { account, library, connect } = useWallet()
  const { activeNetwork } = useNetwork()
  const { version } = useCachedData()
  const [balance, setBalance] = useState<string>('0')

  useEffect(() => {
    const getNativeTokenBalance = async () => {
      if (!library || !account) return
      try {
        const balance = await library.getBalance(account)
        const formattedBalance = formatUnits(balance, activeNetwork.nativeCurrency.decimals)
        setBalance(formattedBalance)
      } catch (err) {
        console.log('getNativeTokenbalance', err)
      }
    }
    getNativeTokenBalance()
  }, [activeNetwork, account, library, version, connect])

  return balance
}

export const useScpBalance = (): string => {
  const { vault } = useContracts()
  const { activeNetwork } = useNetwork()
  const { account } = useWallet()
  const { version, latestBlock } = useCachedData()
  const [scpBalance, setScpBalance] = useState<string>('0')

  useEffect(() => {
    const getScpBalance = async () => {
      if (!vault || !account) return
      try {
        const balance = await vault.balanceOf(account)
        const formattedBalance = formatUnits(balance, activeNetwork.nativeCurrency.decimals)
        setScpBalance(formattedBalance)
      } catch (err) {
        console.log('getScpBalance', err)
      }
    }
    getScpBalance()
  }, [activeNetwork, account, vault, version, latestBlock])

  return scpBalance
}

export const useSolaceBalance = (): string => {
  const { solace } = useContracts()
  const { activeNetwork } = useNetwork()
  const { account } = useWallet()
  const { version, latestBlock } = useCachedData()
  const [solaceBalance, setSolaceBalance] = useState<string>('0')

  useEffect(() => {
    const getSolaceBalance = async () => {
      if (!solace) return
      try {
        const balance = await solace.balanceOf(account)
        const formattedBalance = formatUnits(balance, activeNetwork.nativeCurrency.decimals)
        setSolaceBalance(formattedBalance)
      } catch (err) {
        console.log('getSolaceBalance', err)
      }
    }
    getSolaceBalance()
  }, [activeNetwork, solace, account, version, latestBlock])

  return solaceBalance
}

export const useUserWalletLpBalance = (): LpTokenInfo[] => {
  const { lpToken, lpFarm, lpAppraisor } = useContracts()
  const { account } = useWallet()
  const { version, latestBlock } = useCachedData()
  const [userLpTokenInfo, setUserLpTokenInfo] = useState<LpTokenInfo[]>([])

  useEffect(() => {
    const getLpBalance = async () => {
      if (!lpToken || !account || !lpFarm || !lpAppraisor) return
      try {
        const userLpTokenIds = await listTokensOfOwner(lpToken, account)
        const userLpTokenValues = await Promise.all(userLpTokenIds.map(async (id) => await lpAppraisor.appraise(id)))
        const _token0 = await lpFarm.token0()
        const _token1 = await lpFarm.token1()
        const userLpTokenInfo: LpTokenInfo[] = []
        for (let i = 0; i < userLpTokenIds.length; i++) {
          const lpTokenData = await lpToken.positions(userLpTokenIds[i])
          const { token0, token1 } = lpTokenData
          if (!(_token0 == token0 && _token1 == token1)) return
          userLpTokenInfo.push({ id: userLpTokenIds[i], value: userLpTokenValues[i] })
        }
        setUserLpTokenInfo(userLpTokenInfo)
      } catch (err) {
        console.log('useUserWalletLpBalance', err)
      }
    }
    getLpBalance()
  }, [lpToken, account, version, latestBlock, lpFarm, lpAppraisor])

  return userLpTokenInfo
}

export const useDepositedLpBalance = (): LpTokenInfo[] => {
  const { lpToken, lpFarm, lpAppraisor } = useContracts()
  const { account } = useWallet()
  const { version, latestBlock } = useCachedData()
  const [depositedLpTokenInfo, setFarmLpTokenInfo] = useState<LpTokenInfo[]>([])

  useEffect(() => {
    const getLpBalance = async () => {
      if (!lpToken || !account || !lpFarm || !lpAppraisor) return
      try {
        const countDepositedLpTokens = await lpFarm.countDeposited(account)
        const indices = rangeFrom0(countDepositedLpTokens)
        const listOfDepositedLpTokens: [BigNumber[], BigNumber[]] = await lpFarm.listDeposited(account)
        const depositedLpTokenInfo: LpTokenInfo[] = await Promise.all(
          indices.map((i) => {
            return { id: listOfDepositedLpTokens[0][i], value: listOfDepositedLpTokens[1][i] }
          })
        )
        setFarmLpTokenInfo(depositedLpTokenInfo)
      } catch (err) {
        console.log('useUserDepositedLpBalance', err)
      }
    }
    getLpBalance()
  }, [lpToken, account, version, latestBlock, lpFarm, lpAppraisor])

  return depositedLpTokenInfo
}
