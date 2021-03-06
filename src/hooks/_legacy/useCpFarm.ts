import { BigNumber } from 'ethers'
import { useContracts } from '../../context/ContractsManager'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx, TxResult } from '../../constants/types'
import { FunctionGasLimits } from '../../constants/mappings/gas'
import { useMemo } from 'react'
import { useGetFunctionGas } from '../provider/useGas'

export const useCpFarm = () => {
  const { keyContracts } = useContracts()
  const { cpFarm } = useMemo(() => keyContracts, [keyContracts])
  const { gasConfig } = useGetFunctionGas()

  const depositEth = async (parsedAmount: BigNumber): Promise<TxResult> => {
    if (!cpFarm) return { tx: null, localTx: null }
    const tx = await cpFarm.depositEth({
      value: parsedAmount,
      ...gasConfig,
      gasLimit: FunctionGasLimits['cpFarm.depositEth'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.DEPOSIT_ETH,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const depositCp = async (parsedAmount: BigNumber): Promise<TxResult> => {
    if (!cpFarm) return { tx: null, localTx: null }
    const tx = await cpFarm.depositCp(parsedAmount, {
      ...gasConfig,
      gasLimit: FunctionGasLimits['cpFarm.depositCp'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.DEPOSIT_CP,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const withdrawCp = async (parsedAmount: BigNumber): Promise<TxResult> => {
    if (!cpFarm) return { tx: null, localTx: null }
    const estGas = await cpFarm.estimateGas.withdrawCp(parsedAmount)
    console.log('cpFarm.estimateGas.withdrawCp', estGas.toString())
    const tx = await cpFarm.withdrawCp(parsedAmount, {
      ...gasConfig,
      // gasLimit: FunctionGasLimits['cpFarm.withdrawCp'],
      gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.WITHDRAW_CP,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return { depositEth, depositCp, withdrawCp }
}
