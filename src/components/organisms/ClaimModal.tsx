/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import components
    import constants
    import hooks
    import utils

    ClaimModal
      hooks
      contract functions
      local functions
      useEffect hooks

  *************************************************************************************/

/* import packages */
import React, { Fragment, useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { formatUnits } from '@ethersproject/units'
import { Block } from '@ethersproject/contracts/node_modules/@ethersproject/abstract-provider'
import { BigNumber } from 'ethers'

/* import managers */
import { useCachedData } from '../../context/CachedDataManager'
import { useNotifications } from '../../context/NotificationsManager'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import components */
import { Modal } from '../molecules/Modal'
import { FormRow, FormCol } from '../atoms/Form'
import { Text } from '../atoms/Typography'
import { PolicyModalInfo } from './PolicyModalInfo'
import { Loader } from '../atoms/Loader'
import { SmallBox, Box } from '../atoms/Box'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Table, TableBody, TableRow, TableData } from '../atoms/Table'
import { StyledLink } from '../atoms/Link'

/* import constants */
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { BKPT_3 } from '../../constants'
import { Policy, ClaimAssessment, LocalTx } from '../../constants/types'

/* import hooks */
import { useGetCooldownPeriod } from '../../hooks/useClaimsEscrow'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { useAppraisePolicyPosition } from '../../hooks/usePolicy'
import { useGetFunctionGas } from '../../hooks/useGas'
import { useSptFarm } from '../../hooks/useSptFarm'

/* import utils */
import { truncateBalance } from '../../utils/formatting'
import { timeToDateText } from '../../utils/time'
import { getClaimAssessment } from '../../utils/api'
import { handleClickExternalLink } from '../../utils/link'

interface ClaimModalProps {
  closeModal: () => void
  isOpen: boolean
  latestBlock: Block | undefined
  selectedPolicy: Policy | undefined
  isPolicyStaked: boolean
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  selectedPolicy,
  closeModal,
  latestBlock,
  isPolicyStaked,
}) => {
  /*************************************************************************************

    hooks

  *************************************************************************************/
  const [modalLoading, setModalLoading] = useState<boolean>(true)
  const [claimSubmitted, setClaimSubmitted] = useState<boolean>(false)
  const [assessment, setAssessment] = useState<ClaimAssessment | undefined>(undefined)
  const cooldown = useGetCooldownPeriod()
  const { addLocalTransactions, reload, gasPrices, userPolicyData } = useCachedData()
  const { selectedProtocol } = useContracts()
  const { makeTxToast } = useNotifications()
  const { haveErrors } = useGeneral()
  const { activeNetwork, currencyDecimals, chainId } = useNetwork()
  const { withdrawPolicy } = useSptFarm()
  const { width } = useWindowDimensions()
  const { getGasConfig, getGasLimit } = useGetFunctionGas()
  const gasConfig = useMemo(() => getGasConfig(gasPrices.selected?.value), [gasPrices, getGasConfig])
  const appraisal = useAppraisePolicyPosition(selectedPolicy)
  const [canCloseOnLoading, setCanCloseOnLoading] = useState<boolean>(false)
  const mounting = useRef(true)

  /*************************************************************************************

    contract functions

  *************************************************************************************/

  const submitClaim = async () => {
    if (!selectedProtocol || !assessment || !selectedPolicy) return
    setModalLoading(true)
    const { amountOut, deadline, signature } = assessment
    const txType = FunctionName.SUBMIT_CLAIM
    try {
      const tx = await selectedProtocol.submitClaim(selectedPolicy.policyId, amountOut, deadline, signature, {
        ...gasConfig,
        gasLimit: getGasLimit(selectedPolicy.productName, txType),
      })
      const txHash = tx.hash
      const localTx: LocalTx = {
        hash: txHash,
        type: txType,
        value: `Policy #${selectedPolicy.policyId}`,
        status: TransactionCondition.PENDING,
      }
      await handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('submitClaim:', err, txType)
    }
  }

  const callWithdrawPolicy = async () => {
    if (!selectedPolicy) return
    setModalLoading(true)
    await withdrawPolicy(BigNumber.from(selectedPolicy.policyId), gasConfig)
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
    setCanCloseOnLoading(true)
    await tx.wait().then((receipt: any) => {
      const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
      makeTxToast(localTx.type, status, localTx.hash)
      setCanCloseOnLoading(false)
      setModalLoading(false)
      reload()
    })
  }

  const handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    console.log(functionName, err)
    makeTxToast(txType, TransactionCondition.CANCELLED)
    setModalLoading(false)
    reload()
  }

  const handleClose = useCallback(() => {
    setClaimSubmitted(false)
    setModalLoading(false)
    setAssessment(undefined)
    setCanCloseOnLoading(false)
    userPolicyData.setCanGetAssessments(true)
    mounting.current = true
    closeModal()
  }, [closeModal])

  /*************************************************************************************

    useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    const loadOnBoot = async () => {
      if (!selectedPolicy || !isOpen) return
      setCanCloseOnLoading(true)
      setModalLoading(true)
      userPolicyData.setCanGetAssessments(false)
      const assessment = await getClaimAssessment(String(selectedPolicy.policyId), chainId).catch((err) => {
        console.log(err)
        return undefined
      })
      setAssessment(assessment)
      setModalLoading(false)
      setCanCloseOnLoading(false)
      mounting.current = false
    }
    loadOnBoot()
  }, [isOpen])

  useEffect(() => {
    const loadOverTime = async () => {
      if (!selectedPolicy || !isOpen || mounting.current) return
      userPolicyData.setCanGetAssessments(false)
      const assessment = await getClaimAssessment(String(selectedPolicy.policyId), chainId).catch((err) => {
        console.log(err)
        return undefined
      })
      setAssessment(assessment)
    }
    loadOverTime()
  }, [selectedPolicy])

  return (
    <Modal
      isOpen={isOpen}
      handleClose={handleClose}
      modalTitle={'Policy Claim'}
      disableCloseButton={modalLoading && !canCloseOnLoading}
    >
      <Fragment>
        <PolicyModalInfo selectedPolicy={selectedPolicy} latestBlock={latestBlock} appraisal={appraisal} />
        {!modalLoading ? (
          assessment ? (
            <Fragment>
              {width > BKPT_3 && (
                <FormRow mb={0}>
                  <FormCol>
                    <Text t4 autoAlign nowrap>
                      By submitting a claim, you receive
                    </Text>
                  </FormCol>
                  <FormCol></FormCol>
                </FormRow>
              )}
              <FormRow mb={0}>
                <FormCol>
                  <Text t4 autoAlign nowrap>
                    {width > BKPT_3 ? 'pre-exploit assets value equal to' : 'Receiving'}
                  </Text>
                </FormCol>
                <FormCol>
                  <Text bold t2 autoAlign>
                    {truncateBalance(formatUnits(assessment.amountOut || 0, currencyDecimals))}{' '}
                    {activeNetwork.nativeCurrency.symbol}
                  </Text>
                </FormCol>
              </FormRow>
              <SmallBox style={{ justifyContent: 'center' }} transparent mt={10}>
                <Text t4 bold warning textAlignCenter fade={isPolicyStaked}>
                  Please wait for the review period to elapse before withdrawing your payout.
                </Text>
              </SmallBox>
              <Table isHighlight light fade={isPolicyStaked}>
                <TableBody>
                  <TableRow>
                    <TableData>
                      <Text t2 light>
                        Current Review Period
                      </Text>
                    </TableData>
                    <TableData textAlignRight>
                      <Text t2 light>
                        {timeToDateText(parseInt(cooldown) * 1000)}
                      </Text>
                    </TableData>
                  </TableRow>
                </TableBody>
              </Table>
              <SmallBox
                style={{ justifyContent: 'center' }}
                transparent
                mt={!assessment.lossEventDetected ? 10 : 0}
                mb={!assessment.lossEventDetected ? 10 : 0}
                collapse={assessment.lossEventDetected}
              >
                <Text t4 bold error={!assessment.lossEventDetected} textAlignCenter fade={isPolicyStaked}>
                  No loss event detected, unable to submit claims yet.
                </Text>
              </SmallBox>
              {claimSubmitted ? (
                <Box color2 mt={20} mb={20}>
                  <Text bold t2 autoAlign>
                    Claim has been validated and payout submitted to the escrow.
                  </Text>
                </Box>
              ) : isPolicyStaked ? (
                <div>
                  <Text bold t2 textAlignCenter info>
                    Please unstake this policy from the SPT pool to submit a claim
                  </Text>
                  <ButtonWrapper>
                    <Button widthP={100} disabled={haveErrors} onClick={() => callWithdrawPolicy()} info>
                      Unstake
                    </Button>
                  </ButtonWrapper>
                </div>
              ) : (
                <ButtonWrapper isColumn={width < BKPT_3}>
                  <Button
                    widthP={100}
                    disabled={haveErrors || !assessment.lossEventDetected}
                    onClick={() => submitClaim()}
                    info
                  >
                    Submit Claim
                  </Button>
                  <StyledLink
                    href={'https://docs.solace.fi'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ width: '100%' }}
                    onClick={handleClickExternalLink}
                  >
                    <Button widthP={100} disabled={haveErrors || !assessment.lossEventDetected} info>
                      Dispute Claim
                    </Button>
                  </StyledLink>
                </ButtonWrapper>
              )}
            </Fragment>
          ) : (
            <Box transparent mt={20} mb={20}>
              <Text bold t2 autoAlign error>
                Claim assessment data not found.
              </Text>
            </Box>
          )
        ) : (
          <Loader />
        )}
      </Fragment>
    </Modal>
  )
}
