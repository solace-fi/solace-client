import { BondTellerDetails, BondTokenV2, TxResult, LocalTx } from '../constants/types'
import { useContracts } from '../context/ContractsManager'
import { listTokensOfOwner } from '../utils/contract'

import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { getContract } from '../utils'

import ierc20Json from '../constants/metadata/IERC20Metadata.json'
import weth9 from '../constants/abi/contracts/WETH9.sol/WETH9.json'
import { useWallet } from '../context/WalletManager'
import { FunctionGasLimits } from '../constants/mappings/gasMapping'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { queryDecimals, queryName, querySymbol } from '../utils/contract'
import { useProvider } from '../context/ProviderManager'
import { useGetPriceFromSushiSwap } from './usePrice'
import { useNetwork } from '../context/NetworkManager'
import { floatUnits, truncateValue } from '../utils/formatting'
import { useGetFunctionGas } from './useGas'
import { useCachedData } from '../context/CachedDataManager'

export const useBondTellerV2 = (selectedBondDetail: BondTellerDetails | undefined) => {
  const { gasConfig } = useGetFunctionGas()

  const deposit = async (
    parsedAmount: BigNumber,
    minAmountOut: BigNumber,
    recipient: string,
    stake: boolean,
    func: FunctionName,
    desiredFunctionGas: number | undefined
  ): Promise<TxResult> => {
    if (!selectedBondDetail) return { tx: null, localTx: null }
    const cntct = selectedBondDetail.tellerData.teller.contract
    const gasSettings = { ...gasConfig, gasLimit: desiredFunctionGas ?? FunctionGasLimits['tellerErc20_v2.deposit'] }
    let tx = null
    switch (func) {
      case FunctionName.BOND_DEPOSIT_ETH_V2:
        tx = await cntct.depositEth(minAmountOut, recipient, stake, {
          value: parsedAmount,
          ...gasSettings,
        })
        break
      case FunctionName.BOND_DEPOSIT_WETH_V2:
        tx = await cntct.depositWeth(parsedAmount, minAmountOut, recipient, stake, gasSettings)
        break
      case FunctionName.BOND_DEPOSIT_MATIC:
        tx = await cntct.depositMatic(minAmountOut, recipient, stake, {
          value: parsedAmount,
          ...gasSettings,
        })
        break
      case FunctionName.BOND_DEPOSIT_WMATIC:
        tx = await cntct.depositWmatic(parsedAmount, minAmountOut, recipient, stake, gasSettings)
        break
      case FunctionName.BOND_DEPOSIT_ERC20_V2:
      default:
        tx = await cntct.deposit(parsedAmount, minAmountOut, recipient, stake, gasSettings)
    }
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
      gasLimit: FunctionGasLimits['teller_v2.claimPayout'],
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

export const useBondTellerDetailsV2 = (
  canGetPrices: boolean
): { tellerDetails: BondTellerDetails[]; mounting: boolean } => {
  const { library, account } = useWallet()
  const { latestBlock } = useProvider()
  const { tellers } = useContracts()
  const { activeNetwork, networks } = useNetwork()
  const [tellerDetails, setTellerDetails] = useState<BondTellerDetails[]>([])
  const [mounting, setMounting] = useState<boolean>(true)
  const { getPriceFromSushiswap } = useGetPriceFromSushiSwap()
  const canBondV2 = useMemo(() => !activeNetwork.config.restrictedFeatures.noBondingV2, [
    activeNetwork.config.restrictedFeatures.noBondingV2,
  ])
  const { tokenPriceMapping } = useCachedData()
  const running = useRef(false)

  useEffect(() => {
    setMounting(true)
  }, [tellers])

  useEffect(() => {
    const getPrices = async () => {
      if (
        !library ||
        !canBondV2 ||
        !latestBlock ||
        !canGetPrices ||
        running.current ||
        (Object.keys(tokenPriceMapping).length === 0 && tokenPriceMapping.constructor === Object)
      )
        return
      running.current = true
      const solacePrice = tokenPriceMapping[networks[0].config.keyContracts.solace.addr.toLowerCase()]
      try {
        const data: BondTellerDetails[] = await Promise.all(
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

              usdBondPrice = tokenPriceMapping[teller.mainnetAddr.toLowerCase()] * floatUnits(bondPrice, decimals)
              if (usdBondPrice <= 0) {
                const price = await getPriceFromSushiswap(principalContract, activeNetwork, library) // via sushiswap sdk
                if (price != -1) usdBondPrice = price * floatUnits(bondPrice, decimals)
              }

              const bondRoi = usdBondPrice > 0 ? ((solacePrice - usdBondPrice) * 100) / usdBondPrice : 0

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
        console.log('getBondTellerDetailsV2', e)
      }
      running.current = false
    }
    getPrices()
  }, [latestBlock, tellers, canBondV2, tokenPriceMapping, canGetPrices])

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
