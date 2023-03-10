import { ZERO } from '@solace-fi/sdk-nightly'
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

  const migrate = useCallback(async () => {
    if (!migration) return { tx: null, localTx: null }
    const tx = await migration.migrate({ ...gasConfig, gasLimit: 800000 })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.MIGRATE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }, [migration])

  const balanceOf = useCallback(
    async (address: string): Promise<BigNumber> => {
      if (!migration) return ZERO
      const balance = await migration.balanceOf(address)
      return balance
    },
    [migration]
  )

  return {
    migrate,
    balanceOf,
  }
}
