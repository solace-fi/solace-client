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

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { BoxRow, Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { Button } from '../atoms/Button'
import { Text, TextSpan } from '../atoms/Typography'
import { WalletConnectButton } from '../molecules/WalletConnectButton'
import { FormRow, FormCol } from '../atoms/Form'
import { Card, CardContainer } from '../atoms/Card'
import { HyperLink } from '../atoms/Link'

/* import hooks */
import { useSolaceBalance, useUnderWritingPoolBalance, useXSolaceBalance } from '../../hooks/useBalance'
import { usePolicyGetter } from '../../hooks/usePolicyGetter'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { usePairPrice } from '../../hooks/usePair'
import { useStakingApy } from '../../hooks/useXSolace'
import { useReadToken } from '../../hooks/useToken'

/* import utils */
import { truncateBalance } from '../../utils/formatting'

export const Statistics: React.FC = () => {
  /*************************************************************************************

  hooks

  *************************************************************************************/
  const { account, initialized } = useWallet()
  const { activeNetwork, currencyDecimals, chainId } = useNetwork()
  const { keyContracts } = useContracts()
  const { solace, xSolace } = useMemo(() => keyContracts, [keyContracts])
  const { stakingApy } = useStakingApy()
  const solaceBalance = useSolaceBalance()
  const xSolaceBalance = useXSolaceBalance()
  const readSolaceToken = useReadToken(solace)
  const readXSolaceToken = useReadToken(xSolace)
  const { allPolicies } = usePolicyGetter(true)
  const { width } = useWindowDimensions()
  const [totalActiveCoverAmount, setTotalActiveCoverAmount] = useState<string>('-')
  const [totalActivePolicies, setTotalActivePolicies] = useState<string>('-')
  const { pairPrice } = usePairPrice(solace)
  const { underwritingPoolBalance } = useUnderWritingPoolBalance()

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
          {underwritingPoolBalance == '-' ? '$-' : `$${truncateBalance(underwritingPoolBalance, 2)}`}
        </Text>
      </BoxItem>
      <BoxItem>
        <BoxItemTitle t4 light>
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
              {underwritingPoolBalance == '-' ? '$-' : `$${truncateBalance(underwritingPoolBalance, 2)}`}
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
    )
  }

  return (
    <>
      {width > BKPT_3 ? (
        <BoxRow>
          {initialized && account ? (
            <Box>
              <BoxItem>
                <BoxItemTitle t4 light>
                  My SOLACE Balance
                </BoxItemTitle>
                <Text t2 light bold>
                  {`${truncateBalance(solaceBalance, 1)} `}
                  <TextSpan t4 light bold>
                    {readSolaceToken.symbol}
                  </TextSpan>
                </Text>
              </BoxItem>
              <BoxItem>
                <BoxItemTitle t4 light>
                  My Staked Balance
                </BoxItemTitle>
                <Text t2 light bold>
                  {`${truncateBalance(xSolaceBalance, 1)} `}
                  <TextSpan t4 light bold>
                    {readXSolaceToken.symbol}
                  </TextSpan>
                </Text>
              </BoxItem>
              <BoxItem>
                <BoxItemTitle t4 light>
                  Staking APY
                </BoxItemTitle>
                <Text t2 light bold>
                  {stakingApy}
                </Text>
              </BoxItem>
            </Box>
          ) : (
            <Box>
              <BoxItem>
                <WalletConnectButton light welcome />
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
                <FormRow>
                  <FormCol light>My SOLACE Balance</FormCol>
                  <FormCol>
                    <Text t2 light>
                      {`${truncateBalance(solaceBalance, 1)} `}
                      <TextSpan t4 light>
                        {readSolaceToken.symbol}
                      </TextSpan>
                    </Text>
                  </FormCol>
                </FormRow>
                <FormRow>
                  <FormCol light>My Staked Balance</FormCol>
                  <FormCol>
                    <Text t2 light>
                      {`${truncateBalance(xSolaceBalance, 1)} `}
                      <TextSpan t4 light>
                        {readXSolaceToken.symbol}
                      </TextSpan>
                    </Text>
                  </FormCol>
                </FormRow>
                <FormRow>
                  <FormCol light>Staking APY</FormCol>
                  <FormCol>
                    <Text t2 light>
                      {stakingApy}
                    </Text>
                  </FormCol>
                </FormRow>
              </Card>
              <GlobalCard />
            </CardContainer>
          ) : (
            <BoxRow>
              <Box>
                <BoxItem>
                  <WalletConnectButton light welcome />
                </BoxItem>
              </Box>
              <GlobalCard />
            </BoxRow>
          )}
        </>
      )}
    </>
  )
}
