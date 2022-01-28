import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { BondTellerDetails, TxResult, LocalTx } from '../constants/types'
import { useContracts } from '../context/ContractsManager'
import { getContract } from '../utils'

import ierc20Json from '../constants/metadata/IERC20Metadata.json'
import sushiswapLpAbi from '../constants/metadata/ISushiswapMetadataAlt.json'
import weth9 from '../constants/abi/contracts/WETH9.sol/WETH9.json'
import { useWallet } from '../context/WalletManager'
import { FunctionGasLimits } from '../constants/mappings/gasMapping'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { queryDecimals, queryName, querySymbol } from '../utils/contract'
import { useCachedData } from '../context/CachedDataManager'
import { useProvider } from '../context/ProviderManager'
import { useGetPairPrice, usePairPrice } from './usePair'
import { useNetwork } from '../context/NetworkManager'
import { Unit } from '../constants/enums'
import { getCoingeckoTokenPrice } from '../utils/api'
import { floatUnits, truncateValue } from '../utils/formatting'
import { BondToken } from '../constants/types'
import { useReadToken } from './useToken'
import { useGetFunctionGas } from './useGas'

export const useBondTellerV1 = (selectedBondDetail: BondTellerDetails | undefined) => {
  const { gasConfig } = useGetFunctionGas()

  const deposit = async (
    parsedAmount: BigNumber,
    minAmountOut: BigNumber,
    recipient: string,
    stake: boolean,
    func: FunctionName
  ): Promise<TxResult> => {
    if (!selectedBondDetail) return { tx: null, localTx: null }
    const tx =
      func == FunctionName.BOND_DEPOSIT_ERC20_V1
        ? await selectedBondDetail.tellerData.teller.contract.deposit(parsedAmount, minAmountOut, recipient, stake, {
            ...gasConfig,
            gasLimit: FunctionGasLimits['tellerErc20.deposit'],
          })
        : func == FunctionName.DEPOSIT_ETH
        ? await selectedBondDetail.tellerData.teller.contract.depositEth(minAmountOut, recipient, stake, {
            value: parsedAmount,
            ...gasConfig,
            gasLimit: FunctionGasLimits['tellerEth.depositEth'],
          })
        : await selectedBondDetail.tellerData.teller.contract.depositWeth(
            parsedAmount,
            minAmountOut,
            recipient,
            stake,
            {
              ...gasConfig,
              gasLimit: FunctionGasLimits['tellerEth.depositWeth'],
            }
          )
    const localTx: LocalTx = {
      hash: tx.hash,
      type: func,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const redeem = async (bondId: BigNumber): Promise<TxResult> => {
    if (!selectedBondDetail) return { tx: null, localTx: null }
    const tx = await selectedBondDetail.tellerData.teller.contract.redeem(bondId, {
      ...gasConfig,
      gasLimit: FunctionGasLimits['teller.redeem'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.BOND_REDEEM_V1,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return { deposit, redeem }
}

export const useBondTellerDetailsV1 = (): { tellerDetails: BondTellerDetails[]; mounting: boolean } => {
  const { library, account } = useWallet()
  const { version } = useCachedData()
  const { latestBlock } = useProvider()
  const { tellers, keyContracts } = useContracts()
  // const { solace } = useMemo(() => keyContracts, [keyContracts])
  const { activeNetwork, networks } = useNetwork()
  const [tellerDetails, setTellerDetails] = useState<BondTellerDetails[]>([])
  const [mounting, setMounting] = useState<boolean>(true)
  const { getPairPrice, getPriceFromSushiswapLp } = useGetPairPrice()
  // const solacePrice = usePairPrice(solace)
  const [solacePrice, setSolacePrice] = useState<string>('-')
  const canBondV1 = useMemo(() => activeNetwork.config.availableFeatures.bondingV1, [
    activeNetwork.config.availableFeatures.bondingV1,
  ])
  const coingeckoTokenId = useMemo(() => {
    switch (activeNetwork.nativeCurrency.symbol) {
      case Unit.ETH:
        return 'ethereum'
      case Unit.MATIC:
      default:
        return 'matic-network'
    }
  }, [activeNetwork.nativeCurrency.symbol])

  const getBondTellerDetails = useCallback(async () => {
    if (!library || !canBondV1) return
    try {
      const data: BondTellerDetails[] = await Promise.all(
        tellers.map(async (teller) => {
          const [principalAddr, bondPrice, vestingTermInSeconds, capacity, maxPayout, bondFeeBps] = await Promise.all([
            teller.contract.principal(),
            teller.contract.bondPrice(),
            teller.contract.vestingTerm(),
            teller.contract.capacity(),
            teller.contract.maxPayout(),
            teller.contract.bondFeeBps(),
          ])

          const principalContract = getContract(
            principalAddr,
            teller.isLp ? sushiswapLpAbi : teller.isBondTellerErc20 ? ierc20Json.abi : weth9,
            library,
            account ?? undefined
          )

          const [decimals, name, symbol] = await Promise.all([
            queryDecimals(principalContract),
            queryName(principalContract, library),
            querySymbol(principalContract, library),
          ])

          let lpData = {}
          let usdBondPrice = 0

          // get usdBondPrice
          if (teller.isLp) {
            const price = await getPriceFromSushiswapLp(principalContract)
            usdBondPrice = Math.max(price, 0) * floatUnits(bondPrice, decimals)
            const [token0, token1] = await Promise.all([principalContract.token0(), principalContract.token1()])
            lpData = {
              token0,
              token1,
            }
          } else {
            const price = await getPairPrice(principalContract)
            if (price == -1) {
              const coinGeckoTokenPrice = await getCoingeckoTokenPrice(
                principalContract.address,
                'usd',
                coingeckoTokenId
              )
              usdBondPrice = parseFloat(coinGeckoTokenPrice ?? '0') * floatUnits(bondPrice, decimals)
            } else {
              usdBondPrice = price * floatUnits(bondPrice, decimals)
            }
          }

          const bondRoi =
            usdBondPrice > 0 && solacePrice != '-' ? ((parseFloat(solacePrice) - usdBondPrice) * 100) / usdBondPrice : 0

          const d: BondTellerDetails = {
            tellerData: {
              teller,
              principalAddr,
              bondPrice,
              usdBondPrice,
              vestingTermInSeconds,
              capacity,
              maxPayout,
              bondFeeBps,
              bondRoi,
            },
            principalData: {
              principal: principalContract,
              principalProps: {
                symbol,
                decimals,
                name,
              },
              ...lpData,
            },
          }
          return d
        })
      )
      setMounting(false)
      setTellerDetails(data)
    } catch (e) {
      console.log('getBondTellerDetails', e)
    }
  }, [tellers, latestBlock, version, solacePrice, canBondV1])

  useEffect(() => {
    setMounting(true)
  }, [tellers])

  useEffect(() => {
    getBondTellerDetails()
  }, [getBondTellerDetails])

  useEffect(() => {
    const getPrice = async () => {
      if (!latestBlock) return
      const mainnetSolaceAddr = networks[0].config.keyContracts.solace.addr
      const coingeckoMainnetPrice = await getCoingeckoTokenPrice(mainnetSolaceAddr, 'usd', 'ethereum')
      const price = parseFloat(coingeckoMainnetPrice ?? '0')
      setSolacePrice(truncateValue(price, 2))
    }
    getPrice()
  }, [latestBlock, networks])

  return { tellerDetails, mounting }
}

export const useUserBondData = () => {
  const { keyContracts } = useContracts()
  const { solace, xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])
  const readSolaceToken = useReadToken(solace)
  const readXSolaceToken = useReadToken(xSolaceV1)

  const getUserBondData = async (selectedBondDetail: BondTellerDetails, account: string) => {
    const ownedTokenIds: BigNumber[] = await selectedBondDetail.tellerData.teller.contract.listTokensOfOwner(account)
    const ownedBondData = await Promise.all(
      ownedTokenIds.map(async (id) => await selectedBondDetail.tellerData.teller.contract.bonds(id))
    )
    const ownedBonds: BondToken[] = ownedTokenIds.map((id, idx) => {
      const payoutToken: string =
        ownedBondData[idx].payoutToken == readSolaceToken.address
          ? readSolaceToken.symbol
          : ownedBondData[idx].payoutToken == readXSolaceToken.address
          ? readXSolaceToken.symbol
          : ''
      return {
        id,
        payoutToken,
        payoutAmount: ownedBondData[idx].payoutAmount,
        pricePaid: ownedBondData[idx].pricePaid,
        maturation: ownedBondData[idx].maturation,
      }
    })
    return ownedBonds
  }

  return { getUserBondData }
}
