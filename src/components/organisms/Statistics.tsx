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
import { formatUnits } from '@ethersproject/units'

/* import constants */
import { BKPT_3, ZERO } from '../../constants'
import { PolicyState } from '../../constants/enums'
import { USDC_ADDRESS } from '../../constants/mappings/tokenAddressMapping'
import { GlobalLockInfo, UserLocksInfo } from '../../constants/types'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'

/* import components */
import { BoxRow, Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { Button } from '../atoms/Button'
import { Text, TextSpan } from '../atoms/Typography'
import { WalletConnectButton } from '../molecules/WalletConnectButton'
import { FormRow, FormCol } from '../atoms/Form'
import { Card, CardContainer } from '../atoms/Card'
import { HyperLink } from '../atoms/Link'

/* import hooks */
import { useSolaceBalance, useUnderWritingPoolBalance } from '../../hooks/useBalance'
import { usePolicyGetter } from '../../hooks/usePolicyGetter'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { usePairPrice } from '../../hooks/usePair'
import { useUserLockData } from '../../hooks/useXSLocker'
import { useStakingRewards } from '../../hooks/useStakingRewards'
import { useReadToken } from '../../hooks/useToken'

/* import utils */
import { truncateValue } from '../../utils/formatting'

export const Statistics: React.FC = () => {
  /*************************************************************************************

  hooks

  *************************************************************************************/
  const { account, initialized } = useWallet()
  const { activeNetwork, currencyDecimals, chainId } = useNetwork()
  const { keyContracts } = useContracts()
  const { latestBlock } = useProvider()
  const { solace } = useMemo(() => keyContracts, [keyContracts])
  const solaceBalance = useSolaceBalance()
  const readSolaceToken = useReadToken(solace)
  const { allPolicies } = usePolicyGetter(true)
  const { getUserLocks } = useUserLockData()
  const { width } = useWindowDimensions()
  const { getGlobalLockStats } = useStakingRewards()
  const [totalActiveCoverAmount, setTotalActiveCoverAmount] = useState<string>('-')
  const [totalActivePolicies, setTotalActivePolicies] = useState<string>('-')
  const { pairPrice } = usePairPrice(solace)
  const { underwritingPoolBalance } = useUnderWritingPoolBalance()
  const [userLockInfo, setUserLockInfo] = useState<UserLocksInfo>({
    pendingRewards: ZERO,
    stakedBalance: ZERO,
    lockedBalance: ZERO,
    unlockedBalance: ZERO,
    yearlyReturns: ZERO,
    apy: ZERO,
  })
  const [globalLockStats, setGlobalLockStats] = React.useState<GlobalLockInfo>({
    solaceStaked: ZERO,
    valueStaked: ZERO,
    numLocks: ZERO,
    rewardPerSecond: ZERO,
    apy: ZERO,
  })

  /*************************************************************************************

  contract functions

  *************************************************************************************/

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

  useEffect(() => {
    const _getUserLocks = async () => {
      if (!account) return
      const userLockData = await getUserLocks(account)
      setUserLockInfo(userLockData.user)
    }
    _getUserLocks()
  }, [account, latestBlock])

  useEffect(() => {
    if (!latestBlock) return
    const _getGlobalLockStats = async () => {
      const globalLockStats: GlobalLockInfo = await getGlobalLockStats(latestBlock.number)
      setGlobalLockStats(globalLockStats)
    }
    _getGlobalLockStats()
  }, [latestBlock])

  const GlobalBox: React.FC = () => (
    <Box color2>
      <BoxItem>
        <BoxItemTitle t4 light>
          SOLACE{' '}
          <HyperLink
            href={`https://app.sushi.com/add/${USDC_ADDRESS[chainId]}/${solace ? solace.address : null}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ width: '100%' }}
          >
            <Button light style={{ whiteSpace: 'nowrap', minWidth: 'unset', minHeight: 'unset' }} p={4}>
              buy on sushi
            </Button>
          </HyperLink>
        </BoxItemTitle>{' '}
        <Text t2 nowrap light bold>
          {`$${pairPrice} `}
        </Text>
      </BoxItem>
      <BoxItem>
        <BoxItemTitle t4 light>
          Underwriting Pool Size
        </BoxItemTitle>
        <Text t2 nowrap light bold>
          {underwritingPoolBalance == '-' ? '$-' : `$${truncateValue(underwritingPoolBalance, 2)}`}
        </Text>
      </BoxItem>
      <BoxItem>
        <BoxItemTitle t4 light>
          Active Cover Amount
        </BoxItemTitle>
        <Text t2 nowrap light bold>
          {totalActiveCoverAmount !== '-'
            ? `${truncateValue(totalActiveCoverAmount, 2)} `
            : `${totalActiveCoverAmount} `}
          <TextSpan t4 light bold>
            {activeNetwork.nativeCurrency.symbol}
          </TextSpan>
        </Text>
      </BoxItem>
      <BoxItem>
        <BoxItemTitle t4 light>
          Total Active Policies
        </BoxItemTitle>
        <Text t2 nowrap light bold>
          {totalActivePolicies}
        </Text>
      </BoxItem>
    </Box>
  )

  const GlobalCard: React.FC = () => {
    return (
      <Card color2>
        <FormRow>
          <FormCol light>
            SOLACE{' '}
            <HyperLink
              href={`https://app.sushi.com/add/${USDC_ADDRESS[chainId]}/${solace ? solace.address : null}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ width: '100%' }}
            >
              <Button light style={{ whiteSpace: 'nowrap', minWidth: 'unset', minHeight: 'unset' }} p={4}>
                buy on sushi
              </Button>
            </HyperLink>
          </FormCol>
          <FormCol>
            <Text t2 nowrap light>
              {`$${pairPrice}`}
            </Text>
          </FormCol>
        </FormRow>
        <FormRow>
          <FormCol light>Underwriting Pool Size</FormCol>
          <FormCol>
            <Text t2 nowrap light>
              {underwritingPoolBalance == '-' ? '$-' : `$${truncateValue(underwritingPoolBalance, 2)}`}
            </Text>
          </FormCol>
        </FormRow>
        <FormRow>
          <FormCol light>Active Cover Amount</FormCol>
          <FormCol>
            <Text t2 nowrap light>
              {totalActiveCoverAmount !== '-'
                ? `${truncateValue(totalActiveCoverAmount, 2)} `
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
    )
  }

  return (
    <>
      {width > BKPT_3 ? (
        <BoxRow>
          <Box>
            {initialized && account ? (
              <>
                <BoxItem>
                  <BoxItemTitle t4 light>
                    My SOLACE Balance
                  </BoxItemTitle>
                  <Text t2 light bold>
                    {`${truncateValue(solaceBalance, 1)} `}
                    <TextSpan t4 light bold>
                      {readSolaceToken.symbol}
                    </TextSpan>
                  </Text>
                </BoxItem>
                <BoxItem>
                  <BoxItemTitle t4 light>
                    My Stake
                  </BoxItemTitle>
                  <Text t2 light bold>
                    {`${truncateValue(formatUnits(userLockInfo.stakedBalance, 18), 1)} `}
                    <TextSpan t4 light bold>
                      {readSolaceToken.symbol}
                    </TextSpan>
                  </Text>
                </BoxItem>
              </>
            ) : (
              <BoxItem>
                <WalletConnectButton light welcome />
              </BoxItem>
            )}
            <BoxItem>
              <BoxItemTitle t4 light>
                Global Stake
              </BoxItemTitle>
              <Text t2 light bold>
                {`${truncateValue(formatUnits(globalLockStats.solaceStaked, 18), 1)} `}
                <TextSpan t4 light bold>
                  {readSolaceToken.symbol}
                </TextSpan>
              </Text>
            </BoxItem>
            <BoxItem>
              <BoxItemTitle t4 light>
                Global APY
              </BoxItemTitle>
              <Text t2 light bold>
                {`${truncateValue(globalLockStats.apy.toNumber(), 1)}`}%
              </Text>
            </BoxItem>
          </Box>
          <GlobalBox />
        </BoxRow>
      ) : (
        // mobile version
        <>
          <CardContainer m={20}>
            <Card color1>
              {initialized && account ? (
                <>
                  <FormRow>
                    <FormCol light>My SOLACE Balance</FormCol>
                    <FormCol>
                      <Text t2 light>
                        {`${truncateValue(solaceBalance, 1)} `}
                        <TextSpan t4 light>
                          {readSolaceToken.symbol}
                        </TextSpan>
                      </Text>
                    </FormCol>
                  </FormRow>
                  <FormRow>
                    <FormCol light>My Stake</FormCol>
                    <FormCol>
                      <Text t2 light>
                        {`${truncateValue(formatUnits(userLockInfo.stakedBalance, 18), 1)} `}
                        <TextSpan t4 light>
                          {readSolaceToken.symbol}
                        </TextSpan>
                      </Text>
                    </FormCol>
                  </FormRow>
                </>
              ) : (
                <BoxRow>
                  <WalletConnectButton light welcome />
                </BoxRow>
              )}
              <FormRow>
                <FormCol light>Global Stake</FormCol>
                <FormCol>
                  <Text t2 light>
                    {`${truncateValue(formatUnits(globalLockStats.solaceStaked, 18), 1)} `}
                    <TextSpan t4 light>
                      {readSolaceToken.symbol}
                    </TextSpan>
                  </Text>
                </FormCol>
              </FormRow>
              <FormRow>
                <FormCol light>Global APY</FormCol>
                <FormCol>
                  <Text t2 light>
                    {`${truncateValue(globalLockStats.apy.toNumber(), 1)}`}%
                  </Text>
                </FormCol>
              </FormRow>
            </Card>
            <GlobalCard />
          </CardContainer>
        </>
      )}
    </>
  )
}
