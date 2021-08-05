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
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'

/* import constants */
import { Policy } from '../../constants/types'
import { DEFAULT_CHAIN_ID, MAX_MOBILE_SCREEN_WIDTH } from '../../constants'
import { PolicyState } from '../../constants/enums'

/* import components */
import { Table, TableBody, TableHead, TableRow, TableHeader, TableData, TableDataGroup } from '../atoms/Table'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Loader } from '../atoms/Loader'
import { Heading2, Text } from '../atoms/Typography'
import { FlexRow } from '../atoms/Layout'
import { PositionCardLogo } from '../atoms/Position'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { getNativeTokenUnit, truncateBalance } from '../../utils/formatting'
import { getDays, getExpiration } from '../../utils/time'
import { Card, CardContainer } from '../atoms/Card'
import { FormRow, FormCol } from '../atoms/Form'

interface MyPoliciesProps {
  openClaimModal: any
  openManageModal: any
  latestBlock: number
}

export const MyPolicies: React.FC<MyPoliciesProps> = ({ openClaimModal, openManageModal, latestBlock }) => {
  /*************************************************************************************

    custom hooks

  *************************************************************************************/
  const { chainId } = useWallet()
  const { userPolicyData } = useCachedData()
  const { width } = useWindowDimensions()

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
        width > MAX_MOBILE_SCREEN_WIDTH ? (
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
                      {getNativeTokenUnit(chainId ?? DEFAULT_CHAIN_ID)}
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
          <CardContainer cardsPerRow={3}>
            {userPolicyData.userPolicies.map((policy) => {
              return (
                <Card key={policy.policyId}>
                  <FormRow>
                    <FormCol>
                      <FlexRow>
                        <PositionCardLogo>
                          <img src={`https://assets.solace.fi/${policy.productName.toLowerCase()}`} />
                        </PositionCardLogo>
                        <PositionCardLogo>
                          <img src={`https://assets.solace.fi/${policy.positionName.toLowerCase()}`} />
                        </PositionCardLogo>
                      </FlexRow>
                    </FormCol>
                    <FormCol style={{ display: 'flex', alignItems: 'center' }}>
                      {policy.productName} - {policy.positionName}
                    </FormCol>
                  </FormRow>
                  <FormRow>
                    <FormCol>Status:</FormCol>
                    <FormCol>
                      <Text error={policy.status === PolicyState.EXPIRED} warning={shouldWarnUser(policy)}>
                        {policy.status}
                      </Text>
                    </FormCol>
                  </FormRow>
                  <FormRow>
                    <FormCol>Id:</FormCol>
                    <FormCol>{policy.policyId}</FormCol>
                  </FormRow>
                  <FormRow>
                    <FormCol>Expiration Date:</FormCol>
                    <FormCol>
                      <Text warning={shouldWarnUser(policy)}>
                        {calculatePolicyExpirationDate(policy.expirationBlock)}
                      </Text>
                    </FormCol>
                  </FormRow>
                  <FormRow>
                    <FormCol>Covered Amount:</FormCol>
                    <FormCol>
                      {policy.coverAmount ? truncateBalance(parseFloat(formatEther(policy.coverAmount)), 2) : 0}{' '}
                      {getNativeTokenUnit(chainId ?? DEFAULT_CHAIN_ID)}
                    </FormCol>
                  </FormRow>
                  {policy.status === PolicyState.ACTIVE && (
                    <ButtonWrapper>
                      <Button onClick={() => openClaimModal(policy)}>Claim</Button>
                      <Button onClick={() => openManageModal(policy)}>Manage</Button>
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
