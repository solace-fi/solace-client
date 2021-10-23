/*************************************************************************************

    Table of Contents:

    import react
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

/* import react */
import React, { Fragment, useCallback, useEffect, useState, useRef } from 'react'

/* import packages */
import { formatUnits } from '@ethersproject/units'
import { Block } from '@ethersproject/contracts/node_modules/@ethersproject/abstract-provider'

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
import { HyperLink } from '../atoms/Link'

/* import constants */
import { FunctionName, TransactionCondition, Unit } from '../../constants/enums'
import { GAS_LIMIT, BKPT_3 } from '../../constants'
import { Policy, ClaimAssessment } from '../../constants/types'

/* import hooks */
import { useGetCooldownPeriod } from '../../hooks/useClaimsEscrow'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { useAppraisePolicyPosition } from '../../hooks/usePolicy'
import { useGasConfig } from '../../hooks/useGas'

/* import utils */
import { truncateBalance } from '../../utils/formatting'
import { timeToDateText } from '../../utils/time'
import { getClaimAssessment } from '../../utils/api'

interface ClaimModalProps {
  closeModal: () => void
  isOpen: boolean
  latestBlock: Block | undefined
  selectedPolicy: Policy | undefined
}

export const ClaimModal: React.FC<ClaimModalProps> = ({ isOpen, selectedPolicy, closeModal, latestBlock }) => {
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
  const { width } = useWindowDimensions()
  const { gasConfig } = useGasConfig(gasPrices.selected?.value)
  const appraisal = useAppraisePolicyPosition(selectedPolicy)
  const [canCloseOnLoading, setCanCloseOnLoading] = useState<boolean>(false)
  const mounting = useRef(true)

  /*************************************************************************************

    contract functions

  *************************************************************************************/

  const submitClaim = async () => {
    setModalLoading(true)
    if (!selectedProtocol || !assessment || !selectedPolicy) return
    const { amountOut, deadline, signature } = assessment
    const txType = FunctionName.SUBMIT_CLAIM
    try {
      const tx = await selectedProtocol.submitClaim(selectedPolicy.policyId, amountOut, deadline, signature, {
        ...gasConfig,
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: `Policy #${selectedPolicy.policyId}`,
        status: TransactionCondition.PENDING,
        unit: Unit.ID,
      }
      addLocalTransactions(localTx)
      reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        if (receipt.status) setClaimSubmitted(true)
        makeTxToast(txType, status, txHash)
        reload()
      })
      setModalLoading(false)
    } catch (err) {
      console.log('submitClaim:', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  /*************************************************************************************

  local functions

  *************************************************************************************/

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
                <Text t4 bold warning textAlignCenter>
                  Please wait for the cooldown period to elapse before withdrawing your payout.
                </Text>
              </SmallBox>
              <Table isHighlight light>
                <TableBody>
                  <TableRow>
                    <TableData>
                      <Text t2 light>
                        Current Cooldown Period
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
                collapse={assessment.lossEventDetected}
              >
                <Text t4 bold error={!assessment.lossEventDetected} textAlignCenter>
                  No loss event detected, unable to submit claims yet.
                </Text>
              </SmallBox>
              {claimSubmitted ? (
                <Box color2 mt={20} mb={20}>
                  <Text bold t2 autoAlign>
                    Claim has been validated and payout submitted to the escrow.
                  </Text>
                </Box>
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
                  <HyperLink
                    href={'https://docs.solace.fi'}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ width: '100%' }}
                  >
                    <Button widthP={100} disabled={haveErrors || !assessment.lossEventDetected} info>
                      Dispute Claim
                    </Button>
                  </HyperLink>
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
