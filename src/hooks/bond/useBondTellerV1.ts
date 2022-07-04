import { BigNumber, Contract } from 'ethers'
import { useEffect, useState, useMemo, useRef } from 'react'
import { BondTellerFullDetails, TxResult, LocalTx } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'

import { FunctionName, TransactionCondition } from '../../constants/enums'
import { queryDecimals, queryName, querySymbol } from '../../utils/contract'
import { useProvider } from '../../context/ProviderManager'
import { usePriceSdk } from '../api/usePrice'
import { useNetwork } from '../../context/NetworkManager'
import { fixed, floatUnits } from '../../utils/formatting'
import { BondTokenV1 } from '../../constants/types'
import { useGetFunctionGas } from '../provider/useGas'
import { useCachedData } from '../../context/CachedDataManager'
import { withBackoffRetries } from '../../utils/time'
import { SOLACE_TOKEN, XSOLACE_V1_TOKEN } from '../../constants/mappings/token'

export const useBondTellerV1 = (selectedBondDetail: BondTellerFullDetails | undefined) => {
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

export const useBondTellerFullDetailsV1 = (
  canGetPrices: boolean
): { tellerDetails: BondTellerFullDetails[]; mounting: boolean } => {
  const { provider, signer } = useProvider()
  const { tellers } = useContracts()
  const { activeNetwork } = useNetwork()
  const [tellerDetails, setTellerDetails] = useState<BondTellerFullDetails[]>([])
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
        !canBondV1 ||
        !canGetPrices ||
        running.current ||
        (Object.keys(tokenPriceMapping).length === 0 && tokenPriceMapping.constructor === Object)
      )
        return
      running.current = true
      const solacePrice = fixed(tokenPriceMapping['solace'], 2).toString()
      try {
        const data: BondTellerFullDetails[] = await Promise.all(
          tellers
            .filter((t) => t.metadata.version == 1)
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

              const principalContract = new Contract(principalAddr, teller.metadata.principalAbi, signer ?? provider)

              const [decimals, name, symbol] = await Promise.all([
                queryDecimals(principalContract),
                queryName(principalContract, signer ?? provider),
                querySymbol(principalContract, signer ?? provider),
              ])

              let lpData = {}
              let usdBondPrice = 0

              const { getSdkTokenPrice, getSdkLpPrice } = getPriceSdkFunc(teller.metadata.sdk)

              // get usdBondPrice
              if (teller.metadata.isLp) {
                const price = await getSdkLpPrice(principalContract, activeNetwork, signer ?? provider)
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
                const key =
                  teller.metadata.mainnetAddr == '' ? teller.metadata.tokenId.toLowerCase() : symbol.toLowerCase()
                usdBondPrice = tokenPriceMapping[key] * floatUnits(bondPrice, decimals)
                if (usdBondPrice <= 0) {
                  const price = await getSdkTokenPrice(principalContract, activeNetwork, signer ?? provider) // via sushiswap sdk
                  usdBondPrice = price * floatUnits(bondPrice, decimals)
                }
              }

              const bondRoi =
                usdBondPrice > 0 && solacePrice != '-'
                  ? ((parseFloat(solacePrice) - usdBondPrice) * 100) / usdBondPrice
                  : 0

              const d: BondTellerFullDetails = {
                tellerData: {
                  teller: { contract: teller.contract, type: teller.type },
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
                    address: principalAddr,
                  },
                  ...lpData,
                },
                metadata: teller.metadata,
              }
              return d
            })
        )
        setMounting(false)
        setTellerDetails(data)
      } catch (e) {
        console.log('getBondTellerFullDetailsV1', e)
      }
      running.current = false
    }
    getPrices()
  }, [tellers, canBondV1, tokenPriceMapping, canGetPrices, activeNetwork, signer, provider])

  return { tellerDetails, mounting }
}

export const useUserBondDataV1 = () => {
  const getUserBondDataV1 = async (selectedBondDetail: BondTellerFullDetails, account: string) => {
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
        ownedBondData[idx].payoutToken == SOLACE_TOKEN.address
          ? SOLACE_TOKEN.constants.symbol
          : ownedBondData[idx].payoutToken == XSOLACE_V1_TOKEN.address
          ? XSOLACE_V1_TOKEN.constants.symbol
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
