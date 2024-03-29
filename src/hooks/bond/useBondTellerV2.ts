import { BondTellerFullDetails, TxResult, LocalTx, TellerTokenMetadata } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'

import { BigNumber } from 'ethers'
import { useEffect, useState, useMemo, useRef } from 'react'

import { FunctionName, TransactionCondition } from '../../constants/enums'
import { useProvider } from '../../context/ProviderManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGetFunctionGas } from '../provider/useGas'
import { useCachedData } from '../../context/CachedDataManager'
import { BondTellerContractData, Bond } from '@solace-fi/sdk-nightly'

export const useBondTellerV2 = (selectedBondDetail: BondTellerFullDetails | undefined) => {
  const { gasConfig } = useGetFunctionGas()

  const deposit = async (
    parsedAmount: BigNumber,
    minAmountOut: BigNumber,
    recipient: string,
    stake: boolean,
    func: FunctionName
  ): Promise<TxResult> => {
    if (!selectedBondDetail) return { tx: null, localTx: null }
    const cntct = selectedBondDetail.tellerData.teller.contract
    let tx = null
    let estGas = null
    switch (func) {
      case FunctionName.BOND_DEPOSIT_ETH_V2:
        estGas = await cntct.estimateGas.depositEth(minAmountOut, recipient, stake)
        console.log('cntct.estimateGas.depositEth', estGas.toString())
        tx = await cntct.depositEth(minAmountOut, recipient, stake, {
          value: parsedAmount,
          ...gasConfig,
          // ...gasSettings,
          gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
        })
        break
      case FunctionName.BOND_DEPOSIT_WETH_V2:
        estGas = await cntct.estimateGas.depositWeth(parsedAmount, minAmountOut, recipient, stake)
        console.log('cntct.estimateGas.depositWeth', estGas.toString())
        tx = await cntct.depositWeth(parsedAmount, minAmountOut, recipient, stake, {
          ...gasConfig,
          gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
        })
        break
      case FunctionName.BOND_DEPOSIT_MATIC:
        estGas = await cntct.estimateGas.depositMatic(minAmountOut, recipient, stake)
        console.log('cntct.estimateGas.depositMatic', estGas.toString())
        tx = await cntct.depositMatic(minAmountOut, recipient, stake, {
          value: parsedAmount,
          ...gasConfig,
          // ...gasSettings,
          gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
        })
        break
      case FunctionName.BOND_DEPOSIT_WMATIC:
        estGas = await cntct.estimateGas.depositWmatic(parsedAmount, minAmountOut, recipient, stake)
        console.log('cntct.estimateGas.depositWmatic', estGas.toString())
        tx = await cntct.depositWmatic(parsedAmount, minAmountOut, recipient, stake, {
          ...gasConfig,
          gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
        })
        break
      case FunctionName.BOND_DEPOSIT_FTM:
        estGas = await cntct.estimateGas.depositFtm(minAmountOut, recipient, stake)
        console.log('cntct.estimateGas.depositFtm', estGas.toString())
        tx = await cntct.depositFtm(minAmountOut, recipient, stake, {
          value: parsedAmount,
          ...gasConfig,
          // ...gasSettings,
          gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
        })
        break
      case FunctionName.BOND_DEPOSIT_WFTM:
        estGas = await cntct.estimateGas.depositWftm(parsedAmount, minAmountOut, recipient, stake)
        console.log('cntct.estimateGas.depositWftm', estGas.toString())
        tx = await cntct.depositWftm(parsedAmount, minAmountOut, recipient, stake, {
          ...gasConfig,
          gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
        })
        break
      case FunctionName.BOND_DEPOSIT_ERC20_V2:
      default:
        estGas = await cntct.estimateGas.deposit(parsedAmount, minAmountOut, recipient, stake)
        console.log('cntct.estimateGas.deposit', estGas.toString())
        tx = await cntct.deposit(parsedAmount, minAmountOut, recipient, stake, {
          ...gasConfig,
          gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
        })
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
    const estGas = await selectedBondDetail.tellerData.teller.contract.estimateGas.claimPayout(bondId)
    console.log('selectedBondDetail.tellerData.teller.contract.claimPayout', estGas.toString())
    const tx = await selectedBondDetail.tellerData.teller.contract.claimPayout(bondId, {
      ...gasConfig,
      // gasLimit: FunctionGasLimits['teller_v2.claimPayout'],
      gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
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

export const useBondTellerFullDetailsV2 = (): { tellerDetails: BondTellerFullDetails[]; mounting: boolean } => {
  const { signer, provider } = useProvider()
  const { tellers } = useContracts()
  const { activeNetwork } = useNetwork()
  const [tellerDetails, setTellerDetails] = useState<BondTellerFullDetails[]>([])
  const [mounting, setMounting] = useState<boolean>(true)
  const canBondV2 = useMemo(() => activeNetwork.config.generalFeatures.bondingV2, [
    activeNetwork.config.generalFeatures.bondingV2,
  ])
  const { tokenPriceMapping } = useCachedData()
  const running = useRef(false)
  const [canRun, setCanRun] = useState<boolean>(false)

  useEffect(() => {
    setMounting(true)
  }, [tellers])

  useEffect(() => {
    const getPrices = async () => {
      if (
        !canBondV2 ||
        running.current ||
        !canRun ||
        (Object.keys(tokenPriceMapping).length === 0 && tokenPriceMapping.constructor === Object)
      )
        return
      running.current = true
      const bond = new Bond(activeNetwork.chainId, signer ?? provider)
      const fetchedTellerData = await bond.getBondTellerData(tokenPriceMapping)

      const metadataMapping = tellers.reduce(
        (
          metadata: any,
          teller: BondTellerContractData & {
            metadata: TellerTokenMetadata
          }
        ) => ({
          ...metadata,
          [teller.contract.address.toLowerCase()]: teller.metadata,
        }),
        {}
      )

      const adjustedTellerDetails = fetchedTellerData.map((t) => {
        return {
          ...t,
          metadata: metadataMapping[t.tellerData.teller.contract.address.toLowerCase()],
        }
      })

      setMounting(false)
      running.current = false

      setTellerDetails(adjustedTellerDetails)
    }
    getPrices()
  }, [signer, tellers, canBondV2, tokenPriceMapping, activeNetwork, provider, canRun])

  useEffect(() => {
    setTimeout(() => {
      setCanRun(true)
    }, 400)
  }, [])

  return { tellerDetails, mounting }
}

export const useUserBondDataV2 = () => {
  const { provider } = useProvider()
  const { activeNetwork } = useNetwork()

  const getUserBondDataV2 = async (bondTellerContractAddress: string, account: string) => {
    if (provider) {
      const bond = new Bond(activeNetwork.chainId, provider)
      const ownedBonds = await bond.getUserBondData(bondTellerContractAddress, account)
      return ownedBonds
    }
    return []
  }

  return { getUserBondDataV2 }
}
