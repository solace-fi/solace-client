/*************************************************************************************

    Table of Contents:

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

/* import packages */
import React from 'react'
import { formatUnits } from '@ethersproject/units'
import { Block } from '@ethersproject/abstract-provider'

/* import managers */
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'

/* import constants */
import { BKPT_5 } from '../../constants'
import { PolicyState } from '../../constants/enums'

/* import components */
import { Table, TableBody, TableHead, TableRow, TableHeader, TableData, TableDataGroup } from '../atoms/Table'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Text } from '../atoms/Typography'
import { Flex, Content } from '../atoms/Layout'
import { Card, CardContainer } from '../atoms/Card'
import { DeFiAssetImage } from '../atoms/DeFiAsset'
import { StyledDots } from '../atoms/Icon'
import { Loader } from '../atoms/Loader'
import { Accordion } from '../atoms/Accordion'
import { StyledArrowDropDown } from '../atoms/Icon'

/* import hooks */
import { useWindowDimensions } from '../../hooks/internal/useWindowDimensions'

/* import utils */
import { truncateValue } from '../../utils/formatting'
import { calculatePolicyExpirationDate, shouldWarnUser } from '../../utils/policy'

interface MyPoliciesProps {
  openClaimModal: any
  openManageModal: any
  latestBlock: Block | undefined
  isOpen: boolean
  setOpen: any
}

export const MyPolicies: React.FC<MyPoliciesProps> = ({
  openClaimModal,
  openManageModal,
  latestBlock,
  isOpen,
  setOpen,
}) => {
  /*************************************************************************************

    hooks

  *************************************************************************************/
  const { userPolicyData } = useCachedData()
  const { width } = useWindowDimensions()
  const { activeNetwork } = useNetwork()

  return (
    <Content>
      <Text bold t1 mb={0}>
        My Policies
        <Button style={{ float: 'right' }} onClick={() => setOpen(!isOpen)}>
          <StyledArrowDropDown style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} size={20} />
          {isOpen ? 'Hide Policies' : 'Show Policies'}
        </Button>
      </Text>
      <Text t4 pt={10} pb={10}>
        Make changes to your existing policies or submit claims.
      </Text>
      {!userPolicyData.policiesLoading ? (
        <Accordion isOpen={isOpen} style={{ padding: '0 10px 0 10px' }}>
          {userPolicyData.userPolicies.length > 0 ? (
            width > BKPT_5 ? (
              <Table textAlignCenter style={{ borderSpacing: '0px 7px' }}>
                <TableHead sticky>
                  <TableRow>
                    <TableHeader t3>ID</TableHeader>
                    <TableHeader t3>Coverage</TableHeader>
                    <TableHeader t3>Status</TableHeader>
                    <TableHeader t3>Expiration Date</TableHeader>
                    <TableHeader t3>Covered Amount</TableHeader>
                    <TableHeader t3></TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userPolicyData.userPolicies.map((policy) => {
                    const isWarned = shouldWarnUser(latestBlock, policy)
                    return (
                      <TableRow key={policy.policyId}>
                        <TableData>
                          <Text t2 warning={isWarned}>
                            {policy.policyId}
                          </Text>
                        </TableData>
                        <TableData>
                          <Flex>
                            <DeFiAssetImage secured>
                              <img
                                src={`https://assets.solace.fi/${policy.productName.toLowerCase()}`}
                                alt={policy.productName}
                              />
                            </DeFiAssetImage>
                            <Flex col>
                              <Flex>
                                {policy.positionNames.length == 0 && <Loader width={10} height={10} />}
                                {policy.positionNames.slice(0, 8).map((name) => (
                                  <DeFiAssetImage key={name} width={30} height={30} ml={1} noborder>
                                    <img src={`https://assets.solace.fi/${name.toLowerCase()}`} alt={name} />
                                  </DeFiAssetImage>
                                ))}
                                {policy.positionNames.length > 8 && <StyledDots size={20} />}
                              </Flex>
                              <Flex>
                                <Text t4 warning={isWarned}>
                                  {policy.productName}
                                </Text>
                              </Flex>
                            </Flex>
                          </Flex>
                        </TableData>
                        <TableData>
                          <Text t2 error={policy.status === PolicyState.EXPIRED} warning={isWarned}>
                            {policy.status}
                          </Text>
                        </TableData>
                        <TableData>
                          <Text t2 warning={isWarned}>
                            {calculatePolicyExpirationDate(latestBlock, policy.expirationBlock)}
                          </Text>
                        </TableData>
                        <TableData>
                          <Text t2 warning={isWarned}>
                            {truncateValue(formatUnits(policy.coverAmount, activeNetwork.nativeCurrency.decimals), 2)}{' '}
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
                  const isWarned = shouldWarnUser(latestBlock, policy)
                  return (
                    <Card key={policy.policyId}>
                      <Flex col style={{ alignItems: 'center' }}>
                        <Flex stretch between mb={24}>
                          <Flex>
                            <DeFiAssetImage secured>
                              <img
                                src={`https://assets.solace.fi/${policy.productName.toLowerCase()}`}
                                alt={policy.productName}
                              />
                            </DeFiAssetImage>
                            <Flex col>
                              <Flex>
                                {policy.positionNames.length == 0 && <Loader width={10} height={10} />}
                                {policy.positionNames.slice(0, 4).map((name) => (
                                  <DeFiAssetImage key={name} width={25} height={25} secured>
                                    <img src={`https://assets.solace.fi/${name.toLowerCase()}`} alt={name} />
                                  </DeFiAssetImage>
                                ))}
                                {policy.positionNames.length > 4 && <StyledDots size={20} />}
                              </Flex>
                            </Flex>
                          </Flex>
                        </Flex>
                        <Flex col style={{ alignItems: 'center' }}>
                          <Text t2>{policy.productName}</Text>
                        </Flex>
                      </Flex>
                      <Flex stretch between mb={10}>
                        <Text>ID:</Text>
                        <Text t2>{policy.policyId}</Text>
                      </Flex>
                      <Flex stretch between mb={10}>
                        <Text>Status:</Text>
                        <Text t2 error={policy.status === PolicyState.EXPIRED} warning={isWarned}>
                          {policy.status}
                        </Text>
                      </Flex>
                      <Flex stretch between mb={10}>
                        <Text>Expiration Date:</Text>
                        <Text t2 warning={isWarned}>
                          {calculatePolicyExpirationDate(latestBlock, policy.expirationBlock)}
                        </Text>
                      </Flex>
                      <Flex stretch between mb={10}>
                        <Text>Covered Amount:</Text>
                        <Text t2>
                          {policy.coverAmount
                            ? truncateValue(formatUnits(policy.coverAmount, activeNetwork.nativeCurrency.decimals), 2)
                            : 0}{' '}
                          {activeNetwork.nativeCurrency.symbol}
                        </Text>
                      </Flex>
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
        </Accordion>
      ) : (
        <Loader />
      )}
    </Content>
  )
}
