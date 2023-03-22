import { BigNumber } from 'ethers'
import { useCallback } from 'react'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'
import { useGetFunctionGas } from '../provider/useGas'

export const useMigrate = () => {
  const { keyContracts } = useContracts()
  const { migration } = keyContracts
  const { gasConfig } = useGetFunctionGas()

  const migrate = useCallback(
    async (account: string, amount: BigNumber, proof: string[]) => {
      if (!migration) return { tx: null, localTx: null }
      const tx = await migration.migrate(account, amount, proof, { ...gasConfig, gasLimit: 144000 })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.MIGRATE,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [migration, gasConfig]
  )

  const migrated = useCallback(
    async (address: string): Promise<boolean> => {
      if (!migration) return false
      const balance = await migration.migrated(address)
      return balance
    },
    [migration]
  )

  const verify = useCallback(
    async (account: string, amount: BigNumber, proof: string[]): Promise<boolean> => {
      if (!migration) return false
      const verification = await migration.verify(account, amount, proof)
      return verification
    },
    [migration]
  )

  return {
    migrate,
    migrated,
    verify,
  }
}
