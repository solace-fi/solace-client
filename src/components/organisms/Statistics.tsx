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
import React, { useEffect, useMemo, useState } from 'react'
import { formatUnits } from '@ethersproject/units'

/* import constants */
import { BKPT_3, BKPT_4, ZERO } from '../../constants'
import { SOLACE_TOKEN } from '../../constants/mappings/token'
import { GlobalLockInfo, UserLocksInfo } from '@solace-fi/sdk-nightly'

/* import managers */
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralManager'
import { useProvider } from '../../context/ProviderManager'
import { useCachedData } from '../../context/CachedDataManager'

/* import components */
import { BoxRow, Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { Button } from '../atoms/Button'
import { Text, TextSpan } from '../atoms/Typography'
import { WalletConnectButton } from '../molecules/WalletConnectButton'
import { Flex } from '../atoms/Layout'
import { Card, CardContainer } from '../atoms/Card'
import { HyperLink } from '../atoms/Link'

/* import hooks */
import { useSolaceBalance, useCrossChainUnderwritingPoolBalance } from '../../hooks/balance/useBalance'
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'
import { useUserLockData } from '../../hooks/stake/useXSLocker'
import { useStakingRewards } from '../../hooks/stake/useStakingRewards'

/* import utils */
import { truncateValue } from '../../utils/formatting'
import { useTotalActivePolicies } from '../../hooks/_legacy/usePolicy'
import { useWeb3React } from '@web3-react/core'

export const Statistics: React.FC = () => {
  /*************************************************************************************

  hooks

  *************************************************************************************/
  const { rightSidebar } = useGeneral()
  const { active, account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { latestBlock } = useProvider()
  const solaceBalance = useSolaceBalance()
  const { tokenPriceMapping } = useCachedData()
  const { getUserLocks } = useUserLockData()
  const { width } = useWindowDimensions()
  const { getGlobalLockStats } = useStakingRewards()
  const { totalActivePolicies, totalActiveCoverLimit } = useTotalActivePolicies()
  const [pairPrice, setPairPrice] = useState<string>('-')
  const { underwritingPoolBalance } = useCrossChainUnderwritingPoolBalance()
  const [userLockInfo, setUserLockInfo] = useState<UserLocksInfo>({
    pendingRewards: ZERO,
    stakedBalance: ZERO,
    lockedBalance: ZERO,
    unlockedBalance: ZERO,
    yearlyReturns: ZERO,
    apr: ZERO,
  })
  const [globalLockStats, setGlobalLockStats] = React.useState<GlobalLockInfo>({
    solaceStaked: '0',
    valueStaked: '0',
    numLocks: '0',
    rewardPerSecond: '0',
    apr: '0',
    successfulFetch: false,
  })

  const widthThreshold = useMemo(() => width > (rightSidebar ? BKPT_4 : BKPT_3), [width, rightSidebar])

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    const getPrice = async () => {
      if (Object.keys(tokenPriceMapping).length === 0 && tokenPriceMapping.constructor === Object) return
      setPairPrice(truncateValue(tokenPriceMapping['solace'], 3))
    }
    getPrice()
  }, [tokenPriceMapping])

  useEffect(() => {
    const _getUserLocks = async () => {
      if (!account) return
      const userLockData = await getUserLocks(account)
      setUserLockInfo(userLockData.user)
    }
    _getUserLocks()
  }, [account, latestBlock.blockNumber])

  useEffect(() => {
    if (!latestBlock.blockNumber) return
    const _getGlobalLockStats = async () => {
      const globalLockStats: GlobalLockInfo = await getGlobalLockStats()
      setGlobalLockStats(globalLockStats)
    }
    _getGlobalLockStats()
  }, [latestBlock.blockNumber])

  const GlobalBox: React.FC = () => (
    <Box color2>
      <BoxItem>
        <BoxItemTitle t4 light>
          SOLACE{' '}
          {activeNetwork.config.specialFeatures.solaceBuyLink && (
            <HyperLink
              href={activeNetwork.config.specialFeatures.solaceBuyLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ width: '100%' }}
            >
              <Button light style={{ whiteSpace: 'nowrap', minWidth: 'unset', minHeight: 'unset' }} p={4}>
                Buy
              </Button>
            </HyperLink>
          )}
        </BoxItemTitle>{' '}
        <Text t2 nowrap light bold>
          {`$${pairPrice} `}
        </Text>
      </BoxItem>
      {activeNetwork.config.generalFeatures.bondingV2 && (
        <BoxItem>
          <BoxItemTitle t4 light>
            Underwriting Pool Size
          </BoxItemTitle>
          <Text t2 nowrap light bold>
            {underwritingPoolBalance == '-' ? '$-' : `$${truncateValue(underwritingPoolBalance, 2)}`}
          </Text>
        </BoxItem>
      )}
    </Box>
  )

  const GlobalCard: React.FC = () => {
    return (
      <Card color2>
        <Flex stretch between mb={24}>
          <Text light>
            SOLACE{' '}
            {activeNetwork.config.specialFeatures.solaceBuyLink && (
              <HyperLink
                href={activeNetwork.config.specialFeatures.solaceBuyLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: '100%' }}
              >
                <Button light style={{ whiteSpace: 'nowrap', minWidth: 'unset', minHeight: 'unset' }} p={4}>
                  Buy
                </Button>
              </HyperLink>
            )}
          </Text>
          <Text t2 nowrap light>
            {`$${pairPrice}`}
          </Text>
        </Flex>
        {activeNetwork.config.generalFeatures.bondingV2 && (
          <Flex stretch between mb={24}>
            <Text light>Underwriting Pool Size</Text>
            <Text t2 nowrap light>
              {underwritingPoolBalance == '-' ? '$-' : `$${truncateValue(underwritingPoolBalance, 2)}`}
            </Text>
          </Flex>
        )}
      </Card>
    )
  }

  return (
    <>
      {widthThreshold ? (
        <BoxRow>
          <Box>
            {active && account ? (
              <>
                <BoxItem>
                  <BoxItemTitle t4 light>
                    My SOLACE Balance
                  </BoxItemTitle>
                  <Text t2 light bold>
                    {`${truncateValue(solaceBalance, 1)} `}
                    <TextSpan t4 light bold>
                      {SOLACE_TOKEN.constants.symbol}
                    </TextSpan>
                  </Text>
                </BoxItem>
                {activeNetwork.config.generalFeatures.stakingV2 && (
                  <BoxItem>
                    <BoxItemTitle t4 light>
                      My Stake
                    </BoxItemTitle>
                    <Text t2 light bold>
                      {`${truncateValue(formatUnits(userLockInfo.stakedBalance, 18), 1)} `}
                      <TextSpan t4 light bold>
                        {SOLACE_TOKEN.constants.symbol}
                      </TextSpan>
                    </Text>
                  </BoxItem>
                )}
              </>
            ) : (
              <BoxItem>
                <WalletConnectButton light welcome />
              </BoxItem>
            )}
            {activeNetwork.config.generalFeatures.stakingV2 && (
              <>
                <BoxItem>
                  <BoxItemTitle t4 light>
                    Global Stake
                  </BoxItemTitle>
                  <Text t2 light bold>
                    {`${truncateValue(globalLockStats.solaceStaked, 1)} `}
                    <TextSpan t4 light bold>
                      {SOLACE_TOKEN.constants.symbol}
                    </TextSpan>
                  </Text>
                </BoxItem>
                <BoxItem>
                  <BoxItemTitle t4 light>
                    Global APR
                  </BoxItemTitle>
                  <Text t2 light bold>
                    {`${truncateValue(globalLockStats.apr, 1)}`}%
                  </Text>
                </BoxItem>
              </>
            )}
          </Box>
          <GlobalBox />
        </BoxRow>
      ) : (
        // mobile version
        <>
          <CardContainer m={20}>
            <Card color1>
              {active && account ? (
                <>
                  <Flex stretch between mb={24}>
                    <Text light>My SOLACE Balance</Text>
                    <Text t2 light>
                      {`${truncateValue(solaceBalance, 1)} `}
                      <TextSpan t4 light>
                        {SOLACE_TOKEN.constants.symbol}
                      </TextSpan>
                    </Text>
                  </Flex>
                  {activeNetwork.config.generalFeatures.stakingV2 && (
                    <Flex stretch between mb={24}>
                      <Text light>My Stake</Text>
                      <Text t2 light>
                        {`${truncateValue(formatUnits(userLockInfo.stakedBalance, 18), 1)} `}
                        <TextSpan t4 light>
                          {SOLACE_TOKEN.constants.symbol}
                        </TextSpan>
                      </Text>
                    </Flex>
                  )}
                </>
              ) : (
                <BoxRow>
                  <WalletConnectButton light welcome />
                </BoxRow>
              )}
              {activeNetwork.config.generalFeatures.stakingV2 && (
                <>
                  <Flex stretch between mb={24}>
                    <Text light>Global Stake</Text>
                    <Text t2 light>
                      {`${truncateValue(globalLockStats.solaceStaked, 1)} `}
                      <TextSpan t4 light>
                        {SOLACE_TOKEN.constants.symbol}
                      </TextSpan>
                    </Text>
                  </Flex>
                  <Flex stretch between mb={24}>
                    <Text light>Global APR</Text>
                    <Text t2 light>
                      {`${truncateValue(globalLockStats.apr, 1)}`}%
                    </Text>
                  </Flex>
                </>
              )}
            </Card>
            <GlobalCard />
          </CardContainer>
        </>
      )}
    </>
  )
}
