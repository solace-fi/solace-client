import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { useCachedData } from '../context/CachedDataManager'
import { useState, useEffect, useRef } from 'react'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { NftTokenInfo } from '../constants/types'
import { rangeFrom0 } from '../utils/numeric'
import { listTokensOfOwner, queryBalance } from '../utils/contract'
import { useNetwork } from '../context/NetworkManager'

export const useNativeTokenBalance = (): string => {
  const { account, library } = useWallet()
  const { activeNetwork } = useNetwork()
  const { version } = useCachedData()
  const [balance, setBalance] = useState<string>('0')
  const running = useRef(false)

  useEffect(() => {
    const getNativeTokenBalance = async () => {
      if (!library || !account || running.current) return
      try {
        running.current = true
        const balance = await library.getBalance(account)
        const formattedBalance = formatUnits(balance, activeNetwork.nativeCurrency.decimals)
        setBalance(formattedBalance)
        running.current = false
      } catch (err) {
        console.log('getNativeTokenbalance', err)
      }
    }
    getNativeTokenBalance()
  }, [activeNetwork, account, version])

  return balance
}

export const useScpBalance = (): string => {
  const { vault } = useContracts()
  const { activeNetwork } = useNetwork()
  const { account } = useWallet()
  const [scpBalance, setScpBalance] = useState<string>('0')

  const getScpBalance = async () => {
    if (!vault || !account) return
    try {
      const balance = await queryBalance(vault, account)
      const formattedBalance = formatUnits(balance, activeNetwork.nativeCurrency.decimals)
      setScpBalance(formattedBalance)
    } catch (err) {
      console.log('getScpBalance', err)
    }
  }

  useEffect(() => {
    if (!vault || !account) return
    getScpBalance()
    vault.on('Transfer', (from, to) => {
      if (from == account || to == account) {
        getScpBalance()
      }
    })

    return () => {
      vault.removeAllListeners()
    }
  }, [account, vault])

  return scpBalance
}

export const useSolaceBalance = (): string => {
  const { solace } = useContracts()
  const { currencyDecimals } = useNetwork()
  const { account } = useWallet()
  const [solaceBalance, setSolaceBalance] = useState<string>('0')

  const getSolaceBalance = async () => {
    if (!solace || !account) return
    try {
      const balance = await queryBalance(solace, account)
      const formattedBalance = formatUnits(balance, currencyDecimals)
      setSolaceBalance(formattedBalance)
    } catch (err) {
      console.log('getSolaceBalance', err)
    }
  }

  useEffect(() => {
    if (!solace || !account) return
    getSolaceBalance()
    solace.on('Transfer', (from, to) => {
      if (from == account || to == account) {
        getSolaceBalance()
      }
    })

    return () => {
      solace.removeAllListeners()
    }
  }, [account, solace])

  return solaceBalance
}

export const useUserWalletLpBalance = (): NftTokenInfo[] => {
  const { lpToken, lpFarm, lpAppraisor } = useContracts()
  const { account } = useWallet()
  const [userNftTokenInfo, setUserNftTokenInfo] = useState<NftTokenInfo[]>([])

  const getLpBalance = async () => {
    if (!lpToken || !account || !lpFarm || !lpAppraisor) return
    try {
      const userLpTokenIds = await listTokensOfOwner(lpToken, account)
      const userLpTokenValues = await Promise.all(userLpTokenIds.map(async (id) => await lpAppraisor.appraise(id)))
      const _token0 = await lpFarm.token0()
      const _token1 = await lpFarm.token1()
      const userNftTokenInfo: NftTokenInfo[] = []
      for (let i = 0; i < userLpTokenIds.length; i++) {
        const lpTokenData = await lpToken.positions(userLpTokenIds[i])
        const { token0, token1 } = lpTokenData
        if (_token0 == token0 && _token1 == token1) {
          userNftTokenInfo.push({ id: userLpTokenIds[i], value: userLpTokenValues[i] })
        }
      }
      setUserNftTokenInfo(userNftTokenInfo)
    } catch (err) {
      console.log('useUserWalletLpBalance', err)
    }
  }

  useEffect(() => {
    if (!lpToken || !account) return
    getLpBalance()
    lpToken.on('Transfer', (from, to) => {
      if (from == account || to == account) {
        getLpBalance()
      }
    })

    return () => {
      lpToken?.removeAllListeners()
    }
  }, [account, lpToken])

  return userNftTokenInfo
}

export const useDepositedLpBalance = (): NftTokenInfo[] => {
  const { lpToken, lpFarm, lpAppraisor } = useContracts()
  const { account } = useWallet()
  const [depositedNftTokenInfo, setFarmNftTokenInfo] = useState<NftTokenInfo[]>([])

  const getLpBalance = async () => {
    if (!lpToken || !account || !lpFarm || !lpAppraisor) return
    try {
      const listOfDepositedLpTokens: [BigNumber[], BigNumber[]] = await lpFarm.listDeposited(account)
      const indices = rangeFrom0(listOfDepositedLpTokens[0].length)
      const depositedNftTokenInfo: NftTokenInfo[] = indices.map((i) => {
        return { id: listOfDepositedLpTokens[0][i], value: listOfDepositedLpTokens[1][i] }
      })
      setFarmNftTokenInfo(depositedNftTokenInfo)
    } catch (err) {
      console.log('useUserDepositedLpBalance', err)
    }
  }

  useEffect(() => {
    if (!lpToken || !account) return
    getLpBalance()
    lpToken?.on('Transfer', (from, to) => {
      if (from == account || to == account) {
        getLpBalance()
      }
    })

    return () => {
      lpToken?.removeAllListeners()
    }
  }, [account, lpToken])

  return depositedNftTokenInfo
}

export const useUserWalletPolicies = (): NftTokenInfo[] => {
  const { policyManager, sptFarm } = useContracts()
  const { userPolicyData } = useCachedData()
  const { account } = useWallet()
  const [userNftTokenInfo, setUserNftTokenInfo] = useState<NftTokenInfo[]>([])

  const getUserWalletPolicies = async () => {
    if (!policyManager || !account) return
    const userPolicyIds = await listTokensOfOwner(policyManager, account)
    const infos = await Promise.all(userPolicyIds.map((id) => policyManager.getPolicyInfo(id)))
    const userNftTokenInfo: NftTokenInfo[] = []
    for (let i = 0; i < infos.length; i++) {
      userNftTokenInfo.push({
        id: BigNumber.from(userPolicyIds[i]),
        value: BigNumber.from(infos[i].coverAmount).mul(infos[i].price),
      })
    }
    setUserNftTokenInfo(userNftTokenInfo)
  }

  useEffect(() => {
    if (userPolicyData.policiesLoading || !sptFarm || !account) return
    getUserWalletPolicies()

    sptFarm.on('PolicyDeposited', async (from, to) => {
      if (from == account || to == account) {
        await getUserWalletPolicies()
      }
    })

    sptFarm.on('PolicyWithdrawn', async (from, to) => {
      if (from == account || to == account) {
        await getUserWalletPolicies()
      }
    })
  }, [userPolicyData])

  return userNftTokenInfo
}

export const useDepositedPolicies = (): NftTokenInfo[] => {
  const { sptFarm } = useContracts()
  const { account } = useWallet()
  const { userPolicyData } = useCachedData()
  const [depositedNftTokenInfo, setFarmNftTokenInfo] = useState<NftTokenInfo[]>([])

  const getDepositedPolicies = async () => {
    if (!sptFarm || !account) return
    const listOfDepositedLpTokens: [BigNumber[], BigNumber[]] = await sptFarm.listDeposited(account)
    const indices = rangeFrom0(listOfDepositedLpTokens[0].length)
    const depositedNftTokenInfo: NftTokenInfo[] = indices.map((i) => {
      return { id: listOfDepositedLpTokens[0][i], value: listOfDepositedLpTokens[1][i] }
    })

    setFarmNftTokenInfo(depositedNftTokenInfo)
  }

  useEffect(() => {
    if (userPolicyData.policiesLoading || !sptFarm || !account) return
    getDepositedPolicies()

    sptFarm.on('PolicyDeposited', async (from, to) => {
      if (from == account || to == account) {
        await getDepositedPolicies()
      }
    })

    sptFarm.on('PolicyWithdrawn', async (from, to) => {
      if (from == account || to == account) {
        await getDepositedPolicies()
      }
    })
  }, [userPolicyData])

  return depositedNftTokenInfo
}
