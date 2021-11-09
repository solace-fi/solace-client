/*************************************************************************************

    Table of Contents:

    import packages
    import constants
    import managers
    import components
    import hooks
    import utils

    Statistics
      hooks
      contract functions
      useEffect hooks

  *************************************************************************************/

/* import packages */
import React, { useEffect, useState, useMemo } from 'react'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import constants */
import { BKPT_3, ZERO } from '../../constants'
import { TransactionCondition, FunctionName, Unit, PolicyState } from '../../constants/enums'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'
import { useNotifications } from '../../context/NotificationsManager'
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
import { useGetFunctionGas } from '../../hooks/useGas'

/* import utils */
import { truncateBalance } from '../../utils/formatting'
import { LocalTx } from '../../constants/types'

export const Statistics: React.FC = () => {
  /*************************************************************************************

  hooks

  *************************************************************************************/
  const { haveErrors } = useGeneral()
  const { account, initialized } = useWallet()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { farmController } = useContracts()
  const { makeTxToast } = useNotifications()
  const { addLocalTransactions, reload, tokenPosData, latestBlock } = useCachedData()
  const capitalPoolSize = useCapitalPoolSize()
  const solaceBalance = useSolaceBalance()
  const totalUserRewards = useTotalPendingRewards()
  const { allPolicies } = usePolicyGetter(true, latestBlock, tokenPosData)
  const totalValueLocked = useGetTotalValueLocked()
  const { width } = useWindowDimensions()
  const { getAutoGasConfig } = useGetFunctionGas()
  const gasConfig = useMemo(() => getAutoGasConfig(), [getAutoGasConfig])
  const [totalActiveCoverAmount, setTotalActiveCoverAmount] = useState<string>('-')
  const [totalActivePolicies, setTotalActivePolicies] = useState<string>('-')

  /*************************************************************************************

  contract functions

  *************************************************************************************/
  const claimRewards = async () => {
    if (!farmController) return
    const txType = FunctionName.WITHDRAW_REWARDS
    try {
      const tx = await farmController.farmOptionMulti({
        ...gasConfig,
        gasLimit: 834261,
      })
      const txHash = tx.hash
      const localTx: LocalTx = {
        hash: txHash,
        type: txType,
        value: `${truncateBalance(totalUserRewards)} ${Unit.SOLACE}`,
        status: TransactionCondition.PENDING,
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
        setTotalActivePolicies(activePolicies.length.toString())
      }
      fetchPolicies()
    } catch (err) {
      console.log(err)
    }
  }, [allPolicies])

  const GlobalBox: React.FC = () => (
    <Box color2>
      <BoxItem>
        <BoxItemTitle t4 light bold>
          Underwriting Pool Size
        </BoxItemTitle>
        <Text t2 nowrap light bold>
          {`${truncateBalance(capitalPoolSize, 1)} `}
          <TextSpan t4 light bold>
            {activeNetwork.nativeCurrency.symbol}
          </TextSpan>
        </Text>
      </BoxItem>
      <BoxItem>
        <BoxItemTitle t4 light bold>
          Total Value Locked
        </BoxItemTitle>
        <Text t2 nowrap light bold>
          {`${truncateBalance(totalValueLocked, 1)} `}
          <TextSpan t4 light bold>
            {activeNetwork.nativeCurrency.symbol}
          </TextSpan>
        </Text>
      </BoxItem>
      <BoxItem>
        <BoxItemTitle t4 light bold>
          Active Cover Amount
        </BoxItemTitle>
        <Text t2 nowrap light bold>
          {totalActiveCoverAmount !== '-'
            ? `${truncateBalance(totalActiveCoverAmount, 2)} `
            : `${totalActiveCoverAmount} `}
          <TextSpan t4 light bold>
            {activeNetwork.nativeCurrency.symbol}
          </TextSpan>
        </Text>
      </BoxItem>
      <BoxItem>
        <BoxItemTitle t4 light bold>
          Total Active Policies
        </BoxItemTitle>
        <Text t2 nowrap light bold>
          {totalActivePolicies}
        </Text>
      </BoxItem>
    </Box>
  )

  return (
    <>
      {width > BKPT_3 ? (
        <BoxRow>
          {initialized && account ? (
            <Box>
              {/* <BoxItem>
                <BoxItemTitle t4>
                  My Balance
                </BoxItemTitle>
                <Text t2>
                  {`${truncateBalance(solaceBalance, 1)} `}
                  <TextSpan t4>SOLACE</TextSpan>
                </Text>
              </BoxItem> */}
              <BoxItem>
                <BoxItemTitle t4 light bold>
                  My Unclaimed Rewards{' '}
                  <StyledTooltip
                    id={'rewards'}
                    tip={'You’ll be able to claim the rewards soon, once $SOLACE token is publicly released'}
                    // link={'https://docs.solace.fi/docs/user-guides/earn-rewards'}
                  />
                </BoxItemTitle>
                <Text t2 light bold>
                  {`${truncateBalance(totalUserRewards, 1)} `}
                  <TextSpan t4 light bold>
                    SOLACE
                  </TextSpan>
                </Text>
              </BoxItem>
              {/* <BoxItem>
                <Button light disabled={haveErrors || fixed(totalUserRewards, 6) <= 0} onClick={claimRewards}>
                  Claim Options
                </Button>
              </BoxItem> */}
            </Box>
          ) : (
            <Box>
              <BoxItem>
                <WalletConnectButton light />
              </BoxItem>
            </Box>
          )}
          <GlobalBox />
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
                    <Text t2>
                      {`${truncateBalance(solaceBalance, 1)} `}
                      <TextSpan t4>SOLACE</TextSpan>
                    </Text>
                  </FormCol>
                </FormRow> */}
                <FormRow>
                  <FormCol light>My Unclaimed Rewards</FormCol>
                  <FormCol>
                    <Text t2 light>
                      {`${truncateBalance(totalUserRewards, 1)} `}
                      <TextSpan t4 light>
                        SOLACE
                      </TextSpan>
                    </Text>
                  </FormCol>
                </FormRow>
                {/* <ButtonWrapper>
                  <Button
                    light
                    widthP={100}
                    disabled={haveErrors || fixed(totalUserRewards, 6) <= 0}
                    onClick={claimRewards}
                  >
                    Claim Options
                  </Button>
                </ButtonWrapper> */}
              </Card>
              <Card color2>
                <FormRow>
                  <FormCol light>Capital Pool Size</FormCol>
                  <FormCol>
                    <Text t2 nowrap light>
                      {`${truncateBalance(capitalPoolSize, 1)} `}
                      <TextSpan t4 light>
                        {activeNetwork.nativeCurrency.symbol}
                      </TextSpan>
                    </Text>
                  </FormCol>
                </FormRow>
                <FormRow>
                  <FormCol light>Total Value Locked</FormCol>
                  <FormCol>
                    <Text t2 nowrap light>
                      {`${truncateBalance(totalValueLocked, 1)} `}
                      <TextSpan t4 light>
                        {activeNetwork.nativeCurrency.symbol}
                      </TextSpan>
                    </Text>
                  </FormCol>
                </FormRow>
                <FormRow>
                  <FormCol light>Active Cover Amount</FormCol>
                  <FormCol>
                    <Text t2 nowrap light>
                      {totalActiveCoverAmount !== '-'
                        ? `${truncateBalance(totalActiveCoverAmount, 2)} `
                        : `${totalActiveCoverAmount} `}
                      <TextSpan t4 light>
                        {activeNetwork.nativeCurrency.symbol}
                      </TextSpan>
                    </Text>
                  </FormCol>
                </FormRow>
                <FormRow>
                  <FormCol light>Total Active Policies</FormCol>
                  <FormCol>
                    <Text t2 nowrap light>
                      {totalActivePolicies}
                    </Text>
                  </FormCol>
                </FormRow>
              </Card>
            </CardContainer>
          ) : (
            <BoxRow>
              <Box>
                <BoxItem>
                  <WalletConnectButton light />
                </BoxItem>
              </Box>
              <GlobalBox />
            </BoxRow>
          )}
        </>
      )}
    </>
  )
}
