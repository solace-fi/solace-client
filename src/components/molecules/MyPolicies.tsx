/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    MyPolicies
      hooks
      local functions

  *************************************************************************************/

/* import react */
import React, { Fragment } from 'react'

/* import packages */
import { formatUnits } from '@ethersproject/units'
import { Block } from '@ethersproject/contracts/node_modules/@ethersproject/abstract-provider'

/* import managers */
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'

/* import constants */
import { Policy } from '../../constants/types'
import { BKPT_5 } from '../../constants'
import { PolicyState } from '../../constants/enums'

/* import components */
import { Table, TableBody, TableHead, TableRow, TableHeader, TableData, TableDataGroup } from '../atoms/Table'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Text } from '../atoms/Typography'
import { FlexCol, FlexRow } from '../atoms/Layout'
import { Card, CardContainer } from '../atoms/Card'
import { FormRow, FormCol } from '../atoms/Form'
import { DeFiAssetImage } from '../atoms/DeFiAsset'
import { StyledDots } from '../atoms/Icon'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { truncateBalance } from '../../utils/formatting'
import { getDaysLeft, getExpiration } from '../../utils/time'

interface MyPoliciesProps {
  openClaimModal: any
  openManageModal: any
  latestBlock: Block | undefined
}

export const MyPolicies: React.FC<MyPoliciesProps> = ({ openClaimModal, openManageModal, latestBlock }) => {
  /*************************************************************************************

    hooks

  *************************************************************************************/
  const { userPolicyData } = useCachedData()
  const { width } = useWindowDimensions()
  const { activeNetwork, currencyDecimals } = useNetwork()

  /*************************************************************************************

    local functions

  *************************************************************************************/
  const calculatePolicyExpirationDate = (expirationBlock: number): string => {
    if (!latestBlock) return 'Fetching...'
    const daysLeft = getDaysLeft(expirationBlock, latestBlock.number)
    return getExpiration(daysLeft)
  }

  const shouldWarnUser = (policy: Policy): boolean => {
    return (
      policy.status === PolicyState.ACTIVE &&
      getDaysLeft(policy.expirationBlock, latestBlock ? latestBlock.number : 0) <= 1
    )
  }

  return (
    <Fragment>
      {userPolicyData.userPolicies.length > 0 ? (
        width > BKPT_5 ? (
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
                    <TableData>
                      <Text t2 warning={shouldWarnUser(policy)}>
                        {policy.policyId}
                      </Text>
                    </TableData>
                    <TableData>
                      {
                        <FlexRow>
                          <DeFiAssetImage secured>
                            <img
                              src={`https://assets.solace.fi/${policy.productName.toLowerCase()}`}
                              alt={policy.productName}
                            />
                          </DeFiAssetImage>
                          <FlexCol>
                            <FlexRow>
                              {policy.positionNames.slice(0, 8).map((name) => (
                                <DeFiAssetImage key={name} width={25} height={25} secured>
                                  <img src={`https://assets.solace.fi/${name.toLowerCase()}`} alt={name} />
                                </DeFiAssetImage>
                              ))}
                              {policy.positionNames.length > 8 && <StyledDots size={20} />}
                            </FlexRow>
                            <FlexRow>
                              <Text t4 autoAlign warning={shouldWarnUser(policy)}>
                                {policy.productName}
                              </Text>
                            </FlexRow>
                          </FlexCol>
                        </FlexRow>
                      }
                    </TableData>
                    <TableData>
                      <Text t2 error={policy.status === PolicyState.EXPIRED} warning={shouldWarnUser(policy)}>
                        {policy.status}
                      </Text>
                    </TableData>
                    <TableData>
                      <Text t2 warning={shouldWarnUser(policy)}>
                        {calculatePolicyExpirationDate(policy.expirationBlock)}
                      </Text>
                    </TableData>
                    <TableData>
                      <Text t2 warning={shouldWarnUser(policy)}>
                        {policy.coverAmount ? truncateBalance(formatUnits(policy.coverAmount, currencyDecimals), 2) : 0}{' '}
                        {activeNetwork.nativeCurrency.symbol}
                      </Text>
                    </TableData>

                    <TableData textAlignRight>
                      {policy.status === PolicyState.ACTIVE && (
                        <TableDataGroup>
                          <Button
                            secondary={policy.claimAssessment && policy.claimAssessment.lossEventDetected}
                            onClick={() => openClaimModal(policy)}
                            info
                          >
                            Claim
                          </Button>
                          <Button onClick={() => openManageModal(policy)} info>
                            Manage
                          </Button>
                        </TableDataGroup>
                      )}
                    </TableData>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          // laptop version
          <CardContainer cardsPerRow={3} p={10}>
            {userPolicyData.userPolicies.map((policy) => {
              return (
                <Card key={policy.policyId}>
                  <FlexCol style={{ alignItems: 'center' }}>
                    <FormRow>
                      <FlexRow>
                        <DeFiAssetImage secured>
                          <img
                            src={`https://assets.solace.fi/${policy.productName.toLowerCase()}`}
                            alt={policy.productName}
                          />
                        </DeFiAssetImage>
                        <FlexCol>
                          <FlexRow>
                            {policy.positionNames.slice(0, 4).map((name) => (
                              <DeFiAssetImage key={name} width={35} height={35} secured>
                                <img src={`https://assets.solace.fi/${name.toLowerCase()}`} alt={name} />
                              </DeFiAssetImage>
                            ))}
                            {policy.positionNames.length > 4 && <StyledDots size={20} />}
                          </FlexRow>
                        </FlexCol>
                      </FlexRow>
                    </FormRow>
                    <FormRow style={{ display: 'flex', alignItems: 'center' }}>
                      <Text t2>{policy.productName}</Text>
                    </FormRow>
                  </FlexCol>
                  <FormRow mb={10}>
                    <FormCol>ID:</FormCol>
                    <FormCol>
                      <Text t2>{policy.policyId}</Text>
                    </FormCol>
                  </FormRow>
                  <FormRow mb={10}>
                    <FormCol>Status:</FormCol>
                    <FormCol>
                      <Text t2 error={policy.status === PolicyState.EXPIRED} warning={shouldWarnUser(policy)}>
                        {policy.status}
                      </Text>
                    </FormCol>
                  </FormRow>
                  <FormRow mb={10}>
                    <FormCol>Expiration Date:</FormCol>
                    <FormCol>
                      <Text t2 warning={shouldWarnUser(policy)}>
                        {calculatePolicyExpirationDate(policy.expirationBlock)}
                      </Text>
                    </FormCol>
                  </FormRow>
                  <FormRow mb={10}>
                    <FormCol>Covered Amount:</FormCol>
                    <FormCol>
                      <Text t2>
                        {policy.coverAmount ? truncateBalance(formatUnits(policy.coverAmount, currencyDecimals), 2) : 0}{' '}
                        {activeNetwork.nativeCurrency.symbol}
                      </Text>
                    </FormCol>
                  </FormRow>
                  {policy.status === PolicyState.ACTIVE && (
                    <ButtonWrapper isColumn>
                      <Button
                        widthP={100}
                        onClick={() => openClaimModal(policy)}
                        secondary={policy.claimAssessment && policy.claimAssessment.lossEventDetected}
                        info
                      >
                        Claim
                      </Button>
                      <Button widthP={100} onClick={() => openManageModal(policy)} info>
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
        <Text t2 textAlignCenter>
          You do not own any policies.
        </Text>
      )}
    </Fragment>
  )
}
