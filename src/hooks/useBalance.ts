import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { useCachedData } from '../context/CachedDataManager'
import { useState, useEffect } from 'react'
import { formatEther } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { LpTokenInfo } from '../constants/types'
import { rangeFrom0 } from '../utils/numeric'
import { listTokensOfOwner } from '../utils/token'

export const useNativeTokenBalance = (): string => {
  const { account, library, connect } = useWallet()
  const { version } = useCachedData()
  const [balance, setBalance] = useState<string>('0.00')

  useEffect(() => {
    const getNativeTokenBalance = async () => {
      if (!library || !account) return
      try {
        const balance = await library.getBalance(account)
        const formattedBalance = formatEther(balance)
        setBalance(formattedBalance)
      } catch (err) {
        console.log('getNativeTokenbalance', err)
      }
    }
    getNativeTokenBalance()
  }, [account, library, version, connect])

  return balance
}

export const useScpBalance = (): string => {
  const { vault } = useContracts()
  const { account } = useWallet()
  const { version, latestBlock } = useCachedData()
  const [scpBalance, setScpBalance] = useState<string>('0.00')

  useEffect(() => {
    const getScpBalance = async () => {
      if (!vault || !account) return
      try {
        const balance = await vault.balanceOf(account)
        const formattedBalance = formatEther(balance)
        setScpBalance(formattedBalance)
      } catch (err) {
        console.log('getScpBalance', err)
      }
    }
    getScpBalance()
  }, [account, vault, version, latestBlock])

  return scpBalance
}

export const useSolaceBalance = (): string => {
  const { solace } = useContracts()
  const { account } = useWallet()
  const { version, latestBlock } = useCachedData()
  const [solaceBalance, setSolaceBalance] = useState<string>('0.00')

  useEffect(() => {
    const getSolaceBalance = async () => {
      if (!solace) return
      try {
        const balance = await solace.balanceOf(account)
        const formattedBalance = formatEther(balance)
        setSolaceBalance(formattedBalance)
      } catch (err) {
        console.log('getSolaceBalance', err)
      }
    }
    getSolaceBalance()
  }, [solace, account, version, latestBlock])

  return solaceBalance
}

export const useLpBalances = (): { userLpTokenInfo: LpTokenInfo[]; depositedLpTokenInfo: LpTokenInfo[] } => {
  const { lpToken, lpFarm, lpAppraisor } = useContracts()
  const { account } = useWallet()
  const { version, latestBlock } = useCachedData()
  const [userLpTokenInfo, setUserLpTokenInfo] = useState<LpTokenInfo[]>([])
  const [depositedLpTokenInfo, setFarmLpTokenInfo] = useState<LpTokenInfo[]>([])

  useEffect(() => {
    const getLpBalance = async () => {
      if (!lpToken || !account || !lpFarm || !lpAppraisor) return
      try {
        const userLpTokenIds = await listTokensOfOwner(lpToken, account)
        const userLpTokenValues = await Promise.all(userLpTokenIds.map(async (id) => await lpAppraisor.appraise(id)))
        let indices = rangeFrom0(userLpTokenIds.length)
        const userLpTokenInfo: LpTokenInfo[] = await Promise.all(
          indices.map((i) => {
            return { id: userLpTokenIds[i], value: userLpTokenValues[i] }
          })
        )

        const countDepositedLpTokens = await lpFarm.countDeposited(account)
        indices = rangeFrom0(countDepositedLpTokens)
        const listOfDepositedLpTokens: [BigNumber[], BigNumber[]] = await lpFarm.listDeposited(account)
        const depositedLpTokenInfo: LpTokenInfo[] = await Promise.all(
          indices.map((i) => {
            return { id: listOfDepositedLpTokens[0][i], value: listOfDepositedLpTokens[1][i] }
          })
        )
        setUserLpTokenInfo(userLpTokenInfo)
        setFarmLpTokenInfo(depositedLpTokenInfo)
      } catch (err) {
        console.log('getLpBalance', err)
      }
    }
    getLpBalance()
  }, [lpToken, account, version, latestBlock, lpFarm, lpAppraisor])

  return { userLpTokenInfo, depositedLpTokenInfo }
}
