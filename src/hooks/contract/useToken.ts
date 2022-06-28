import { useEffect, useState, useMemo, useCallback } from 'react'
import { Contract } from '@ethersproject/contracts'
import { useCachedData } from '../../context/CachedDataManager'
import { hasApproval } from '../../utils'
import { withBackoffRetries } from '../../utils/time'
import { useWeb3React } from '@web3-react/core'
import { useProvider } from '../../context/ProviderManager'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'
import { MAX_APPROVAL_AMOUNT } from '../../constants'
import { useNotifications } from '../../context/NotificationsManager'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { useNetwork } from '../../context/NetworkManager'
import { useTransactionExecution } from '../internal/useInputAmount'

export const useTokenAllowance = (
  tokenContract: Contract | null,
  spender: string | null,
  parsedAmount: string
): boolean => {
  const { account } = useWeb3React()
  const { latestBlock } = useProvider()
  const { version } = useCachedData()
  const [allowance, setAllowance] = useState<string>('0')
  const approval = useMemo(() => hasApproval(allowance, parsedAmount), [parsedAmount, allowance])

  const checkAllowance = async () => {
    if (!account || !tokenContract || !spender) return
    try {
      const _allowance = await withBackoffRetries(async () => tokenContract.allowance(account, spender))
      setAllowance(_allowance.toString())
    } catch (err) {
      console.log('checkAllowance', err)
    }
  }

  useEffect(() => {
    checkAllowance()
  }, [tokenContract, spender, parsedAmount, account, version, latestBlock])

  return approval
}

export const useTokenInfiniteApprove = (
  setLoading?: (loading: boolean) => void
): {
  unlimitedApprove: (tokenAddr: string, tokenAbi: any, spender: string) => Promise<void>
} => {
  const { signer } = useProvider()
  const { activeNetwork } = useNetwork()
  const { makeTxToast } = useNotifications()
  const { reload } = useCachedData()
  const { handleContractCallError } = useTransactionExecution()

  const unlimitedApprove = useCallback(
    async (tokenAddr: string, tokenAbi: any, spender: string) => {
      if (!signer || !tokenAbi) return
      const tokenContract = new Contract(tokenAddr, tokenAbi, signer)
      try {
        const tx: TransactionResponse = await tokenContract.approve(spender, MAX_APPROVAL_AMOUNT)
        const txHash = tx.hash
        if (setLoading) setLoading(true)
        makeTxToast(FunctionName.APPROVE, TransactionCondition.PENDING, txHash)
        await tx.wait(activeNetwork.rpc.blockConfirms).then((receipt: TransactionReceipt) => {
          const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
          makeTxToast(FunctionName.APPROVE, status, txHash)
          reload()
        })
        if (setLoading) setLoading(false)
      } catch (e) {
        handleContractCallError('approve', e, FunctionName.APPROVE)
      }
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [activeNetwork.rpc.blockConfirms, handleContractCallError, makeTxToast, reload, signer]
  )

  return { unlimitedApprove }
}
