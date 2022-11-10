import { BigNumber, ZERO } from '@solace-fi/sdk-nightly'
import { useCallback } from 'react'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'
import { useGetFunctionGas } from '../provider/useGas'

export const useDepositHelper = () => {
  const { keyContracts } = useContracts()
  const { depositHelper } = keyContracts
  const { gasConfig } = useGetFunctionGas()

  /**
   * @notice Calculates the amount of [`UWE`](./UnderwritingEquity) minted for an amount of a token deposited.
   * The deposit token may be one of the tokens in [`UWP`](./UnderwritingPool), the [`UWP`](./UnderwritingPool) token, or the [`UWE`](./UnderwritingEquity) token.
   * @param depositToken The address of the token to deposit.
   * @param depositAmount The amount of the token to deposit.
   * @return uweAmount The amount of [`UWE`](./UnderwritingEquity) that will be minted to the receiver.
   */
  const calculateDeposit = useCallback(
    async (depositToken: string, depositAmount: BigNumber): Promise<BigNumber> => {
      if (!depositHelper) return ZERO
      try {
        const uweAmount = await depositHelper.calculateDeposit(depositToken, depositAmount)
        return uweAmount
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [depositHelper]
  )

  /**
   * @notice Deposits tokens into [`UWE`](./UnderwritingEquity) and deposits [`UWE`](./UnderwritingEquity) into a new [`UWE Lock`](./UnderwritingLocker).
   * @param depositToken Address of the token to deposit.
   * @param depositAmount Amount of the token to deposit.
   * @param lockExpiry The timestamp the lock will unlock.
   * @return lockID The ID of the newly created [`UWE Lock`](./UnderwritingLocker).
   */
  const depositAndLock = useCallback(
    async (depositToken: string, depositAmount: BigNumber, lockExpiry: BigNumber) => {
      if (!depositHelper) return { tx: null, localTx: null }
      const tx = await depositHelper.depositAndLock(depositToken, depositAmount, lockExpiry, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.DEPOSIT_AND_LOCK,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [depositHelper, gasConfig]
  )

  /**
   * @notice Deposits tokens into [`UWE`](./UnderwritingEquity) and deposits [`UWE`](./UnderwritingEquity) into an existing [`UWE Lock`](./UnderwritingLocker).
   * @param depositToken Address of the token to deposit.
   * @param depositAmount Amount of the token to deposit.
   * @param lockID The ID of the [`UWE Lock`](./UnderwritingLocker) to deposit into.
   */
  const depositIntoLock = useCallback(
    async (depositToken: string, depositAmount: BigNumber, lockId: BigNumber) => {
      if (!depositHelper) return { tx: null, localTx: null }
      const tx = await depositHelper.depositIntoLock(depositToken, depositAmount, lockId, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.DEPOSIT_INTO_LOCK,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [depositHelper, gasConfig]
  )

  return {
    calculateDeposit,
    depositAndLock,
    depositIntoLock,
  }
}
