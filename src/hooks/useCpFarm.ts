import { BigNumber } from 'ethers'
import { useContracts } from '../context/ContractsManager'
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
      gasLimit: 243022,
    })
    const localTx: LocalTx = {
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
      gasLimit: 122683,
    })
    const localTx: LocalTx = {
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
      gasLimit: 189538,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.WITHDRAW_CP,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return { depositEth, depositCp, withdrawCp }
}
