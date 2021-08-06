/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import managers
    import components
    import hooks
    import utils

    Statistics function
      custom hooks
      useState hooks
      Contract functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { useEffect, useState } from 'react'

/* import packages */
import { formatEther, parseEther } from '@ethersproject/units'

/* import constants */
import { DEFAULT_CHAIN_ID, GAS_LIMIT } from '../../constants'
import { TransactionCondition, FunctionName, Unit, PolicyState } from '../../constants/enums'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'
import { useToasts } from '../../context/NotificationsManager'
import { useCachedData } from '../../context/CachedDataManager'

/* import components */
import { BoxRow, Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { Button } from '../atoms/Button'
import { Text, TextSpan } from '../atoms/Typography'
import { WalletConnectButton } from '../molecules/WalletConnect'

/* import hooks */
import { useCapitalPoolSize } from '../../hooks/useVault'
import { useTotalPendingRewards } from '../../hooks/useRewards'
import { useSolaceBalance } from '../../hooks/useBalance'
import { usePolicyGetter } from '../../hooks/useGetter'
import { useGetTotalValueLocked } from '../../hooks/useFarm'

/* import utils */
import { fixed, getGasValue, floatEther, truncateBalance, getNativeTokenUnit } from '../../utils/formatting'

export const Statistics: React.FC = () => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { account, errors, chainId, initialized } = useWallet()
  const { master } = useContracts()
  const { makeTxToast } = useToasts()
  const {
    addLocalTransactions,
    reload,
    gasPrices,
    tokenPositionDataInitialized,
    latestBlock,
    version,
  } = useCachedData()
  const capitalPoolSize = useCapitalPoolSize()
  // const totalUserRewards = useTotalPendingRewards()
  const { allPolicies } = usePolicyGetter(true, latestBlock, tokenPositionDataInitialized, version)
  // const totalValueLocked = useGetTotalValueLocked()

  /*************************************************************************************

  useState hooks

  *************************************************************************************/
  const [totalActiveCoverAmount, setTotalActiveCoverAmount] = useState<number | string>('-')
  const [totalActivePolicies, setTotalActivePolicies] = useState<number | string>('-')

  /*************************************************************************************

  Contract functions

  *************************************************************************************/
  // const claimRewards = async () => {
  //   if (!master) return
  //   const txType = FunctionName.WITHDRAW_REWARDS
  //   try {
  //     const tx = await master.withdrawRewards({
  //       gasPrice: getGasValue(gasPrices.options[1].value),
  //       gasLimit: GAS_LIMIT,
  //     })
  //     const txHash = tx.hash
  //     const localTx = {
  //       hash: txHash,
  //       type: txType,
  //       value: truncateBalance(totalUserRewards),
  //       status: TransactionCondition.PENDING,
  //       unit: Unit.SOLACE,
  //     }
  //     addLocalTransactions(localTx)
  //     makeTxToast(txType, TransactionCondition.PENDING, txHash)
  //     reload()
  //     await tx.wait().then((receipt: any) => {
  //       const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
  //       makeTxToast(txType, status, txHash)
  //       reload()
  //     })
  //   } catch (err) {
  //     if (err?.code === 4001) {
  //       console.log('Transaction rejected.')
  //     } else {
  //       console.log(`Transaction failed: ${err.message}`)
  //     }
  //     makeTxToast(txType, TransactionCondition.CANCELLED)
  //     reload()
  //   }
  // }

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    try {
      const fetchPolicies = async () => {
        const activePolicies = allPolicies.filter(({ status }) => status === PolicyState.ACTIVE)
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
  }, [allPolicies])

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <BoxRow>
      {initialized && account ? null : (
        <Box>
          <BoxItem>
            <WalletConnectButton />
          </BoxItem>
        </Box>
      )}
      <Box purple>
        <BoxItem>
          <BoxItemTitle h3>Capital Pool Size</BoxItemTitle>
          <Text h2 nowrap>
            {`${truncateBalance(floatEther(parseEther(capitalPoolSize)), 1)} `}
            <TextSpan h3>{getNativeTokenUnit(chainId ?? DEFAULT_CHAIN_ID)}</TextSpan>
          </Text>
        </BoxItem>
        {/* <BoxItem>
          <BoxItemTitle h3>Total Value Locked</BoxItemTitle>
          <Text h2 nowrap>
            {`${truncateBalance(parseFloat(totalValueLocked), 1)} `}
            <TextSpan h3>{getNativeTokenUnit(chainId ?? DEFAULT_CHAIN_ID)}</TextSpan>
          </Text>
        </BoxItem> */}
        <BoxItem>
          <BoxItemTitle h3>Active Cover Amount</BoxItemTitle>
          <Text h2 nowrap>
            {totalActiveCoverAmount !== '-'
              ? `${truncateBalance(parseFloat(formatEther(totalActiveCoverAmount.toString())), 2)} `
              : `${totalActiveCoverAmount} `}
            <TextSpan h3>{getNativeTokenUnit(chainId ?? DEFAULT_CHAIN_ID)}</TextSpan>
          </Text>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Total Active Policies</BoxItemTitle>
          <Text h2 nowrap>
            {totalActivePolicies}
          </Text>
        </BoxItem>
      </Box>
    </BoxRow>
  )
}
