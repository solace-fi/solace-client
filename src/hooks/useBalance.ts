import { useCallback, useMemo } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { useCachedData } from '../context/CachedDataManager'
import { useState, useEffect, useRef } from 'react'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { queryBalance, queryDecimals } from '../utils/contract'
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

import { Token, Pair } from '@sushiswap/sdk'
import { useCoingeckoPrice } from '@usedapp/coingecko'
import { getCoingeckoTokenPrice } from '../utils/api'
// import SafeServiceClient from '@gnosis.pm/safe-service-client'
import { useProvider } from '../context/ProviderManager'
import { useReadToken } from './useToken'

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
  const { keyContracts } = useContracts()
  const { vault } = useMemo(() => keyContracts, [keyContracts])
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

export const useSolaceBalance = (): string => {
  const { keyContracts } = useContracts()
  const { solace } = useMemo(() => keyContracts, [keyContracts])
  const { account } = useWallet()
  const { version } = useCachedData()
  const [solaceBalance, setSolaceBalance] = useState<string>('0')
  const readToken = useReadToken(solace)

  const getSolaceBalance = useCallback(async () => {
    if (!solace || !account) return
    try {
      const balance = await queryBalance(solace, account)
      const formattedBalance = formatUnits(balance, readToken.decimals)
      setSolaceBalance(formattedBalance)
    } catch (err) {
      console.log('getSolaceBalance', err)
    }
  }, [account, solace, readToken])

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
  }, [account, solace, getSolaceBalance, version])

  return solaceBalance
}

export const useXSolaceBalance = () => {
  const { keyContracts } = useContracts()
  const { xSolace } = useMemo(() => keyContracts, [keyContracts])
  const { account } = useWallet()
  const { version } = useCachedData()
  const [xSolaceBalance, setXSolaceBalance] = useState<string>('0')
  const readXToken = useReadToken(xSolace)

  const getXSolaceBalance = useCallback(async () => {
    if (!xSolace || !account) return
    try {
      const balance = await queryBalance(xSolace, account)
      const formattedBalance = formatUnits(balance, readXToken.decimals)
      setXSolaceBalance(formattedBalance)
    } catch (err) {
      console.log('getXSolaceBalance', err)
    }
  }, [account, xSolace, readXToken])

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
  }, [account, xSolace, getXSolaceBalance, version])

  return xSolaceBalance
}

export const useXSolaceV1Balance = (): { xSolaceV1Balance: string; v1StakedSolaceBalance: string } => {
  const { keyContracts } = useContracts()
  const { xSolaceV1, solace } = useMemo(() => keyContracts, [keyContracts])
  const { account } = useWallet()
  const { version } = useCachedData()
  const [xSolaceV1Balance, setXSolaceV1Balance] = useState<string>('0')
  const [v1StakedSolaceBalance, setV1StakedSolaceBalance] = useState<string>('0')
  const readToken = useReadToken(solace)
  const readXV1Token = useReadToken(xSolaceV1)

  const getXSolaceV1Balance = useCallback(async () => {
    if (!xSolaceV1 || !account) return
    try {
      const balance = await queryBalance(xSolaceV1, account)
      const stakedBalance = await xSolaceV1.xSolaceToSolace(balance)
      const formattedStakedBalance = formatUnits(stakedBalance, readToken.decimals)
      const formattedBalance = formatUnits(balance, readXV1Token.decimals)
      setXSolaceV1Balance(formattedBalance)
      setV1StakedSolaceBalance(formattedStakedBalance)
    } catch (err) {
      console.log('getXSolaceV1Balance', err)
    }
  }, [account, xSolaceV1, readToken, readXV1Token])

  useEffect(() => {
    if (!xSolaceV1 || !account) return
    getXSolaceV1Balance()
    xSolaceV1.on('Transfer', (from, to) => {
      if (from == account || to == account) {
        getXSolaceV1Balance()
      }
    })

    return () => {
      xSolaceV1.removeAllListeners()
    }
  }, [account, xSolaceV1, getXSolaceV1Balance, version])

  return { xSolaceV1Balance, v1StakedSolaceBalance }
}

export const useUnderWritingPoolBalance = () => {
  const { activeNetwork, chainId, currencyDecimals } = useNetwork()
  const { tellers, keyContracts } = useContracts()
  const { bondDepo, solace } = useMemo(() => keyContracts, [keyContracts])
  const { library } = useWallet()
  const { latestBlock } = useProvider()
  const [underwritingPoolBalance, setUnderwritingPoolBalance] = useState<string>('-')
  const { getPairPrice } = useGetPairPrice()

  const platform = useMemo(() => {
    switch (activeNetwork.nativeCurrency.symbol) {
      case Unit.ETH:
        return 'ethereum'
      case Unit.MATIC:
      default:
        return 'matic'
    }
  }, [activeNetwork.nativeCurrency.symbol])
  const coinGeckoNativeTokenPrice = useCoingeckoPrice(platform, 'usd')

  useEffect(() => {
    const getGnosisBalance = async () => {
      if (!bondDepo || !solace) return
      const multiSig = await bondDepo.underwritingPool()
      if (!library) return
      const principalContracts = tellers.map((t) =>
        getContract(
          t.underlyingAddr,
          t.isLp ? sushiswapLpAbi : t.isBondTellerErc20 ? ierc20Json.abi : weth9,
          library,
          undefined
        )
      )
      principalContracts.push(solace)
      const balances: BigNumber[] = await Promise.all(principalContracts.map((c) => queryBalance(c, multiSig)))
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
            let price0 = await getPairPrice(token0Contract)
            let price1 = await getPairPrice(token1Contract)

            if (price0 == -1) {
              const coinGeckoTokenPrice = await getCoingeckoTokenPrice(token0Contract.address, 'usd', platform)
              price0 = parseFloat(coinGeckoTokenPrice ?? '0')
            }
            if (price1 == -1) {
              const coinGeckoTokenPrice = await getCoingeckoTokenPrice(token1Contract.address, 'usd', platform)
              price1 = parseFloat(coinGeckoTokenPrice ?? '0')
            }

            const TOKEN0 = new Token(chainId, token0, decimals0)
            const TOKEN1 = new Token(chainId, token1, decimals1)
            const pairAddr = await Pair.getAddress(TOKEN0, TOKEN1)
            const pairPoolContract = getContract(pairAddr, sushiswapLpAbi, library)
            const reserves = await pairPoolContract.getReserves()
            const totalReserve0 = floatUnits(reserves._reserve0, decimals0)
            const totalReserve1 = floatUnits(reserves._reserve1, decimals1)
            const multiplied = poolShare * (price0 * totalReserve0 + price1 * totalReserve1)
            return multiplied
          } else {
            let price = await getPairPrice(principalContracts[i])
            if (price == -1) {
              const coinGeckoTokenPrice = await getCoingeckoTokenPrice(principalContracts[i].address, 'usd', platform)
              price = parseFloat(coinGeckoTokenPrice ?? '0')
            }
            const principalDecimals = await principalContracts[i].decimals()
            const formattedBalance = floatUnits(balances[i], principalDecimals)
            const balanceMultipliedByPrice = price * formattedBalance
            return balanceMultipliedByPrice
          }
        })
      )

      // add USDC of native ETH balance
      if (coinGeckoNativeTokenPrice) {
        const ethBalance = await library.getBalance(multiSig)
        const formattedBalance = floatUnits(ethBalance, currencyDecimals)
        const balanceMultipliedByPrice = parseFloat(coinGeckoNativeTokenPrice) * formattedBalance
        usdcBalances.push(balanceMultipliedByPrice)
      }

      // add USDC for solace
      const solacePrice = await getPairPrice(solace)
      const multiSigSolaceBalance = await queryBalance(solace, multiSig)
      const principalDecimals = await solace.decimals()
      const formattedBalance = floatUnits(multiSigSolaceBalance, principalDecimals)
      const balanceMultipliedByPrice = solacePrice * formattedBalance
      usdcBalances.push(balanceMultipliedByPrice)

      const usdcTotalBalance = usdcBalances.reduce((pv, cv) => pv + cv, 0)
      setUnderwritingPoolBalance(usdcTotalBalance.toString())
      try {
        // const safeService = new SafeServiceClient('https://safe-transaction.gnosis.io')
        // const usdBalances = await safeService.getUsdBalances(multiSig)
        // const usdcTotalBalance = usdBalances.reduce((pv, cv) => pv + parseFloat(cv.fiatBalance), 0)
        // console.log(usdcTotalBalance)
        // setUnderwritingPoolBalance(usdcTotalBalance.toString())
      } catch (e) {
        // console.log('getGnosisBalance, pulling balances using pairPrice', e)
      }
    }
    getGnosisBalance()
  }, [tellers, library, bondDepo, coinGeckoNativeTokenPrice, latestBlock])

  return { underwritingPoolBalance }
}
