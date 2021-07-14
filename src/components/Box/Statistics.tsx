/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import managers
    import components
    import hooks
    import wallet
    import utils

    Statistics function
      useRef variables
      custom hooks
      useState hooks
      Contract functions
      Local functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { useEffect, useRef, useState } from 'react'

/* import packages */
import { formatEther, parseEther } from '@ethersproject/units'
import { Contract } from '@ethersproject/contracts'

/* import constants */
import { GAS_LIMIT } from '../../constants'
import { TransactionConditions, FunctionNames, Units, PolicyStates } from '../../constants/enums'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'
import { useToasts } from '../../context/NotificationsManager'
import { useUserData } from '../../context/UserDataManager'

/* import components */
import { BoxRow, Box, BoxItem, BoxItemValue, BoxItemTitle, BoxItemUnits } from './index'
import { Button } from '../Button'

/* import hooks */
import { useCapitalPoolSize } from '../../hooks/useCapitalPoolSize'
import { useTotalPendingRewards } from '../../hooks/useRewards'
import { useSolaceBalance } from '../../hooks/useSolaceBalance'
import { usePoolStakedValue } from '../../hooks/usePoolStakedValue'
import { usePolicyGetter, Policy } from '../../hooks/useGetter'

/* import wallet */
import { WalletConnectButton } from '../Button/WalletConnect'

/* import utils */
import { getAllPolicies } from '../../utils/paclas'
import { fixed, getGasValue, floatEther, truncateBalance } from '../../utils/formatting'

export const Statistics = () => {
  /************************************************************************************* 

    useRef variables 

  *************************************************************************************/
  const masterContract = useRef<Contract | null>()
  const vaultContract = useRef<Contract | null>()
  const solaceContract = useRef<Contract | null>()
  const cpFarmContract = useRef<Contract | null>()
  const lpFarmContract = useRef<Contract | null>()
  const lpTokenContract = useRef<Contract | null>()

  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const wallet = useWallet()
  const { master, vault, solace, cpFarm, lpFarm, lpToken } = useContracts()
  const { errors, makeTxToast } = useToasts()
  const { addLocalTransactions } = useUserData()
  const capitalPoolSize = useCapitalPoolSize()
  const solaceBalance = useSolaceBalance()
  const totalUserRewards = useTotalPendingRewards()
  const cpPoolValue = usePoolStakedValue(cpFarm)
  const lpPoolValue = usePoolStakedValue(lpFarm)
  const { getPolicies } = usePolicyGetter()

  /*************************************************************************************

  useState hooks

  *************************************************************************************/
  const [totalValueLocked, setTotalValueLocked] = useState<string>('0.00')
  const [totalActiveCoverAmount, setTotalActiveCoverAmount] = useState<number | string>('-')
  const [totalActivePolicies, setTotalActivePolicies] = useState<number | string>('-')

  /*************************************************************************************

  Contract functions

  *************************************************************************************/
  const claimRewards = async () => {
    if (!masterContract.current) return
    const txType = FunctionNames.WITHDRAW_REWARDS
    try {
      const tx = await masterContract.current.withdrawRewards({
        gasPrice: getGasValue(wallet.gasPrices.options[1].value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      addLocalTransactions({
        hash: txHash,
        type: txType,
        value: totalUserRewards,
        status: TransactionConditions.PENDING,
        unit: Units.SOLACE,
      })
      makeTxToast(txType, TransactionConditions.PENDING, txHash)
      wallet.reload()
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionConditions.SUCCESS : TransactionConditions.FAILURE
        makeTxToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      if (err?.code === 4001) {
        console.log('Transaction rejected.')
      } else {
        console.log(`Transaction failed: ${err.message}`)
      }
      makeTxToast(txType, TransactionConditions.CANCELLED)
      wallet.reload()
    }
  }

  /*************************************************************************************

  Local functions

  *************************************************************************************/
  const getTotalValueLocked = () => {
    const formattedTVL = formatEther(parseEther(cpPoolValue).add(parseEther(lpPoolValue)))
    setTotalValueLocked(formattedTVL)
  }

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/
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
  }, [cpPoolValue, lpPoolValue])

  useEffect(() => {
    try {
      const fetchPolicies = async () => {
        const policies: Policy[] = await getPolicies()
        const activePolicies = policies.filter(({ status }) => status === PolicyStates.ACTIVE)

        let activeCoverAmount = 0
        activePolicies.forEach(({ coverAmount }) => {
          try {
            activeCoverAmount += parseFloat(coverAmount)
          } catch (e) {
            console.log(e)
          }
        })

        setTotalActiveCoverAmount(activeCoverAmount)
        setTotalActivePolicies(activePolicies.length)
      }
      fetchPolicies()
    } catch (err) {
      console.log(err)
    }
  }, [wallet.chainId])

  return (
    <BoxRow>
      {wallet.initialized && wallet.account ? (
        <Box>
          <BoxItem>
            <BoxItemTitle h3>My Balance</BoxItemTitle>
            <BoxItemValue h2>
              {`${truncateBalance(parseFloat(solaceBalance), 6)} `}
              <BoxItemUnits h3>SOLACE</BoxItemUnits>
            </BoxItemValue>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3>My Rewards</BoxItemTitle>
            <BoxItemValue h2>
              {`${truncateBalance(parseFloat(totalUserRewards), 6)} `}
              <BoxItemUnits h3>SOLACE</BoxItemUnits>
            </BoxItemValue>
          </BoxItem>
          <BoxItem>
            <Button disabled={errors.length > 0 || fixed(parseFloat(totalUserRewards), 6) <= 0} onClick={claimRewards}>
              Claim
            </Button>
          </BoxItem>
        </Box>
      ) : (
        <Box>
          <BoxItem>
            <WalletConnectButton />
          </BoxItem>
        </Box>
      )}
      <Box purple>
        <BoxItem>
          <BoxItemTitle h3>Capital Pool Size</BoxItemTitle>
          <BoxItemValue h2 nowrap>
            {`${truncateBalance(floatEther(parseEther(capitalPoolSize)), 1)} `}
            <BoxItemUnits h3>{Units.ETH}</BoxItemUnits>
          </BoxItemValue>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Total Value Locked</BoxItemTitle>
          <BoxItemValue h2 nowrap>
            {`${truncateBalance(parseFloat(totalValueLocked), 1)} `}
            <BoxItemUnits h3>{Units.ETH}</BoxItemUnits>
          </BoxItemValue>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Active Cover Amount</BoxItemTitle>
          <BoxItemValue h2 nowrap>
            {totalActiveCoverAmount !== '-'
              ? `${truncateBalance(parseFloat(formatEther(totalActiveCoverAmount.toString())), 2)} `
              : `${totalActiveCoverAmount} `}
            <BoxItemUnits h3>{Units.ETH}</BoxItemUnits>
          </BoxItemValue>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Total Active Policies</BoxItemTitle>
          <BoxItemValue h2 nowrap>
            {totalActivePolicies}
          </BoxItemValue>
        </BoxItem>
      </Box>
    </BoxRow>
  )
}
