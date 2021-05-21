import React, { useEffect, useRef, useState } from 'react'
import { BoxRow, Box, BoxItem, BoxItemValue, BoxItemTitle, BoxItemUnits } from './index'
import { Button } from '../Button'

import { Contract } from '@ethersproject/contracts'
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'
import { formatEther, parseEther } from '@ethersproject/units'

import { SUPPORTED_WALLETS } from '../../ethers/wallets'
import { useCapitalPoolSize } from '../../hooks/useCapitalPoolSize'
import { useScpBalance } from '../../hooks/useScpBalance'
import { useTotalPendingRewards } from '../../hooks/useRewards'
import { useSolaceBalance } from '../../hooks/useSolaceBalance'
import { usePoolStakedValue } from '../../hooks/usePoolStakedValue'
import { fixed, getGasValue } from '../../utils/fixedValue'
import { GAS_LIMIT } from '../../constants'

import { useToasts, Condition } from '../../context/NotificationsManager'
import { useTransactions } from '../../hooks/useTransactions'
import { useFetchGasPrice } from '../../hooks/useFetchGasPrice'

export const Statistics = () => {
  const wallet = useWallet()
  const { master, vault, solace, cpFarm, lpFarm, lpToken } = useContracts()
  const { makeToast } = useToasts()
  const { transactions, addTransaction, updateTransactions, deleteTransactions } = useTransactions()
  const gasPrices = useFetchGasPrice()

  const masterContract = useRef<Contract | null>()
  const vaultContract = useRef<Contract | null>()
  const solaceContract = useRef<Contract | null>()
  const cpFarmContract = useRef<Contract | null>()
  const lpFarmContract = useRef<Contract | null>()
  const lpTokenContract = useRef<Contract | null>()

  const [totalValueLocked, setTotalValueLocked] = useState<string>('0.00')
  const capitalPoolSize = useCapitalPoolSize()
  const solaceBalance = useSolaceBalance()
  const scpBalance = useScpBalance()

  const [lp, setLp] = useState<number>(0)

  const totalUserRewards = useTotalPendingRewards()

  const cpPoolValue = usePoolStakedValue(cpFarm)
  const lpPoolValue = usePoolStakedValue(lpFarm)

  const claimRewards = async () => {
    if (!masterContract.current) return
    const txType = 'Claim Rewards'
    try {
      const tx = await masterContract.current.withdrawRewards({
        gasPrice: getGasValue(gasPrices.options[1].value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      makeToast(txType, Condition.PENDING, txHash)
      addTransaction(txType, tx, totalUserRewards, 'Solace')
      await tx.wait().then((receipt: any) => {
        if (receipt.status) {
          console.log(receipt)
          makeToast(txType, Condition.SUCCESS, txHash)
          updateTransactions(receipt, 'Complete')
          wallet.reload()
        } else {
          console.log(receipt)
          makeToast(txType, Condition.FAILURE, txHash)
          deleteTransactions(tx)
          wallet.reload()
        }
      })
    } catch (err) {
      if (err?.code === 4001) {
        throw new Error('Transaction rejected.')
      } else {
        throw new Error(`transaction failed: ${err.message}`)
      }
      makeToast(txType, Condition.CANCELLED)
      wallet.reload()
    }
  }

  const getTotalValueLocked = () => {
    const formattedTVL = formatEther(parseEther(cpPoolValue).add(parseEther(lpPoolValue)))
    setTotalValueLocked(formattedTVL)
  }

  useEffect(() => {
    cpFarmContract.current = cpFarm
    lpFarmContract.current = lpFarm
    lpTokenContract.current = lpToken
    masterContract.current = master
    solaceContract.current = solace
    vaultContract.current = vault

    getTotalValueLocked()
  }, [master, vault, solace, cpFarm, lpFarm, lpToken])

  useEffect(() => {
    getTotalValueLocked()
  }, [cpPoolValue, lpPoolValue, wallet])

  return (
    <BoxRow>
      {wallet.initialized ? (
        <Box>
          <BoxItem>
            <BoxItemTitle h3>My Balance</BoxItemTitle>
            <BoxItemValue h2>
              {`${fixed(parseFloat(solaceBalance))} `}
              <BoxItemUnits h3>SOLACE</BoxItemUnits>
            </BoxItemValue>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3>My SCP</BoxItemTitle>
            <BoxItemValue h2>
              {`${fixed(parseFloat(scpBalance))} `}
              <BoxItemUnits h3>TOKENS</BoxItemUnits>
            </BoxItemValue>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3>My Rewards</BoxItemTitle>
            <BoxItemValue h2>
              {`${fixed(parseFloat(totalUserRewards))} `}
              <BoxItemUnits h3>SOLACE</BoxItemUnits>
            </BoxItemValue>
          </BoxItem>
          <BoxItem>
            <Button onClick={claimRewards}>Claim</Button>
          </BoxItem>
        </Box>
      ) : (
        <Box>
          <BoxItem>
            <Button
              onClick={() =>
                wallet.connect(SUPPORTED_WALLETS[SUPPORTED_WALLETS.findIndex((wallet) => wallet.id === 'metamask')])
              }
            >
              Connect Wallet
            </Button>
          </BoxItem>
        </Box>
      )}
      <Box purple>
        <BoxItem>
          <BoxItemTitle h3>Capital Pool Size</BoxItemTitle>
          <BoxItemValue h2>{fixed(parseFloat(formatEther(capitalPoolSize).toString()))}</BoxItemValue>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Total Value Locked</BoxItemTitle>
          <BoxItemValue h2>{fixed(parseFloat(totalValueLocked))}</BoxItemValue>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Active Cover Amount</BoxItemTitle>
          <BoxItemValue h2>$0</BoxItemValue>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Total Active Policies</BoxItemTitle>
          <BoxItemValue h2>0</BoxItemValue>
        </BoxItem>
      </Box>
    </BoxRow>
  )
}
