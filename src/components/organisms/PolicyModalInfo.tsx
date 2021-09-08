/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    PolicyModalInfo function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment } from 'react'

/* import packages */
import { formatUnits } from '@ethersproject/units'

/* import managers */
import { useNetwork } from '../../context/NetworkManager'

/* import constants */
import { Policy } from '../../constants/types'
import { MAX_MOBILE_SCREEN_WIDTH, ZERO } from '../../constants'

/* import components */
import { Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { FormCol, FormRow } from '../atoms/Form'
import { FlexRow, HeroContainer } from '../atoms/Layout'
import { Protocol, ProtocolImage, ProtocolTitle } from '../atoms/Protocol'
import { Loader } from '../atoms/Loader'
import { Heading3, Text } from '../atoms/Typography'
import { Card } from '../atoms/Card'
import { StyledTooltip } from '../molecules/Tooltip'

/* import hooks */
import { useAppraisePosition } from '../../hooks/usePolicy'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { getDaysLeft } from '../../utils/time'
import { truncateBalance } from '../../utils/formatting'

interface PolicyModalInfoProps {
  selectedPolicy: Policy | undefined
  latestBlock: number
}

export const PolicyModalInfo: React.FC<PolicyModalInfoProps> = ({ selectedPolicy, latestBlock }) => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const appraisal = useAppraisePosition(selectedPolicy)
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { width } = useWindowDimensions()

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Fragment>
      {width > MAX_MOBILE_SCREEN_WIDTH ? (
        <Box transparent pl={10} pr={10} pt={20} pb={20}>
          <BoxItem>
            <BoxItemTitle h3 high_em>
              Policy ID
            </BoxItemTitle>
            <Text h2 nowrap high_em>
              {selectedPolicy?.policyId}
            </Text>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3 high_em>
              Days to expiration{' '}
              <StyledTooltip id={'days-to-expiration'} tip={'Number of days left until this policy expires'} />
            </BoxItemTitle>
            <Text h2 nowrap high_em>
              {getDaysLeft(selectedPolicy ? selectedPolicy.expirationBlock : 0, latestBlock)}
            </Text>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3 high_em>
              Cover Amount <StyledTooltip id={'covered-amount'} tip={'The amount you are covered on this policy'} />
            </BoxItemTitle>
            <Text h2 nowrap high_em>
              {selectedPolicy?.coverAmount
                ? truncateBalance(formatUnits(selectedPolicy.coverAmount, currencyDecimals))
                : 0}{' '}
              {activeNetwork.nativeCurrency.symbol}
            </Text>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3 high_em>
              Position Amount <StyledTooltip id={'position-amount'} tip={'The amount of this asset you own'} />
            </BoxItemTitle>
            <Text h2 nowrap high_em>
              {appraisal.gt(ZERO) ? (
                `${truncateBalance(formatUnits(appraisal, currencyDecimals) || 0)} ${
                  activeNetwork.nativeCurrency.symbol
                }`
              ) : (
                <Loader width={10} height={10} />
              )}
            </Text>
          </BoxItem>
        </Box>
      ) : (
        // mobile version
        <Card transparent p={0}>
          <FormRow mb={10}>
            <FormCol>
              <Text t4 high_em>
                Policy ID:
              </Text>
            </FormCol>
            <FormCol>
              <Heading3 high_em>{selectedPolicy?.policyId}</Heading3>
            </FormCol>
          </FormRow>
          <FormRow mb={10}>
            <FormCol>
              <Text t4 high_em>
                Days to expiration:
              </Text>
            </FormCol>
            <FormCol>
              <Heading3 high_em>
                {getDaysLeft(selectedPolicy ? selectedPolicy.expirationBlock : 0, latestBlock)}
              </Heading3>
            </FormCol>
          </FormRow>
          <FormRow mb={10}>
            <FormCol>
              <Text t4 high_em>
                Cover Amount:
              </Text>
            </FormCol>
            <FormCol>
              <Heading3 high_em>
                {selectedPolicy?.coverAmount
                  ? truncateBalance(formatUnits(selectedPolicy.coverAmount, currencyDecimals))
                  : 0}{' '}
                {activeNetwork.nativeCurrency.symbol}
              </Heading3>
            </FormCol>
          </FormRow>
          <FormRow mb={10}>
            <FormCol>
              <Text t4 high_em>
                Position Amount:
              </Text>
            </FormCol>
            <FormCol>
              <Heading3 high_em>
                {appraisal.gt(ZERO) ? (
                  `${truncateBalance(formatUnits(appraisal, currencyDecimals) || 0)} ${
                    activeNetwork.nativeCurrency.symbol
                  }`
                ) : (
                  <Loader width={10} height={10} />
                )}{' '}
              </Heading3>
            </FormCol>
          </FormRow>
        </Card>
      )}
      <HeroContainer height={150}>
        <FlexRow>
          <FormCol>
            <Protocol style={{ alignItems: 'center', flexDirection: 'column' }}>
              <ProtocolImage width={70} height={70} mb={10}>
                <img src={`https://assets.solace.fi/${selectedPolicy?.productName.toLowerCase()}`} />
              </ProtocolImage>
              <ProtocolTitle t2 high_em>
                {selectedPolicy?.productName}
              </ProtocolTitle>
            </Protocol>
          </FormCol>
          <FormCol>
            <Protocol style={{ alignItems: 'center', flexDirection: 'column' }}>
              <ProtocolImage width={70} height={70} mb={10}>
                <img src={`https://assets.solace.fi/${selectedPolicy?.positionName.toLowerCase()}`} />
              </ProtocolImage>
              <ProtocolTitle t2 high_em>
                {selectedPolicy?.positionName}
              </ProtocolTitle>
            </Protocol>
          </FormCol>
        </FlexRow>
      </HeroContainer>
      <hr style={{ marginBottom: '20px' }} />
    </Fragment>
  )
}
