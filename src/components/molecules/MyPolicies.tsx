/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    MyPolicies function
      custom hooks
      Local functions
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment } from 'react'

/* import packages */
import { formatEther } from '@ethersproject/units'

/* import managers */
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'

/* import constants */
import { Policy } from '../../constants/types'
import { MAX_TABLET_SCREEN_WIDTH } from '../../constants'
import { PolicyState } from '../../constants/enums'

/* import components */
import { Table, TableBody, TableHead, TableRow, TableHeader, TableData, TableDataGroup } from '../atoms/Table'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Loader } from '../atoms/Loader'
import { Heading2, Text } from '../atoms/Typography'
import { FlexCol, FlexRow } from '../atoms/Layout'
import { PositionCardLogo } from '../atoms/Position'
import { Card, CardContainer } from '../atoms/Card'
import { FormRow, FormCol } from '../atoms/Form'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { truncateBalance } from '../../utils/formatting'
import { getDays, getExpiration } from '../../utils/time'

interface MyPoliciesProps {
  openClaimModal: any
  openManageModal: any
  latestBlock: number
}

export const MyPolicies: React.FC<MyPoliciesProps> = ({ openClaimModal, openManageModal, latestBlock }) => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const { userPolicyData } = useCachedData()
  const { width } = useWindowDimensions()
  const { activeNetwork } = useNetwork()

  /*************************************************************************************

    Local functions

  *************************************************************************************/
  const calculatePolicyExpirationDate = (expirationBlock: string): string => {
    const daysLeft = getDays(parseFloat(expirationBlock), latestBlock)
    return getExpiration(daysLeft)
  }

  const shouldWarnUser = (policy: Policy): boolean => {
    return policy.status === PolicyState.ACTIVE && getDays(parseFloat(policy.expirationBlock), latestBlock) <= 1
  }

  /*************************************************************************************

    Render

  *************************************************************************************/
  return (
    <Fragment>
      {userPolicyData.policiesLoading ? (
        <Loader />
      ) : userPolicyData.userPolicies.length > 0 ? (
        width > MAX_TABLET_SCREEN_WIDTH ? (
          <Table textAlignCenter>
            <TableHead>
              <TableRow>
                <TableHeader>Coverage Type</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Id</TableHeader>
                <TableHeader>Expiration Date</TableHeader>
                <TableHeader>Covered Amount</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {userPolicyData.userPolicies.map((policy) => {
                return (
                  <TableRow key={policy.policyId}>
                    <TableData>
                      {
                        <FlexRow>
                          <PositionCardLogo>
                            <img src={`https://assets.solace.fi/${policy.productName.toLowerCase()}`} />
                          </PositionCardLogo>
                          <PositionCardLogo>
                            <img src={`https://assets.solace.fi/${policy.positionName.toLowerCase()}`} />
                          </PositionCardLogo>
                          <Text autoAlign>
                            {policy.productName} - {policy.positionName}
                          </Text>
                        </FlexRow>
                      }
                    </TableData>
                    <TableData error={policy.status === PolicyState.EXPIRED} warning={shouldWarnUser(policy)}>
                      {policy.status}
                    </TableData>
                    <TableData>{policy.policyId}</TableData>
                    <TableData warning={shouldWarnUser(policy)}>
                      {calculatePolicyExpirationDate(policy.expirationBlock)}
                    </TableData>
                    <TableData>
                      {policy.coverAmount ? truncateBalance(parseFloat(formatEther(policy.coverAmount)), 2) : 0}{' '}
                      {activeNetwork.nativeCurrency}
                    </TableData>

                    <TableData textAlignRight>
                      {policy.status === PolicyState.ACTIVE && (
                        <TableDataGroup>
                          <Button onClick={() => openClaimModal(policy)}>Claim</Button>
                          <Button onClick={() => openManageModal(policy)}>Manage</Button>
                        </TableDataGroup>
                      )}
                    </TableData>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          // mobile version
          <CardContainer cardsPerRow={3}>
            {userPolicyData.userPolicies.map((policy) => {
              return (
                <Card key={policy.policyId}>
                  <FlexCol style={{ alignItems: 'center' }}>
                    <FormRow>
                      <FlexRow>
                        <PositionCardLogo>
                          <img src={`https://assets.solace.fi/${policy.productName.toLowerCase()}`} />
                        </PositionCardLogo>
                        <PositionCardLogo>
                          <img src={`https://assets.solace.fi/${policy.positionName.toLowerCase()}`} />
                        </PositionCardLogo>
                      </FlexRow>
                    </FormRow>
                    <FormRow style={{ display: 'flex', alignItems: 'center' }}>
                      <Heading2>
                        {policy.productName} - {policy.positionName}
                      </Heading2>
                    </FormRow>
                  </FlexCol>
                  <FormRow mb={10}>
                    <FormCol>Status:</FormCol>
                    <FormCol>
                      <Heading2 error={policy.status === PolicyState.EXPIRED} warning={shouldWarnUser(policy)}>
                        {policy.status}
                      </Heading2>
                    </FormCol>
                  </FormRow>
                  <FormRow mb={10}>
                    <FormCol>Id:</FormCol>
                    <FormCol>
                      <Heading2>{policy.policyId}</Heading2>
                    </FormCol>
                  </FormRow>
                  <FormRow mb={10}>
                    <FormCol>Expiration Date:</FormCol>
                    <FormCol>
                      <Heading2 warning={shouldWarnUser(policy)}>
                        {calculatePolicyExpirationDate(policy.expirationBlock)}
                      </Heading2>
                    </FormCol>
                  </FormRow>
                  <FormRow mb={10}>
                    <FormCol>Covered Amount:</FormCol>
                    <FormCol>
                      <Heading2>
                        {policy.coverAmount ? truncateBalance(parseFloat(formatEther(policy.coverAmount)), 2) : 0}{' '}
                        {activeNetwork.nativeCurrency}
                      </Heading2>
                    </FormCol>
                  </FormRow>
                  {policy.status === PolicyState.ACTIVE && (
                    <ButtonWrapper isColumn>
                      <Button widthP={100} onClick={() => openClaimModal(policy)}>
                        Claim
                      </Button>
                      <Button widthP={100} onClick={() => openManageModal(policy)}>
                        Manage
                      </Button>
                    </ButtonWrapper>
                  )}
                </Card>
              )
            })}
          </CardContainer>
        )
      ) : (
        <Heading2 textAlignCenter>You do not own any policies.</Heading2>
      )}
    </Fragment>
  )
}
