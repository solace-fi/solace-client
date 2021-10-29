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
      contract functions
      local functions

  *************************************************************************************/

/* import packages */
import React, { Fragment } from 'react'
import { formatUnits } from '@ethersproject/units'
import { Block } from '@ethersproject/contracts/node_modules/@ethersproject/abstract-provider'
import { BigNumber } from 'ethers'

/* import managers */
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'
import { useNotifications } from '../../context/NotificationsManager'

/* import constants */
import { LocalTx } from '../../constants/types'
import { BKPT_5 } from '../../constants'
import { FunctionName, PolicyState, TransactionCondition } from '../../constants/enums'

/* import components */
import { Table, TableBody, TableHead, TableRow, TableHeader, TableData, TableDataGroup } from '../atoms/Table'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Text, TextSpan } from '../atoms/Typography'
import { FlexCol, FlexRow } from '../atoms/Layout'
import { Card, CardContainer } from '../atoms/Card'
import { FormRow, FormCol } from '../atoms/Form'
import { DeFiAssetImage } from '../atoms/DeFiAsset'
import { StyledDots } from '../atoms/Icon'
import { Loader } from '../atoms/Loader'
import { SmallBox } from '../atoms/Box'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { useSptFarm } from '../../hooks/useSptFarm'
import { useGasConfig } from '../../hooks/useGas'

/* import utils */
import { truncateBalance } from '../../utils/formatting'
import { calculatePolicyExpirationDate, shouldWarnUser } from '../../utils/policy'

interface MyPoliciesProps {
  openClaimModal: any
  openManageModal: any
  latestBlock: Block | undefined
  depositedPolicyIds: number[]
}

export const MyPolicies: React.FC<MyPoliciesProps> = ({
  openClaimModal,
  openManageModal,
  latestBlock,
  depositedPolicyIds,
}) => {
  /*************************************************************************************

    hooks

  *************************************************************************************/
  const { addLocalTransactions, reload, gasPrices, userPolicyData } = useCachedData()
  const { makeTxToast } = useNotifications()
  const { width } = useWindowDimensions()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { depositPolicy, withdrawPolicy } = useSptFarm()
  const { gasConfig } = useGasConfig(gasPrices.selected?.value)

  /*************************************************************************************

    contract functions

  *************************************************************************************/
  const callDepositPolicy = async (policyId: number) => {
    await depositPolicy(BigNumber.from(policyId), gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callDepositPolicy', err, FunctionName.DEPOSIT_POLICY_SIGNED))
  }

  const callWithdrawPolicy = async (policyId: number) => {
    await withdrawPolicy(BigNumber.from(policyId), gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callWithdrawPolicy', err, FunctionName.WITHDRAW_POLICY))
  }

  /*************************************************************************************

    local functions

  *************************************************************************************/

  const handleToast = async (tx: any, localTx: LocalTx | null) => {
    if (!tx || !localTx) return
    addLocalTransactions(localTx)
    reload()
    makeTxToast(localTx.type, TransactionCondition.PENDING, localTx.hash)
    await tx.wait().then((receipt: any) => {
      const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
      makeTxToast(localTx.type, status, localTx.hash)
      reload()
    })
  }

  const handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    console.log(functionName, err)
    makeTxToast(txType, TransactionCondition.CANCELLED)
    reload()
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
                <TableHeader t3>Covered Amount</TableHeader>
                <TableHeader t3></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {userPolicyData.userPolicies.map((policy) => {
                const isStaked = depositedPolicyIds.includes(policy.policyId)
                return (
                  <TableRow key={policy.policyId}>
                    <TableData>
                      <Text t2 warning={shouldWarnUser(latestBlock, policy)}>
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
                              {policy.positionNames.length == 0 && <Loader width={10} height={10} />}
                              {policy.positionNames.slice(0, 8).map((name) => (
                                <DeFiAssetImage key={name} width={25} height={25} secured>
                                  <img src={`https://assets.solace.fi/${name.toLowerCase()}`} alt={name} />
                                </DeFiAssetImage>
                              ))}
                              {policy.positionNames.length > 8 && <StyledDots size={20} />}
                            </FlexRow>
                            <FlexRow>
                              <Text t4 autoAlign warning={shouldWarnUser(latestBlock, policy)}>
                                {policy.productName}
                              </Text>
                            </FlexRow>
                          </FlexCol>
                        </FlexRow>
                      }
                    </TableData>
                    <TableData>
                      <Text
                        t2
                        error={policy.status === PolicyState.EXPIRED}
                        warning={shouldWarnUser(latestBlock, policy)}
                      >
                        {policy.status}
                      </Text>
                      {isStaked && (
                        <SmallBox style={{ justifyContent: 'center' }}>
                          <TextSpan light>Staked</TextSpan>
                        </SmallBox>
                      )}
                    </TableData>
                    <TableData>
                      <Text t2 warning={shouldWarnUser(latestBlock, policy)}>
                        {calculatePolicyExpirationDate(latestBlock, policy.expirationBlock)}
                      </Text>
                    </TableData>
                    <TableData>
                      <Text t2 warning={shouldWarnUser(latestBlock, policy)}>
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
                          <Button
                            onClick={() =>
                              isStaked ? callWithdrawPolicy(policy.policyId) : callDepositPolicy(policy.policyId)
                            }
                            info
                          >
                            {isStaked ? `Unstake` : `Stake`}
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
              const isStaked = depositedPolicyIds.includes(policy.policyId)
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
                            {policy.positionNames.length == 0 && <Loader width={10} height={10} />}
                            {policy.positionNames.slice(0, 4).map((name) => (
                              <DeFiAssetImage key={name} width={25} height={25} secured>
                                <img src={`https://assets.solace.fi/${name.toLowerCase()}`} alt={name} />
                              </DeFiAssetImage>
                            ))}
                            {policy.positionNames.length > 4 && <StyledDots size={20} />}
                          </FlexRow>
                        </FlexCol>
                      </FlexRow>
                    </FormRow>
                    <FlexCol style={{ display: 'flex', alignItems: 'center' }}>
                      <Text t2>{policy.productName}</Text>
                      <SmallBox style={{ justifyContent: 'center', visibility: isStaked ? 'unset' : 'hidden' }}>
                        <TextSpan light>Staked</TextSpan>
                      </SmallBox>
                    </FlexCol>
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
                      <Text
                        t2
                        error={policy.status === PolicyState.EXPIRED}
                        warning={shouldWarnUser(latestBlock, policy)}
                      >
                        {policy.status}
                      </Text>
                    </FormCol>
                  </FormRow>
                  <FormRow mb={10}>
                    <FormCol>Expiration Date:</FormCol>
                    <FormCol>
                      <Text t2 warning={shouldWarnUser(latestBlock, policy)}>
                        {calculatePolicyExpirationDate(latestBlock, policy.expirationBlock)}
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
                      <Button
                        widthP={100}
                        onClick={() =>
                          isStaked ? callWithdrawPolicy(policy.policyId) : callDepositPolicy(policy.policyId)
                        }
                        info
                      >
                        {isStaked ? `Unstake` : `Stake`}
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
