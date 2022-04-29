import { useMemo } from 'react'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'
import { LocalTx } from '../../constants/types'
import { BigNumber } from 'ethers'
import { getPermitErc20Signature } from '../../utils/signature'
import { DEADLINE } from '../../constants'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { useGetFunctionGas } from '../provider/useGas'
import { useProvider } from '../../context/ProviderManager'

export const useXSolaceMigrator = () => {
  const { keyContracts } = useContracts()
  const { xSolaceMigrator, xSolaceV1 } = useMemo(() => keyContracts, [keyContracts])
  const { library } = useProvider()
  const { activeNetwork } = useNetwork()
  const { gasConfig } = useGetFunctionGas()

  const migrate = async (account: string, end: BigNumber, amount: BigNumber) => {
    if (!xSolaceMigrator || !xSolaceV1) return { tx: null, localTx: null }
    const { v, r, s } = await getPermitErc20Signature(
      account,
      activeNetwork.chainId,
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
      gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
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
