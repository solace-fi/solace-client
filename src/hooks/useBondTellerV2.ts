import { BondTellerDetails, BondTokenV2, TxResult, LocalTx } from '../constants/types'
import { useContracts } from '../context/ContractsManager'
import { listTokensOfOwner } from '../utils/contract'

import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { getContract } from '../utils'

import ierc20Json from '../constants/metadata/IERC20Metadata.json'
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
import { useGetFunctionGas } from './useGas'
import { GAS_LIMIT } from '../constants'

export const useBondTellerV2 = (selectedBondDetail: BondTellerDetails | undefined) => {
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
      func == FunctionName.BOND_DEPOSIT_ERC20_V2
        ? await selectedBondDetail.tellerData.teller.contract.deposit(parsedAmount, minAmountOut, recipient, stake, {
            ...gasConfig,
            gasLimit: GAS_LIMIT,
          })
        : func == FunctionName.BOND_DEPOSIT_ETH_V2
        ? await selectedBondDetail.tellerData.teller.contract.depositEth(minAmountOut, recipient, stake, {
            value: parsedAmount,
            ...gasConfig,
            gasLimit: GAS_LIMIT,
          })
        : await selectedBondDetail.tellerData.teller.contract.depositWeth(
            parsedAmount,
            minAmountOut,
            recipient,
            stake,
            {
              ...gasConfig,
              gasLimit: GAS_LIMIT,
            }
          )
    const localTx: LocalTx = {
      hash: tx.hash,
      type: func,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const claimPayout = async (bondId: BigNumber): Promise<TxResult> => {
    if (!selectedBondDetail) return { tx: null, localTx: null }
    const tx = await selectedBondDetail.tellerData.teller.contract.claimPayout(bondId, {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.BOND_CLAIM_PAYOUT_V2,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return { deposit, claimPayout }
}

export const useBondTellerDetailsV2 = () => {
  const { library, account } = useWallet()
  const { version } = useCachedData()
  const { latestBlock } = useProvider()
  const { tellers } = useContracts()
  const { activeNetwork, networks } = useNetwork()
  const [tellerDetails, setTellerDetails] = useState<BondTellerDetails[]>([])
  const [mounting, setMounting] = useState<boolean>(true)
  const { getPairPrice } = useGetPairPrice()
  const [solacePrice, setSolacePrice] = useState<string>('-')
  const canBondV2 = useMemo(() => activeNetwork.config.availableFeatures.bondingV1, [
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
    if (!library || !canBondV2) return
    try {
      const data = await Promise.all(
        tellers
          .filter((t) => t.version == 2)
          .map(async (teller) => {
            const [principalAddr, bondPrice, vestingTermInSeconds, capacity, maxPayout] = await Promise.all([
              teller.contract.principal(),
              teller.contract.bondPrice(),
              teller.contract.globalVestingTerm(),
              teller.contract.capacity(),
              teller.contract.maxPayout(),
            ])

            const principalContract = getContract(
              principalAddr,
              teller.isBondTellerErc20 ? ierc20Json.abi : weth9,
              library,
              account ?? undefined
            )

            const [decimals, name, symbol] = await Promise.all([
              queryDecimals(principalContract),
              queryName(principalContract, library),
              querySymbol(principalContract, library),
            ])

            let usdBondPrice = 0

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

            const bondRoi =
              usdBondPrice > 0 && solacePrice != '-'
                ? ((parseFloat(solacePrice) - usdBondPrice) * 100) / usdBondPrice
                : 0

            const d: BondTellerDetails = {
              tellerData: {
                teller,
                principalAddr,
                bondPrice,
                usdBondPrice,
                vestingTermInSeconds,
                capacity,
                maxPayout,
                bondRoi,
              },
              principalData: {
                principal: principalContract,
                principalProps: {
                  symbol,
                  decimals,
                  name,
                },
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
  }, [tellers, latestBlock, version, solacePrice, canBondV2])

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

export const useUserBondDataV2 = () => {
  const getUserBondDataV2 = async (selectedBondDetail: BondTellerDetails, account: string) => {
    const ownedTokenIds: BigNumber[] = await listTokensOfOwner(selectedBondDetail.tellerData.teller.contract, account)
    const ownedBondData = await Promise.all(
      ownedTokenIds.map(async (id) => await selectedBondDetail.tellerData.teller.contract.bonds(id))
    )
    const ownedBonds: BondTokenV2[] = ownedTokenIds.map((id, idx) => {
      return {
        id,
        payoutAmount: ownedBondData[idx].payoutAmount,
        payoutAlreadyClaimed: ownedBondData[idx].payoutAlreadyClaimed,
        principalPaid: ownedBondData[idx].principalPaid,
        vestingStart: ownedBondData[idx].vestingStart,
        localVestingTerm: ownedBondData[idx].localVestingTerm,
      }
    })
    return ownedBonds
  }

  return { getUserBondDataV2 }
}
