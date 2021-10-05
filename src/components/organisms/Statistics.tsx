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
import { formatUnits, parseUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import constants */
import { GAS_LIMIT, MAX_MOBILE_SCREEN_WIDTH, ZERO } from '../../constants'
import { TransactionCondition, FunctionName, Unit, PolicyState } from '../../constants/enums'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'
import { useToasts } from '../../context/NotificationsManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import components */
import { BoxRow, Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Text, TextSpan } from '../atoms/Typography'
import { WalletConnectButton } from '../molecules/WalletConnectButton'
import { FormRow, FormCol } from '../atoms/Form'
import { Card, CardContainer } from '../atoms/Card'
import { StyledTooltip } from '../molecules/Tooltip'

/* import hooks */
import { useCapitalPoolSize } from '../../hooks/useVault'
import { useTotalPendingRewards } from '../../hooks/useRewards'
import { useSolaceBalance } from '../../hooks/useBalance'
import { usePolicyGetter } from '../../hooks/usePolicyGetter'
import { useGetTotalValueLocked } from '../../hooks/useFarm'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { useGasConfig } from '../../hooks/useGas'

/* import utils */
import { fixed, floatUnits, truncateBalance } from '../../utils/formatting'

export const Statistics: React.FC = () => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { errors } = useGeneral()
  const { account, initialized } = useWallet()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { master } = useContracts()
  const { makeTxToast } = useToasts()
  const { addLocalTransactions, reload, gasPrices, tokenPositionData, latestBlock } = useCachedData()
  const capitalPoolSize = useCapitalPoolSize()
  const solaceBalance = useSolaceBalance()
  const totalUserRewards = useTotalPendingRewards()
  const { allPolicies } = usePolicyGetter(true, latestBlock, tokenPositionData)
  const totalValueLocked = useGetTotalValueLocked()
  const { width } = useWindowDimensions()
  const { gasConfig } = useGasConfig(gasPrices.selected?.value)
  /*************************************************************************************

  useState hooks

  *************************************************************************************/
  const [totalActiveCoverAmount, setTotalActiveCoverAmount] = useState<string>('-')
  const [totalActivePolicies, setTotalActivePolicies] = useState<number | string>('-')

  /*************************************************************************************

  Contract functions

  *************************************************************************************/
  const claimRewards = async () => {
    if (!master) return
    const txType = FunctionName.WITHDRAW_REWARDS
    try {
      const tx = await master.withdrawRewards({
        ...gasConfig,
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
        const activeCoverAmount = activePolicies.reduce((pv, cv) => pv.add(cv.coverAmount), ZERO)
        setTotalActiveCoverAmount(formatUnits(activeCoverAmount, currencyDecimals))
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
              {/* <BoxItem>
                <BoxItemTitle h4>
                  My Balance <StyledTooltip id={'solace'} tip={'Number of SOLACE tokens in your wallet'} />
                </BoxItemTitle>
                <Text h2 high_em>
                  {`${truncateBalance(solaceBalance, 1)} `}
                  <TextSpan h4>SOLACE</TextSpan>
                </Text>
              </BoxItem> */}
              <BoxItem>
                <BoxItemTitle h4>
                  My Unclaimed Rewards{' '}
                  <StyledTooltip
                    id={'rewards'}
                    tip={'Total amount of your unclaimed rewards'}
                    link={'https://docs.solace.fi/docs/user-guides/earn-rewards'}
                  />
                </BoxItemTitle>
                <Text h2 high_em>
                  {`${truncateBalance(totalUserRewards, 1)} `}
                  <TextSpan h4>SOLACE</TextSpan>
                </Text>
              </BoxItem>
              <BoxItem>
                <Button disabled={errors.length > 0 || fixed(totalUserRewards, 6) <= 0} onClick={claimRewards}>
                  Claim Option
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
          <Box color2>
            <BoxItem>
              <BoxItemTitle h4>
                Capital Pool Size <StyledTooltip id={'cps'} tip={'Current amount of capital in the vault'} />
              </BoxItemTitle>
              <Text h2 nowrap high_em>
                {`${truncateBalance(floatUnits(parseUnits(capitalPoolSize, currencyDecimals), currencyDecimals), 1)} `}
                <TextSpan h4>{activeNetwork.nativeCurrency.symbol}</TextSpan>
              </Text>
            </BoxItem>
            <BoxItem>
              <BoxItemTitle h4>
                Total Value Locked <StyledTooltip id={'tvl'} tip={'Current amount of funds locked into the pools'} />{' '}
              </BoxItemTitle>
              <Text h2 nowrap high_em>
                {`${truncateBalance(totalValueLocked, 1)} `}
                <TextSpan h4>{activeNetwork.nativeCurrency.symbol}</TextSpan>
              </Text>
            </BoxItem>
            <BoxItem>
              <BoxItemTitle h4>
                Active Cover Amount <StyledTooltip id={'aca'} tip={'Current amount of coverage in use'} />
              </BoxItemTitle>
              <Text h2 nowrap high_em>
                {totalActiveCoverAmount !== '-' ? `${truncateBalance(totalActiveCoverAmount, 2)} ` : `- `}
                <TextSpan h4>{activeNetwork.nativeCurrency.symbol}</TextSpan>
              </Text>
            </BoxItem>
            <BoxItem>
              <BoxItemTitle h4>Total Active Policies</BoxItemTitle>
              <Text h2 nowrap high_em>
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
              <Card color1>
                {/* <FormRow>
                  <FormCol>My Balance</FormCol>
                  <FormCol>
                    <Text h2 high_em>
                      {`${truncateBalance(solaceBalance, 1)} `}
                      <TextSpan h4>SOLACE</TextSpan>
                    </Text>
                  </FormCol>
                </FormRow> */}
                <FormRow>
                  <FormCol>My Unclaimed Rewards</FormCol>
                  <FormCol>
                    <Text h2 high_em>
                      {`${truncateBalance(totalUserRewards, 1)} `}
                      <TextSpan h4>SOLACE</TextSpan>
                    </Text>
                  </FormCol>
                </FormRow>
                <ButtonWrapper>
                  <Button
                    widthP={100}
                    disabled={errors.length > 0 || fixed(totalUserRewards, 6) <= 0}
                    onClick={claimRewards}
                  >
                    Claim Option
                  </Button>
                </ButtonWrapper>
              </Card>
              <Card color2>
                <FormRow>
                  <FormCol>Capital Pool Size</FormCol>
                  <FormCol>
                    <Text h2 nowrap high_em>
                      {`${truncateBalance(
                        floatUnits(parseUnits(capitalPoolSize, currencyDecimals), currencyDecimals),
                        1
                      )} `}
                      <TextSpan h4>{activeNetwork.nativeCurrency.symbol}</TextSpan>
                    </Text>
                  </FormCol>
                </FormRow>
                <FormRow>
                  <FormCol>Total Value Locked</FormCol>
                  <FormCol>
                    <Text h2 nowrap high_em>
                      {`${truncateBalance(totalValueLocked, 1)} `}
                      <TextSpan h4>{activeNetwork.nativeCurrency.symbol}</TextSpan>
                    </Text>
                  </FormCol>
                </FormRow>
                <FormRow>
                  <FormCol>Active Cover Amount</FormCol>
                  <FormCol>
                    <Text h2 nowrap high_em>
                      {totalActiveCoverAmount !== '-' ? `${truncateBalance(totalActiveCoverAmount, 2)} ` : `- `}
                      <TextSpan h4>{activeNetwork.nativeCurrency.symbol}</TextSpan>
                    </Text>
                  </FormCol>
                </FormRow>
                <FormRow>
                  <FormCol>Total Active Policies</FormCol>
                  <FormCol>
                    <Text h2 nowrap high_em>
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
