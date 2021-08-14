/*************************************************************************************

    Table of Contents:

    import react
    import packages
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
import { formatEther } from '@ethersproject/units'

/* import constants */
import { Policy } from '../../constants/types'
import { MAX_MOBILE_SCREEN_WIDTH, ZERO } from '../../constants'

/* import components */
import { Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { FormCol, FormRow } from '../atoms/Form'
import { FlexRow, HeroContainer } from '../atoms/Layout'
import { Protocol, ProtocolImage, ProtocolTitle } from '../atoms/Protocol'
import { Loader } from '../atoms/Loader'
import { Heading3, Text, Text3 } from '../atoms/Typography'

/* import hooks */
import { useAppraisePosition } from '../../hooks/usePolicy'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { getDaysLeft } from '../../utils/time'
import { truncateBalance } from '../../utils/formatting'
import { Card } from '../atoms/Card'

interface PolicyModalInfoProps {
  selectedPolicy: Policy | undefined
  latestBlock: number
}

export const PolicyModalInfo: React.FC<PolicyModalInfoProps> = ({ selectedPolicy, latestBlock }) => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const appraisal = useAppraisePosition(selectedPolicy)
  const { width } = useWindowDimensions()

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Fragment>
      {width > MAX_MOBILE_SCREEN_WIDTH ? (
        <Box transparent pl={10} pr={10} pt={20} pb={20}>
          <BoxItem>
            <BoxItemTitle h3>Policy ID</BoxItemTitle>
            <Text h2 nowrap>
              {selectedPolicy?.policyId}
            </Text>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3>Days to expiration</BoxItemTitle>
            <Text h2 nowrap>
              {getDaysLeft(selectedPolicy ? parseFloat(selectedPolicy.expirationBlock) : 0, latestBlock)}
            </Text>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3>Cover Amount</BoxItemTitle>
            <Text h2 nowrap>
              {selectedPolicy?.coverAmount ? truncateBalance(formatEther(selectedPolicy.coverAmount)) : 0} ETH
            </Text>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3>Position Amount</BoxItemTitle>
            <Text h2 nowrap>
              {appraisal.gt(ZERO) ? (
                `${truncateBalance(formatEther(appraisal) || 0)} ETH`
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
              <Text3>Policy ID:</Text3>
            </FormCol>
            <FormCol>
              <Heading3>{selectedPolicy?.policyId}</Heading3>
            </FormCol>
          </FormRow>
          <FormRow mb={10}>
            <FormCol>
              <Text3>Days to expiration:</Text3>
            </FormCol>
            <FormCol>
              <Heading3>
                {getDaysLeft(selectedPolicy ? parseFloat(selectedPolicy.expirationBlock) : 0, latestBlock)}
              </Heading3>
            </FormCol>
          </FormRow>
          <FormRow mb={10}>
            <FormCol>
              <Text3>Cover Amount:</Text3>
            </FormCol>
            <FormCol>
              <Heading3>
                {selectedPolicy?.coverAmount ? truncateBalance(formatEther(selectedPolicy.coverAmount)) : 0} ETH
              </Heading3>
            </FormCol>
          </FormRow>
          <FormRow mb={10}>
            <FormCol>
              <Text3>Position Amount:</Text3>
            </FormCol>
            <FormCol>
              <Heading3>
                {appraisal.gt(ZERO) ? (
                  `${truncateBalance(formatEther(appraisal) || 0)} ETH`
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
              <ProtocolTitle t2>{selectedPolicy?.productName}</ProtocolTitle>
            </Protocol>
          </FormCol>
          <FormCol>
            <Protocol style={{ alignItems: 'center', flexDirection: 'column' }}>
              <ProtocolImage width={70} height={70} mb={10}>
                <img src={`https://assets.solace.fi/${selectedPolicy?.positionName.toLowerCase()}`} />
              </ProtocolImage>
              <ProtocolTitle t2>{selectedPolicy?.positionName}</ProtocolTitle>
            </Protocol>
          </FormCol>
        </FlexRow>
      </HeroContainer>
      <hr style={{ marginBottom: '20px' }} />
    </Fragment>
  )
}
