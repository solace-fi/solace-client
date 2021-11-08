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
import React, { useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'
import { Block } from '@ethersproject/contracts/node_modules/@ethersproject/abstract-provider'
import { BigNumber } from 'ethers'

/* import managers */
import { useCachedData } from '../../context/CachedDataManager'
import { useNetwork } from '../../context/NetworkManager'
import { useNotifications } from '../../context/NotificationsManager'

/* import constants */
import { LocalTx } from '../../constants/types'
import { BKPT_3, BKPT_5 } from '../../constants'
import { FunctionName, PolicyState, TransactionCondition } from '../../constants/enums'

/* import components */
import { Table, TableBody, TableHead, TableRow, TableHeader, TableData, TableDataGroup } from '../atoms/Table'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Text, TextSpan } from '../atoms/Typography'
import { FlexCol, FlexRow, Content } from '../atoms/Layout'
import { Card, CardContainer } from '../atoms/Card'
import { FormRow, FormCol } from '../atoms/Form'
import { DeFiAssetImage } from '../atoms/DeFiAsset'
import { StyledDots } from '../atoms/Icon'
import { Loader } from '../atoms/Loader'
import { SmallBox } from '../atoms/Box'
import { Accordion } from '../atoms/Accordion'
import { StyledArrowDropDown } from '../atoms/Icon'

/* import hooks */
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { useSptFarm } from '../../hooks/useSptFarm'
import { useGetFunctionGas } from '../../hooks/useGas'

/* import utils */
import { truncateBalance } from '../../utils/formatting'
import { calculatePolicyExpirationDate, shouldWarnUser } from '../../utils/policy'

interface MyPoliciesProps {
  openClaimModal: any
  openManageModal: any
  latestBlock: Block | undefined
  depositedPolicyIds: number[]
  isOpen: boolean
  setOpen: any
}

export const MyPolicies: React.FC<MyPoliciesProps> = ({
  openClaimModal,
  openManageModal,
  latestBlock,
  depositedPolicyIds,
  isOpen,
  setOpen,
}) => {
  /*************************************************************************************

    hooks

  *************************************************************************************/
  const { addLocalTransactions, reload, userPolicyData } = useCachedData()
  const { makeTxToast } = useNotifications()
  const { width } = useWindowDimensions()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { depositPolicy, withdrawPolicy, depositPolicyMulti, withdrawPolicyMulti } = useSptFarm()
  const { getAutoGasConfig } = useGetFunctionGas()
  const gasConfig = useMemo(() => getAutoGasConfig(), [getAutoGasConfig])
  const policyIdsToStake = useMemo(
    () =>
      userPolicyData.userPolicies
        .filter((p) => !depositedPolicyIds.includes(p.policyId) && p.status == PolicyState.ACTIVE)
        .map((p) => p.policyId),
    [depositedPolicyIds, userPolicyData.userPolicies]
  )
  const policyIdsToUnstake = useMemo(
    () =>
      userPolicyData.userPolicies
        .filter((p) => depositedPolicyIds.includes(p.policyId) && p.status == PolicyState.ACTIVE)
        .map((p) => p.policyId),
    [depositedPolicyIds, userPolicyData.userPolicies]
  )
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

  const callDepositPolicyMulti = async () => {
    await depositPolicyMulti(
      policyIdsToStake.map((id) => BigNumber.from(id)),
      gasConfig
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callDepositPolicyMulti', err, FunctionName.DEPOSIT_POLICY_SIGNED_MULTI))
  }

  const callWithdrawPolicyMulti = async () => {
    await withdrawPolicyMulti(
      policyIdsToUnstake.map((id) => BigNumber.from(id)),
      gasConfig
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callWithdrawPolicyMulti', err, FunctionName.WITHDRAW_POLICY_MULTI))
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
    <Content>
      <Text bold t1 mb={0}>
        My Policies
        <Button style={{ float: 'right' }} onClick={() => setOpen(!isOpen)}>
          <StyledArrowDropDown style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} size={20} />
          {isOpen ? 'Hide Policies' : 'Show Policies'}
        </Button>
      </Text>
      <Text t4 pt={10} pb={10}>
        Make changes to your existing policies or submit claims. You can stake your policies to earn $SOLACE token call
        options.
      </Text>
      {!(width > BKPT_5) && userPolicyData.userPolicies.length > 0 && isOpen && (
        <ButtonWrapper isColumn={!(width > BKPT_3)}>
          <Button
            widthP={100}
            disabled={policyIdsToStake.length < 2}
            onClick={callDepositPolicyMulti}
            secondary={!(policyIdsToStake.length < 2)}
          >
            Stake all
          </Button>
          <Button
            widthP={100}
            disabled={policyIdsToUnstake.length < 2}
            onClick={callWithdrawPolicyMulti}
            secondary={!(policyIdsToUnstake.length < 2)}
          >
            Unstake all
          </Button>
        </ButtonWrapper>
      )}
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
                    <TableHeader t3>
                      <TableDataGroup>
                        <Button
                          disabled={policyIdsToStake.length < 2}
                          onClick={callDepositPolicyMulti}
                          secondary={!(policyIdsToStake.length < 2)}
                        >
                          Stake all
                        </Button>
                        <Button
                          disabled={policyIdsToUnstake.length < 2}
                          onClick={callWithdrawPolicyMulti}
                          secondary={!(policyIdsToUnstake.length < 2)}
                        >
                          Unstake all
                        </Button>
                      </TableDataGroup>
                    </TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userPolicyData.userPolicies.map((policy) => {
                    const isStaked = depositedPolicyIds.includes(policy.policyId)
                    const isWarned = shouldWarnUser(latestBlock, policy)
                    return (
                      <TableRow key={policy.policyId}>
                        <TableData>
                          <Text t2 warning={isWarned}>
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
                                  <Text t4 autoAlign warning={isWarned}>
                                    {policy.productName}
                                  </Text>
                                </FlexRow>
                              </FlexCol>
                            </FlexRow>
                          }
                        </TableData>
                        <TableData>
                          <Text t2 error={policy.status === PolicyState.EXPIRED} warning={isWarned}>
                            {policy.status}
                          </Text>
                          {isStaked && (
                            <SmallBox style={{ justifyContent: 'center' }}>
                              <TextSpan light>Staked</TextSpan>
                            </SmallBox>
                          )}
                        </TableData>
                        <TableData>
                          <Text t2 warning={isWarned}>
                            {calculatePolicyExpirationDate(latestBlock, policy.expirationBlock)}
                          </Text>
                        </TableData>
                        <TableData>
                          <Text t2 warning={isWarned}>
                            {truncateBalance(formatUnits(policy.coverAmount, currencyDecimals), 2)}{' '}
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
                  const isWarned = shouldWarnUser(latestBlock, policy)
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
                          <Text t2 error={policy.status === PolicyState.EXPIRED} warning={isWarned}>
                            {policy.status}
                          </Text>
                        </FormCol>
                      </FormRow>
                      <FormRow mb={10}>
                        <FormCol>Expiration Date:</FormCol>
                        <FormCol>
                          <Text t2 warning={isWarned}>
                            {calculatePolicyExpirationDate(latestBlock, policy.expirationBlock)}
                          </Text>
                        </FormCol>
                      </FormRow>
                      <FormRow mb={10}>
                        <FormCol>Covered Amount:</FormCol>
                        <FormCol>
                          <Text t2>
                            {policy.coverAmount
                              ? truncateBalance(formatUnits(policy.coverAmount, currencyDecimals), 2)
                              : 0}{' '}
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
        </Accordion>
      ) : (
        <Loader />
      )}
    </Content>
  )
}
