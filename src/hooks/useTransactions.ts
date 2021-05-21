import { useState } from 'react'

type Transaction = {
  type: string
  hash: string
  amount: string
  blockHash: string
  stat: string
  unit: string
  time: string
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const addTransaction = (type: string, tx: any, amount: string, unit: string) => {
    setTransactions((transactions) =>
      [
        {
          type: type,
          hash: tx.hash,
          amount: amount,
          blockHash: '',
          stat: 'Pending',
          unit: unit,
          time: new Date(Date.now()).toString().split('-')[0],
        },
      ].concat(transactions)
    )
  }

  const updateTransactions = (tx: any, stat: string) => {
    setTransactions((transactions) =>
      transactions.map((transaction) => {
        if (transaction.hash == tx.transactionHash) return { ...transaction, blockHash: tx.blockHash, stat: stat }
        return transaction
      })
    )
  }

  const deleteTransactions = (tx: any) => {
    setTransactions((transactions) =>
      transactions.filter((transaction) => {
        transaction.hash !== tx.transactionHash
      })
    )
  }

  return { transactions, addTransaction, updateTransactions, deleteTransactions }
}
