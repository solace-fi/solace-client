import { BigNumber } from 'ethers'
import { useContracts } from '../context/ContractsManager'
import { GAS_LIMIT } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { LocalTx } from '../constants/types'

export const useCpFarm = () => {
  const { cpFarm } = useContracts()

  const depositEth = async (
    parsedAmount: BigNumber,
    txVal: string,
    gasConfig: any
  ): Promise<
    | {
        tx: null
        localTx: null
      }
    | {
        tx: any
        localTx: LocalTx
      }
  > => {
    if (!cpFarm) return { tx: null, localTx: null }
    const tx = await cpFarm.depositEth({
      value: parsedAmount,
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx = {
      hash: tx.hash,
      type: FunctionName.DEPOSIT_ETH,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const depositCp = async (
    parsedAmount: BigNumber,
    txVal: string,
    gasConfig: any
  ): Promise<
    | {
        tx: null
        localTx: null
      }
    | {
        tx: any
        localTx: LocalTx
      }
  > => {
    if (!cpFarm) return { tx: null, localTx: null }
    const tx = await cpFarm.depositCp(parsedAmount, {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx = {
      hash: tx.hash,
      type: FunctionName.DEPOSIT_CP,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const withdrawCp = async (
    parsedAmount: BigNumber,
    txVal: string,
    gasConfig: any
  ): Promise<
    | {
        tx: null
        localTx: null
      }
    | {
        tx: any
        localTx: LocalTx
      }
  > => {
    if (!cpFarm) return { tx: null, localTx: null }
    const tx = await cpFarm.withdrawCp(parsedAmount, {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx = {
      hash: tx.hash,
      type: FunctionName.WITHDRAW_CP,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return { depositEth, depositCp, withdrawCp }
}
