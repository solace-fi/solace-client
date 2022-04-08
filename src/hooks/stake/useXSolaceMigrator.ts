import { useMemo } from 'react'
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'
import { LocalTx } from '../../constants/types'
import { BigNumber } from 'ethers'
import { getPermitErc20Signature } from '../../utils/signature'
import { DEADLINE } from '../../constants'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { FunctionGasLimits } from '../../constants/mappings/gasMapping'
import { useGetFunctionGas } from '../provider/useGas'

export const useXSolaceMigrator = () => {
  const { keyContracts } = useContracts()
  const { xSolaceMigrator, xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])
  const { library } = useWallet()
  const { chainId } = useNetwork()
  const { gasConfig } = useGetFunctionGas()

  const migrate = async (account: string, end: BigNumber, amount: BigNumber) => {
    if (!xSolaceMigrator || !xSolaceV1) return { tx: null, localTx: null }
    const { v, r, s } = await getPermitErc20Signature(
      account,
      chainId,
      library,
      xSolaceMigrator.address,
      xSolaceV1,
      amount
    )
    const estGas = await xSolaceMigrator.estimateGas.migrateSigned(amount, end, DEADLINE, v, r, s)
    console.log('xSolaceMigrator.estimateGas.migrateSigned', estGas.toString())
    const tx = await xSolaceMigrator.migrateSigned(amount, end, DEADLINE, v, r, s, {
      ...gasConfig,
      // gasLimit: FunctionGasLimits['xSolaceMigrator.migrateSigned'],
      gasLimit: parseInt(estGas.toString()),
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.STAKING_MIGRATE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return { migrate }
}
