import useDebounce from '@rooks/use-debounce'
import { BigNumber } from 'ethers'
import { formatEther, parseEther } from 'ethers/lib/utils'
import React, { useEffect, useState } from 'react'
import { GAS_LIMIT, NUM_BLOCKS_PER_DAY } from '../constants'
import { useContracts } from '../context/ContractsManager'
import { useWallet } from '../context/WalletManager'
import { TransactionCondition, FunctionName, Unit } from '../constants/enums'
import { useUserData } from '../context/UserDataManager'
import { useToasts } from '../context/NotificationsManager'
import { getGasValue } from '../utils/formatting'

export const useBuyPolicy = (coverLimit: string, positionContract: string, days: string, quote: string): any => {
  const { compProduct } = useContracts()
  const wallet = useWallet()
  const { addLocalTransactions } = useUserData()
  const { makeTxToast } = useToasts()
  const [goNextStep, setGoNextStep] = useState<boolean>(false)

  const buyPolicy = async () => {
    if (!compProduct) return
    const txType = FunctionName.BUY_POLICY
    try {
      const tx = await compProduct.buyPolicy(
        wallet.account,
        positionContract,
        coverLimit,
        BigNumber.from(NUM_BLOCKS_PER_DAY * parseInt(days)),
        {
          value: parseEther(quote).add(parseEther(quote).div('10000')),
          gasPrice: getGasValue(wallet.gasPrices.selected.value),
          gasLimit: 450000,
        }
      )
      setGoNextStep(true)
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: '0', status: TransactionCondition.PENDING, unit: Unit.ETH }
      addLocalTransactions(localTx)
      wallet.reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        console.log('buyPolicy tx', tx)
        console.log('buyPolicy receipt', receipt)
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeTxToast(txType, TransactionCondition.CANCELLED)
      wallet.reload()
    }
  }

  return [buyPolicy, goNextStep]
}

export const useGetQuote = (coverLimit: string, positionContract: string, days: string): any => {
  const { compProduct } = useContracts()
  const { account } = useWallet()
  const [quote, setQuote] = useState<string>('0.00')

  const getQuote = async () => {
    if (!compProduct) return
    try {
      const quote = await compProduct.getQuote(
        account,
        positionContract,
        coverLimit,
        BigNumber.from(NUM_BLOCKS_PER_DAY * parseInt(days)),
        {
          gasLimit: GAS_LIMIT,
        }
      )
      const formattedQuote = formatEther(quote)
      setQuote(formattedQuote)
    } catch (err) {
      console.log('getQuote', err)
    }
  }

  const handleQuote = useDebounce(() => {
    getQuote()
  }, 300)

  useEffect(() => {
    handleQuote()
  }, [coverLimit, compProduct, account, positionContract, days])

  return quote
}
