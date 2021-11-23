import { useContracts } from '../context/ContractsManager'
import { useNetwork } from '../context/NetworkManager'
import { useWallet } from '../context/WalletManager'
import { GasConfiguration, LocalTx, TxResult } from '../constants/types'
import { BigNumber } from 'ethers'
import { DEADLINE } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { getXSolaceStakeSignature } from '../utils/signature'
import { FunctionGasLimits } from '../constants/mappings'

export const useXSolace = () => {
  const { solace, xSolace } = useContracts()
  const { account, library } = useWallet()
  const { chainId } = useNetwork()

  const stake = async (parsedAmount: BigNumber, txVal: string, gasConfig: GasConfiguration) => {
    if (!solace || !xSolace || !account) return { tx: null, localTx: null }
    const { v, r, s } = await getXSolaceStakeSignature(account, chainId, library, solace, xSolace, parsedAmount)
    const tx = await xSolace.stakeSigned(account, parsedAmount, DEADLINE, v, r, s, {
      ...gasConfig,
      gasLimit: FunctionGasLimits['xSolace.stakeSigned'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.STAKE,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const unstake = async (parsedAmount: BigNumber, txVal: string, gasConfig: GasConfiguration): Promise<TxResult> => {
    if (!xSolace) return { tx: null, localTx: null }
    const tx = await xSolace.unstake(parsedAmount, {
      ...gasConfig,
      gasLimit: FunctionGasLimits['xSolace.unstake'],
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.UNSTAKE,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return { stake, unstake }
}
