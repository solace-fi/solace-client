import { useMemo } from 'react'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { useNetwork } from '../context/NetworkManager'
import { GasConfiguration, LocalTx } from '../constants/types'
import { BigNumber } from 'ethers'
import { getPermitErc20Signature } from '../utils/signature'
import { DEADLINE, GAS_LIMIT, ZERO } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'

export const useXSolaceMigrator = () => {
  const { keyContracts } = useContracts()
  const { xSolaceMigrator, solace } = useMemo(() => keyContracts, [keyContracts])
  const { library } = useWallet()
  const { chainId } = useNetwork()

  const migrate = async (account: string, amount: BigNumber, txVal: string, gasConfig: GasConfiguration) => {
    if (!xSolaceMigrator || !solace) return
    const { v, r, s } = await getPermitErc20Signature(
      account,
      chainId,
      library,
      xSolaceMigrator.address,
      solace,
      amount
    )
    const tx = await xSolaceMigrator.migrateSigned(amount, ZERO, DEADLINE, v, r, s, {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.SOLACE_MIGRATE,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return { migrate }
}
