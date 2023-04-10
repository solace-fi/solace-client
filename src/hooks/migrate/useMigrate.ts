import { BigNumber } from 'ethers'
import { useCallback } from 'react'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'
import { useGetFunctionGas } from '../provider/useGas'

export const useMigrate = () => {
  const { keyContracts } = useContracts()
  const { migration, migrationV2 } = keyContracts
  const { gasConfig } = useGetFunctionGas()

  const migrate = useCallback(
    async (account: string, amount: BigNumber, proof: string[]) => {
      if (!migrationV2) return { tx: null, localTx: null }
      const tx = await migrationV2.migrate(account, amount, proof, { ...gasConfig, gasLimit: 144000 })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.MIGRATE,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [migrationV2, gasConfig]
  )

  const migrated = useCallback(
    async (address: string): Promise<boolean> => {
      if (!migrationV2) return false
      const balance = await migrationV2.migrated(address)
      return balance
    },
    [migrationV2]
  )

  const verify = useCallback(
    async (account: string, amount: BigNumber, proof: string[]): Promise<boolean> => {
      if (!migrationV2) return false
      const verification = await migrationV2.verify(account, amount, proof)
      return verification
    },
    [migrationV2]
  )

  return {
    migrate,
    migrated,
    verify,
  }
}
