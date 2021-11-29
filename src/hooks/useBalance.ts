import { useCallback, useMemo } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { useCachedData } from '../context/CachedDataManager'
import { useState, useEffect, useRef } from 'react'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { NftTokenInfo } from '../constants/types'
import { rangeFrom0 } from '../utils/numeric'
import { listTokensOfOwner, queryBalance, queryDecimals, queryName, querySymbol } from '../utils/contract'
import { useNetwork } from '../context/NetworkManager'
import { Unit } from '../constants/enums'

import ierc20Json from '../constants/metadata/IERC20Metadata.json'
import sushiswapLpAbi from '../constants/metadata/ISushiswapMetadataAlt.json'
import weth9 from '../constants/abi/contracts/WETH9.sol/WETH9.json'
import { getContract } from '../utils'
import { withBackoffRetries } from '../utils/time'
import { ZERO } from '../constants'
import { useGetPairPrice } from './usePair'
import { floatUnits } from '../utils/formatting'

import sushiSwapLpAltABI from '../constants/metadata/ISushiswapMetadataAlt.json'
import { Token, Pair } from '@sushiswap/sdk'
import { useCoingeckoPrice } from '@usedapp/coingecko'

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
  const { version } = useCachedData()

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
  }, [account, vault, version])

  return scpBalance
}

export const useSolaceBalance = () => {
  const { solace } = useContracts()
  const { account, library } = useWallet()
  const [solaceBalance, setSolaceBalance] = useState<string>('0')
  const [tokenData, setTokenData] = useState<any>({ name: '', decimals: 0, symbol: '' })

  const getSolaceBalance = useCallback(async () => {
    if (!solace || !account) return
    try {
      const balance = await queryBalance(solace, account)
      const formattedBalance = formatUnits(balance, tokenData.decimals)
      setSolaceBalance(formattedBalance)
    } catch (err) {
      console.log('getSolaceBalance', err)
    }
  }, [account, solace, tokenData.decimals])

  useEffect(() => {
    if (!solace) return
    const fetchTokenData = async () => {
      const [name, decimals, symbol] = await Promise.all([
        queryName(solace, library),
        queryDecimals(solace),
        querySymbol(solace, library),
      ])
      setTokenData({ name, decimals, symbol })
    }
    fetchTokenData()
  }, [solace, library])

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
  }, [account, solace, getSolaceBalance])

  return { solaceBalance, tokenData }
}

export const useXSolaceBalance = () => {
  const { xSolace } = useContracts()
  const { account, library } = useWallet()
  const [xSolaceBalance, setXSolaceBalance] = useState<string>('0')
  const [tokenData, setTokenData] = useState<any>({ name: '', decimals: 0, symbol: '' })

  const getXSolaceBalance = useCallback(async () => {
    if (!xSolace || !account) return
    try {
      const balance = await queryBalance(xSolace, account)
      const formattedBalance = formatUnits(balance, tokenData.decimals)
      setXSolaceBalance(formattedBalance)
    } catch (err) {
      console.log('getXSolaceBalance', err)
    }
  }, [account, tokenData.decimals, xSolace])

  useEffect(() => {
    if (!xSolace) return
    const fetchTokenData = async () => {
      const [name, decimals, symbol] = await Promise.all([
        queryName(xSolace, library),
        queryDecimals(xSolace),
        querySymbol(xSolace, library),
      ])
      setTokenData({ name, decimals, symbol })
    }
    fetchTokenData()
  }, [xSolace, library])

  useEffect(() => {
    if (!xSolace || !account) return
    getXSolaceBalance()
    xSolace.on('Transfer', (from, to) => {
      if (from == account || to == account) {
        getXSolaceBalance()
      }
    })

    return () => {
      xSolace.removeAllListeners()
    }
  }, [account, xSolace, getXSolaceBalance])

  return { xSolaceBalance, tokenData }
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

export const useUnderWritingPoolBalance = () => {
  const { activeNetwork, chainId, currencyDecimals } = useNetwork()
  const { tellers, bondDepo } = useContracts()
  const { library } = useWallet()
  const [underwritingPoolBalance, setUnderwritingPoolBalance] = useState<number>(0)
  const getPairPrice = useGetPairPrice()

  const currency = useMemo(() => {
    switch (activeNetwork.nativeCurrency.symbol) {
      case Unit.ETH:
        return 'ethereum'
      case Unit.MATIC:
      default:
        return 'matic'
    }
  }, [activeNetwork.nativeCurrency.symbol])
  const coinGeckoPrice = useCoingeckoPrice(currency, 'usd')

  useEffect(() => {
    const getBalance = async () => {
      if (!bondDepo || !library) return
      const principalContracts = tellers.map((t) =>
        getContract(
          t.underlyingAddr,
          t.isLp ? sushiswapLpAbi : t.isBondTellerErc20 ? ierc20Json.abi : weth9,
          library,
          undefined
        )
      )
      const multiSig = await bondDepo.underwritingPool()
      const balances: BigNumber[] = await Promise.all(principalContracts.map((c) => queryBalance(c, multiSig)))
      const ethBalance = await library.getBalance(multiSig)
      balances.push(ethBalance)
      const usdcBalances: number[] = await Promise.all(
        tellers.map(async (t, i) => {
          if (t.isLp) {
            const [token0, token1] = await Promise.all([principalContracts[i].token0(), principalContracts[i].token1()])
            const token0Contract = getContract(token0, ierc20Json.abi, library)
            const token1Contract = getContract(token1, ierc20Json.abi, library)

            const [decimals0, decimals1, totalSupply, principalDecimals] = await Promise.all([
              withBackoffRetries(async () => queryDecimals(token0Contract)),
              withBackoffRetries(async () => queryDecimals(token1Contract)),
              principalContracts[i].totalSupply(),
              queryDecimals(principalContracts[i]),
            ])
            const poolShare = totalSupply.gt(ZERO)
              ? floatUnits(balances[i], principalDecimals) / floatUnits(totalSupply, principalDecimals)
              : 0
            const price0 = await getPairPrice(token0Contract)
            const price1 = await getPairPrice(token1Contract)

            const TOKEN0 = new Token(chainId, token0, decimals0)
            const TOKEN1 = new Token(chainId, token1, decimals1)
            const pairAddr = await Pair.getAddress(TOKEN0, TOKEN1)
            const pairPoolContract = getContract(pairAddr, sushiSwapLpAltABI, library)
            const reserves = await pairPoolContract.getReserves()
            const totalReserve0 = floatUnits(reserves._reserve0, decimals0)
            const totalReserve1 = floatUnits(reserves._reserve1, decimals1)
            const multiplied = poolShare * (price0 * totalReserve0 + price1 * totalReserve1)
            return multiplied
          } else {
            const price = await getPairPrice(principalContracts[i])
            const principalDecimals = await principalContracts[i].decimals()
            const formattedBalance = floatUnits(balances[i], principalDecimals)
            const balanceMultipliedByPrice = price * formattedBalance
            return balanceMultipliedByPrice
          }
        })
      )

      // add USDC of native balance
      if (coinGeckoPrice) {
        const formattedBalance = floatUnits(ethBalance, currencyDecimals)
        const balanceMultipliedByPrice = parseFloat(coinGeckoPrice) * formattedBalance
        usdcBalances.push(balanceMultipliedByPrice)
      }

      const usdcTotalBalance = usdcBalances.reduce((pv, cv) => pv + cv, 0)
      setUnderwritingPoolBalance(usdcTotalBalance)
    }
    getBalance()
  }, [tellers, library, bondDepo, coinGeckoPrice])

  return { underwritingPoolBalance }
}
