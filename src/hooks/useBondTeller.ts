import { BigNumber } from 'ethers'
import { useCallback, useEffect, useState, useMemo } from 'react'
import {
  BondPrincipalData,
  BondTellerData,
  BondTellerDetails,
  GasConfiguration,
  LocalTx,
  TxResult,
} from '../constants/types'
import { useContracts } from '../context/ContractsManager'
import { getContract } from '../utils'

import ierc20Json from '../constants/metadata/IERC20Metadata.json'
import sushiswapLpAbi from '../constants/metadata/ISushiswapMetadataAlt.json'
import weth9 from '../constants/abi/contracts/WETH9.sol/WETH9.json'
import { useWallet } from '../context/WalletManager'
import { FunctionGasLimits } from '../constants/mappings'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { queryDecimals, queryName, querySymbol } from '../utils/contract'
import { useCachedData } from '../context/CachedDataManager'

export const useBondTeller = (selectedBondDetail: BondTellerDetails | undefined) => {
  const deposit = async (
    parsedAmount: BigNumber,
    minAmountOut: BigNumber,
    recipient: string,
    stake: boolean,
    txVal: string,
    func: FunctionName,
    gasConfig: GasConfiguration
  ): Promise<TxResult> => {
    if (!selectedBondDetail) return { tx: null, localTx: null }
    const tx =
      func == FunctionName.BOND_DEPOSIT_ERC20
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
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const redeem = async (bondId: BigNumber, txVal: string, gasConfig: GasConfiguration): Promise<TxResult> => {
    if (!selectedBondDetail) return { tx: null, localTx: null }
    const tx = await selectedBondDetail.tellerData.teller.contract.redeem(bondId, {
      ...gasConfig,
      gasLimit: FunctionGasLimits['teller.redeem'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.BOND_REDEEM,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return { deposit, redeem }
}

export const useBondTellerDetails = (): { tellerDetails: BondTellerDetails[]; mounting: boolean } => {
  const { library, account } = useWallet()
  const { latestBlock, version } = useCachedData()
  const { tellers } = useContracts()
  const [tellerDataset, setTellerDataset] = useState<BondTellerData[]>([])
  const [principalDataset, setPrincipalDataset] = useState<BondPrincipalData[]>([])
  const [mounting, setMounting] = useState<boolean>(true)

  const tellerDetails: BondTellerDetails[] = useMemo(
    () =>
      tellerDataset.map((tellerData, i) => {
        return { tellerData, principalData: principalDataset[i] ?? undefined }
      }),
    [principalDataset, tellerDataset]
  )

  const getBondTellerData = useCallback(async () => {
    try {
      const data: BondTellerData[] = await Promise.all(
        tellers.map(async (teller) => {
          const [principalAddr, bondPrice, vestingTermInSeconds, capacity, maxPayout, stakeFeeBps] = await Promise.all([
            teller.contract.principal(),
            teller.contract.bondPrice(),
            teller.contract.vestingTerm(),
            teller.contract.capacity(),
            teller.contract.maxPayout(),
            teller.contract.stakeFeeBps(),
          ])
          return {
            teller,
            principalAddr,
            bondPrice,
            vestingTermInSeconds,
            capacity,
            maxPayout,
            stakeFeeBps,
          }
        })
      )
      setMounting(false)
      setTellerDataset(data)
    } catch (e) {
      console.log('getBondTellerData', e)
    }
  }, [tellers, latestBlock, version])

  const getBondPrincipalData = useCallback(async () => {
    if (!library) return
    try {
      const data: BondPrincipalData[] = await Promise.all(
        tellerDataset.map(async (t) => {
          const principalContract = getContract(
            t.principalAddr,
            t.teller.isLp ? sushiswapLpAbi : t.teller.isBondTellerErc20 ? ierc20Json.abi : weth9,
            library,
            account ?? undefined
          )
          const [decimals, name, symbol] = await Promise.all([
            queryDecimals(principalContract),
            queryName(principalContract, library),
            querySymbol(principalContract, library),
          ])
          let lpData = {}
          if (t.teller.isLp) {
            const [token0, token1] = await Promise.all([principalContract.token0(), principalContract.token1()])
            lpData = {
              token0,
              token1,
            }
          }
          return {
            principal: principalContract,
            principalProps: {
              symbol,
              decimals,
              name,
            },
            ...lpData,
          }
        })
      )
      setPrincipalDataset(data)
    } catch (e) {
      console.log('getBondTellerData', e)
    }
  }, [account, tellerDataset])

  useEffect(() => {
    setMounting(true)
  }, [tellers])

  useEffect(() => {
    getBondTellerData()
  }, [getBondTellerData])

  useEffect(() => {
    getBondPrincipalData()
  }, [getBondPrincipalData])

  return { tellerDetails, mounting }
}
