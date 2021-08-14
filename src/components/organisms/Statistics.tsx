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
import { GAS_LIMIT, MAX_MOBILE_SCREEN_WIDTH } from '../../constants'
import { TransactionCondition, FunctionName, Unit, PolicyState } from '../../constants/enums'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'
import { useToasts } from '../../context/NotificationsManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { BoxRow, Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Text, TextSpan } from '../atoms/Typography'
import { WalletConnectButton } from '../molecules/WalletConnect'
import { FormRow, FormCol } from '../atoms/Form'
import { Card, CardContainer } from '../atoms/Card'

/* import hooks */
import { useCapitalPoolSize } from '../../hooks/useVault'
import { useTotalPendingRewards } from '../../hooks/useRewards'
import { useSolaceBalance } from '../../hooks/useBalance'
import { usePolicyGetter } from '../../hooks/useGetter'
import { useGetTotalValueLocked } from '../../hooks/useFarm'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { fixed, getGasValue, floatEther, truncateBalance } from '../../utils/formatting'

export const Statistics: React.FC = () => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { account, errors, initialized } = useWallet()
  const { activeNetwork } = useNetwork()
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
  const solaceBalance = useSolaceBalance()
  const totalUserRewards = useTotalPendingRewards()
  const { allPolicies } = usePolicyGetter(true, latestBlock, tokenPositionDataInitialized, version)
  const totalValueLocked = useGetTotalValueLocked()
  const { width } = useWindowDimensions()

  /*************************************************************************************

  useState hooks

  *************************************************************************************/
  const [totalActiveCoverAmount, setTotalActiveCoverAmount] = useState<number | string>('-')
  const [totalActivePolicies, setTotalActivePolicies] = useState<number | string>('-')

  /*************************************************************************************

  Contract functions

  *************************************************************************************/
  const claimRewards = async () => {
    if (!master) return
    const txType = FunctionName.WITHDRAW_REWARDS
    try {
      const tx = await master.withdrawRewards({
        gasPrice: getGasValue(gasPrices.options[1].value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: truncateBalance(totalUserRewards),
        status: TransactionCondition.PENDING,
        unit: Unit.SOLACE,
      }
      addLocalTransactions(localTx)
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      reload()
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        reload()
      })
    } catch (err) {
      if (err?.code === 4001) {
        console.log('Transaction rejected.')
      } else {
        console.log(`Transaction failed: ${err.message}`)
      }
      makeTxToast(txType, TransactionCondition.CANCELLED)
      reload()
    }
  }

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
    <>
      {width > MAX_MOBILE_SCREEN_WIDTH ? (
        <BoxRow>
          {initialized && account ? (
            <Box>
              <BoxItem>
                <BoxItemTitle h3>My Balance</BoxItemTitle>
                <Text h2>
                  {`${truncateBalance(parseFloat(solaceBalance), 1)} `}
                  <TextSpan h3>SOLACE</TextSpan>
                </Text>
              </BoxItem>
              <BoxItem>
                <BoxItemTitle h3>My Rewards</BoxItemTitle>
                <Text h2>
                  {`${truncateBalance(parseFloat(totalUserRewards), 1)} `}
                  <TextSpan h3>SOLACE</TextSpan>
                </Text>
              </BoxItem>
              <BoxItem>
                <Button
                  disabled={errors.length > 0 || fixed(parseFloat(totalUserRewards), 6) <= 0}
                  onClick={claimRewards}
                >
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
              <Text h2 nowrap>
                {`${truncateBalance(floatEther(parseEther(capitalPoolSize)), 1)} `}
                <TextSpan h3>{activeNetwork.nativeCurrency.symbol}</TextSpan>
              </Text>
            </BoxItem>
            <BoxItem>
              <BoxItemTitle h3>Total Value Locked</BoxItemTitle>
              <Text h2 nowrap>
                {`${truncateBalance(parseFloat(totalValueLocked), 1)} `}
                <TextSpan h3>{activeNetwork.nativeCurrency.symbol}</TextSpan>
              </Text>
            </BoxItem>
            <BoxItem>
              <BoxItemTitle h3>Active Cover Amount</BoxItemTitle>
              <Text h2 nowrap>
                {totalActiveCoverAmount !== '-'
                  ? `${truncateBalance(parseFloat(formatEther(totalActiveCoverAmount.toString())), 2)} `
                  : `${totalActiveCoverAmount} `}
                <TextSpan h3>{activeNetwork.nativeCurrency.symbol}</TextSpan>
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
      ) : (
        // mobile version
        <>
          {initialized && account ? (
            <CardContainer m={20}>
              <Card blue>
                <FormRow>
                  <FormCol>My Balance</FormCol>
                  <FormCol>
                    <Text h2>
                      {`${truncateBalance(parseFloat(solaceBalance), 1)} `}
                      <TextSpan h3>SOLACE</TextSpan>
                    </Text>
                  </FormCol>
                </FormRow>
                <FormRow>
                  <FormCol>My Rewards</FormCol>
                  <FormCol>
                    <Text h2>
                      {`${truncateBalance(parseFloat(totalUserRewards), 1)} `}
                      <TextSpan h3>SOLACE</TextSpan>
                    </Text>
                  </FormCol>
                </FormRow>
                <ButtonWrapper>
                  <Button
                    widthP={100}
                    disabled={errors.length > 0 || fixed(parseFloat(totalUserRewards), 6) <= 0}
                    onClick={claimRewards}
                  >
                    Claim
                  </Button>
                </ButtonWrapper>
              </Card>
              <Card purple>
                <FormRow>
                  <FormCol>Capital Pool Size</FormCol>
                  <FormCol>
                    <Text h2 nowrap>
                      {`${truncateBalance(floatEther(parseEther(capitalPoolSize)), 1)} `}
                      <TextSpan h3>{activeNetwork.nativeCurrency.symbol}</TextSpan>
                    </Text>
                  </FormCol>
                </FormRow>
                <FormRow>
                  <FormCol>Total Value Locked</FormCol>
                  <FormCol>
                    <Text h2 nowrap>
                      {`${truncateBalance(parseFloat(totalValueLocked), 1)} `}
                      <TextSpan h3>{activeNetwork.nativeCurrency.symbol}</TextSpan>
                    </Text>
                  </FormCol>
                </FormRow>
                <FormRow>
                  <FormCol>Active Cover Amount</FormCol>
                  <FormCol>
                    <Text h2 nowrap>
                      {totalActiveCoverAmount !== '-'
                        ? `${truncateBalance(parseFloat(formatEther(totalActiveCoverAmount.toString())), 2)} `
                        : `${totalActiveCoverAmount} `}
                      <TextSpan h3>{activeNetwork.nativeCurrency.symbol}</TextSpan>
                    </Text>
                  </FormCol>
                </FormRow>
                <FormRow>
                  <FormCol>Total Active Policies</FormCol>
                  <FormCol>
                    <Text h2 nowrap>
                      {totalActivePolicies}
                    </Text>
                  </FormCol>
                </FormRow>
              </Card>
            </CardContainer>
          ) : (
            <Box>
              <BoxItem>
                <WalletConnectButton />
              </BoxItem>
            </Box>
          )}
        </>
      )}
    </>
  )
}
