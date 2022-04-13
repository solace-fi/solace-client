import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { BondTellerDetails, TxResult, LocalTx } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'
import { getContract } from '../../utils'

import { useWallet } from '../../context/WalletManager'
import { FunctionGasLimits } from '../../constants/mappings/gasMapping'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { queryDecimals, queryName, querySymbol } from '../../utils/contract'
import { useProvider } from '../../context/ProviderManager'
import { usePriceSdk } from '../api/usePrice'
import { useNetwork } from '../../context/NetworkManager'
import { floatUnits, truncateValue } from '../../utils/formatting'
import { BondTokenV1 } from '../../constants/types'
import { useReadToken } from '../contract/useToken'
import { useGetFunctionGas } from '../provider/useGas'
import { useCachedData } from '../../context/CachedDataManager'
import { withBackoffRetries } from '../../utils/time'

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
    const estGas =
      func == FunctionName.BOND_DEPOSIT_ERC20_V1
        ? await selectedBondDetail.tellerData.teller.contract.estimateGas.deposit(
            parsedAmount,
            minAmountOut,
            recipient,
            stake
          )
        : func == FunctionName.BOND_DEPOSIT_ETH_V1
        ? await selectedBondDetail.tellerData.teller.contract.estimateGas.depositEth(minAmountOut, recipient, stake)
        : await selectedBondDetail.tellerData.teller.contract.estimateGas.depositWeth(
            parsedAmount,
            minAmountOut,
            recipient,
            stake
          )
    console.log('selectedBondDetail.tellerData.teller.contract.estimateGas.deposit', estGas.toString())
    const tx =
      func == FunctionName.BOND_DEPOSIT_ERC20_V1
        ? await selectedBondDetail.tellerData.teller.contract.deposit(parsedAmount, minAmountOut, recipient, stake, {
            ...gasConfig,
            // gasLimit: FunctionGasLimits['tellerErc20_v1.deposit'],
            gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
          })
        : func == FunctionName.BOND_DEPOSIT_ETH_V1
        ? await selectedBondDetail.tellerData.teller.contract.depositEth(minAmountOut, recipient, stake, {
            value: parsedAmount,
            ...gasConfig,
            // gasLimit: FunctionGasLimits['tellerEth_v1.depositEth'],
            gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
          })
        : await selectedBondDetail.tellerData.teller.contract.depositWeth(
            parsedAmount,
            minAmountOut,
            recipient,
            stake,
            {
              ...gasConfig,
              // gasLimit: FunctionGasLimits['tellerEth_v1.depositWeth'],
              gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
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
    const estGas = await selectedBondDetail.tellerData.teller.contract.estimateGas.redeem(bondId)
    console.log('selectedBondDetail.tellerData.teller.contract.estimateGas.redeem', estGas.toString())
    const tx = await selectedBondDetail.tellerData.teller.contract.redeem(bondId, {
      ...gasConfig,
      // gasLimit: FunctionGasLimits['teller_v1.redeem'],
      gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
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

export const useBondTellerDetailsV1 = (
  canGetPrices: boolean
): { tellerDetails: BondTellerDetails[]; mounting: boolean } => {
  const { library, account } = useWallet()
  const { latestBlock } = useProvider()
  const { tellers } = useContracts()
  const { activeNetwork, networks } = useNetwork()
  const [tellerDetails, setTellerDetails] = useState<BondTellerDetails[]>([])
  const [mounting, setMounting] = useState<boolean>(true)
  const { getPriceSdkFunc } = usePriceSdk()
  const canBondV1 = useMemo(() => !activeNetwork.config.restrictedFeatures.noBondingV1, [
    activeNetwork.config.restrictedFeatures.noBondingV1,
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
        !canBondV1 ||
        !latestBlock ||
        !canGetPrices ||
        running.current ||
        (Object.keys(tokenPriceMapping).length === 0 && tokenPriceMapping.constructor === Object)
      )
        return
      running.current = true
      const solacePrice = truncateValue(tokenPriceMapping[networks[0].config.keyContracts.solace.addr.toLowerCase()], 2)
      try {
        const data: BondTellerDetails[] = await Promise.all(
          tellers
            .filter((t) => t.version == 1)
            .map(async (teller) => {
              const [
                principalAddr,
                bondPrice,
                vestingTermInSeconds,
                capacity,
                maxPayout,
                bondFeeBps,
              ] = await Promise.all([
                withBackoffRetries(async () => teller.contract.principal()),
                withBackoffRetries(async () => teller.contract.bondPrice()),
                withBackoffRetries(async () => teller.contract.vestingTerm()),
                withBackoffRetries(async () => teller.contract.capacity()),
                withBackoffRetries(async () => teller.contract.maxPayout()),
                withBackoffRetries(async () => teller.contract.bondFeeBps()),
              ])

              const principalContract = getContract(principalAddr, teller.principalAbi, library, account ?? undefined)

              const [decimals, name, symbol] = await Promise.all([
                queryDecimals(principalContract),
                queryName(principalContract, library),
                querySymbol(principalContract, library),
              ])

              let lpData = {}
              let usdBondPrice = 0

              const { getSdkTokenPrice, getSdkLpPrice } = getPriceSdkFunc(teller.sdk)

              // get usdBondPrice
              if (teller.isLp) {
                const price = await getSdkLpPrice(principalContract, activeNetwork, library)
                usdBondPrice = Math.max(price, 0) * floatUnits(bondPrice, decimals)
                const [token0, token1] = await Promise.all([
                  withBackoffRetries(async () => principalContract.token0()),
                  withBackoffRetries(async () => principalContract.token1()),
                ])
                lpData = {
                  token0,
                  token1,
                }
              } else {
                const key = teller.mainnetAddr == '' ? teller.tokenId.toLowerCase() : teller.mainnetAddr.toLowerCase()
                usdBondPrice = tokenPriceMapping[key] * floatUnits(bondPrice, decimals)
                if (usdBondPrice <= 0) {
                  const price = await getSdkTokenPrice(principalContract, activeNetwork, library) // via sushiswap sdk
                  usdBondPrice = price * floatUnits(bondPrice, decimals)
                }
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
        console.log('getBondTellerDetailsV1', e)
      }
      running.current = false
    }
    getPrices()
  }, [latestBlock, tellers, canBondV1, tokenPriceMapping, canGetPrices])

  return { tellerDetails, mounting }
}

export const useUserBondDataV1 = () => {
  const { keyContracts } = useContracts()
  const { solace, xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])
  const readSolaceToken = useReadToken(solace)
  const readXSolaceToken = useReadToken(xSolaceV1)

  const getUserBondDataV1 = async (selectedBondDetail: BondTellerDetails, account: string) => {
    const ownedTokenIds: BigNumber[] = await withBackoffRetries(async () =>
      selectedBondDetail.tellerData.teller.contract.listTokensOfOwner(account)
    )
    const ownedBondData = await Promise.all(
      ownedTokenIds.map(
        async (id) => await withBackoffRetries(async () => selectedBondDetail.tellerData.teller.contract.bonds(id))
      )
    )
    const ownedBonds: BondTokenV1[] = ownedTokenIds.map((id, idx) => {
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

  return { getUserBondDataV1 }
}
