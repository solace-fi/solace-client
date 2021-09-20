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
import { formatUnits } from '@ethersproject/units'

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
import { Heading2, Heading3, Text } from '../atoms/Typography'
import { FlexCol, FlexRow } from '../atoms/Layout'
import { Card, CardContainer } from '../atoms/Card'
import { FormRow, FormCol } from '../atoms/Form'
import { DeFiAssetImage } from '../atoms/DeFiAsset'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { truncateBalance } from '../../utils/formatting'
import { getDaysLeft, getExpiration } from '../../utils/time'
import { StyledDots } from '../atoms/Icon'

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
  const { activeNetwork, currencyDecimals } = useNetwork()

  /*************************************************************************************

    Local functions

  *************************************************************************************/
  const calculatePolicyExpirationDate = (expirationBlock: number): string => {
    if (latestBlock == 0) return 'Fetching...'
    const daysLeft = getDaysLeft(expirationBlock, latestBlock)
    return getExpiration(daysLeft)
  }

  const shouldWarnUser = (policy: Policy): boolean => {
    return policy.status === PolicyState.ACTIVE && getDaysLeft(policy.expirationBlock, latestBlock) <= 1
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
          <Table textAlignCenter style={{ borderSpacing: '0px 7px' }}>
            <TableHead sticky>
              <TableRow>
                <TableHeader t3>ID</TableHeader>
                <TableHeader t3>Coverage</TableHeader>
                <TableHeader t3>Status</TableHeader>
                <TableHeader t3>Expiration Date</TableHeader>
                <TableHeader t3>Covered Amount </TableHeader>
                <TableHeader t3></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {userPolicyData.userPolicies.map((policy) => {
                return (
                  <TableRow key={policy.policyId}>
                    <TableData h2 high_em>
                      {policy.policyId}
                    </TableData>
                    <TableData h2 high_em>
                      {
                        <FlexRow>
                          <DeFiAssetImage>
                            <img src={`https://assets.solace.fi/${policy.productName.toLowerCase()}`} />
                          </DeFiAssetImage>
                          <FlexCol>
                            <FlexRow>
                              {policy.positionNames.slice(0, 8).map((name) => (
                                <DeFiAssetImage borderless key={name} width={25} height={25}>
                                  <img src={`https://assets.solace.fi/${name.toLowerCase()}`} />
                                </DeFiAssetImage>
                              ))}
                              {policy.positionNames.length > 8 && <StyledDots size={20} />}
                            </FlexRow>
                            <FlexRow>
                              <Text t4 autoAlign high_em>
                                {policy.productName}
                              </Text>
                            </FlexRow>
                          </FlexCol>
                        </FlexRow>
                      }
                    </TableData>
                    <TableData
                      h2
                      high_em
                      error={policy.status === PolicyState.EXPIRED}
                      warning={shouldWarnUser(policy)}
                    >
                      {policy.status}
                    </TableData>
                    <TableData h2 high_em warning={shouldWarnUser(policy)}>
                      {calculatePolicyExpirationDate(policy.expirationBlock)}
                    </TableData>
                    <TableData h2 high_em>
                      {policy.coverAmount ? truncateBalance(formatUnits(policy.coverAmount, currencyDecimals), 2) : 0}{' '}
                      {activeNetwork.nativeCurrency.symbol}
                    </TableData>

                    <TableData textAlignRight>
                      {policy.status === PolicyState.ACTIVE && (
                        <TableDataGroup>
                          <Button
                            glow={policy.claimAssessment && policy.claimAssessment.lossEventDetected}
                            secondary={policy.claimAssessment && policy.claimAssessment.lossEventDetected}
                            onClick={() => openClaimModal(policy)}
                          >
                            Claim
                          </Button>
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
                        <DeFiAssetImage>
                          <img src={`https://assets.solace.fi/${policy.productName.toLowerCase()}`} />
                        </DeFiAssetImage>
                        <FlexCol>
                          <FlexRow>
                            {policy.positionNames.slice(0, 4).map((name) => (
                              <DeFiAssetImage borderless key={name} width={35} height={35}>
                                <img src={`https://assets.solace.fi/${name.toLowerCase()}`} />
                              </DeFiAssetImage>
                            ))}
                            {policy.positionNames.length > 4 && <StyledDots size={20} />}
                          </FlexRow>
                        </FlexCol>
                      </FlexRow>
                    </FormRow>
                    <FormRow style={{ display: 'flex', alignItems: 'center' }}>
                      <Heading2 high_em>{policy.productName}</Heading2>
                    </FormRow>
                  </FlexCol>
                  <FormRow mb={10}>
                    <FormCol>ID:</FormCol>
                    <FormCol>
                      <Heading3>{policy.policyId}</Heading3>
                    </FormCol>
                  </FormRow>
                  <FormRow mb={10}>
                    <FormCol>Status:</FormCol>
                    <FormCol>
                      <Heading2 high_em error={policy.status === PolicyState.EXPIRED} warning={shouldWarnUser(policy)}>
                        {policy.status}
                      </Heading2>
                    </FormCol>
                  </FormRow>
                  <FormRow mb={10}>
                    <FormCol>Expiration Date:</FormCol>
                    <FormCol>
                      <Heading2 high_em warning={shouldWarnUser(policy)}>
                        {calculatePolicyExpirationDate(policy.expirationBlock)}
                      </Heading2>
                    </FormCol>
                  </FormRow>
                  <FormRow mb={10}>
                    <FormCol>Covered Amount:</FormCol>
                    <FormCol>
                      <Heading2 high_em>
                        {policy.coverAmount ? truncateBalance(formatUnits(policy.coverAmount, currencyDecimals), 2) : 0}{' '}
                        {activeNetwork.nativeCurrency.symbol}
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
