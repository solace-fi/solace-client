/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import components
    import config
    import constants
    import hooks
    import utils

    ClaimModal function
      useState hooks
      custom hooks
      contract functions
      local functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useCallback, useEffect, useState, useRef } from 'react'

/* import packages */
import { formatEther } from '@ethersproject/units'
import { Contract } from 'ethers'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useToasts } from '../../context/NotificationsManager'
import { useContracts } from '../../context/ContractsManager'

/* import components */
import { Modal } from '../molecules/Modal'
import { FormRow, FormCol } from '../atoms/Form'
import { Heading2, Heading3, Text2, Text3 } from '../atoms/Typography'
import { PolicyModalInfo } from '../molecules/PolicyModalInfo'
import { Loader } from '../atoms/Loader'
import { SmallBox, Box } from '../atoms/Box'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Table, TableBody, TableRow, TableData } from '../atoms/Table'

/* import config */
import { policyConfig } from '../../config/chainConfig'

/* import constants */
import { FunctionName, TransactionCondition, Unit, ProductName } from '../../constants/enums'
import cTokenABI from '../../constants/abi/contracts/interface/ICToken.sol/ICToken.json'
import { DEFAULT_CHAIN_ID, GAS_LIMIT, MAX_MOBILE_SCREEN_WIDTH } from '../../constants'
import { Token, Policy, ClaimAssessment } from '../../constants/types'

/* import hooks */
import { useTokenAllowance } from '../../hooks/useTokenAllowance'
import { useGetCooldownPeriod } from '../../hooks/useClaimsEscrow'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { getClaimAssessment } from '../../utils/paclas'
import { truncateBalance, fixedPositionBalance, getGasValue } from '../../utils/formatting'
import { hasApproval, getContract } from '../../utils'
import { timeToText } from '../../utils/time'

interface ClaimModalProps {
  closeModal: () => void
  isOpen: boolean
  latestBlock: number
  selectedPolicy: Policy | undefined
}

export const ClaimModal: React.FC<ClaimModalProps> = ({ isOpen, selectedPolicy, closeModal, latestBlock }) => {
  /*************************************************************************************

    useState hooks

  *************************************************************************************/
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [claimSubmitted, setClaimSubmitted] = useState<boolean>(false)
  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const [asyncLoading, setAsyncLoading] = useState<boolean>(false)
  const [assessment, setAssessment] = useState<ClaimAssessment | null>(null)
  const [positionBalances, setPositionBalances] = useState<Token[]>([])
  const needApproval = useRef(true)
  const canLoadOverTime = useRef(false)

  /*************************************************************************************

    custom hooks

  *************************************************************************************/

  const cooldown = useGetCooldownPeriod()
  const tokenAllowance = useTokenAllowance(contractForAllowance, spenderAddress)
  const { addLocalTransactions, reload, gasPrices, tokenPositionDataInitialized } = useCachedData()
  const { selectedProtocol, getProtocolByName } = useContracts()
  const { makeTxToast } = useToasts()
  const { account, chainId, errors, library } = useWallet()
  const { width } = useWindowDimensions()

  /*************************************************************************************

    Contract functions

  *************************************************************************************/

  const approve = async () => {
    setModalLoading(true)
    if (!selectedProtocol || !assessment || !selectedPolicy || !contractForAllowance) return
    const { amountIn } = assessment
    const txType = FunctionName.APPROVE
    try {
      const approval = await contractForAllowance.approve(selectedProtocol.address, amountIn)
      const approvalHash = approval.hash
      makeTxToast(FunctionName.APPROVE, TransactionCondition.PENDING, approvalHash)
      await approval.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(FunctionName.APPROVE, status, approvalHash)
        reload()
      })
      setModalLoading(false)
    } catch (err) {
      console.log('approve:', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  const submitClaim = async () => {
    setModalLoading(true)
    if (!selectedProtocol || !assessment || !selectedPolicy) return
    const { tokenIn, amountIn, tokenOut, amountOut, deadline, signature } = assessment
    const txType = FunctionName.SUBMIT_CLAIM
    try {
      const tx = needApproval.current
        ? await selectedProtocol.submitClaim(
            selectedPolicy.policyId,
            tokenIn,
            amountIn,
            tokenOut,
            amountOut,
            deadline,
            signature,
            {
              gasPrice: getGasValue(gasPrices.selected.value),
              gasLimit: GAS_LIMIT,
            }
          )
        : await selectedProtocol.submitClaim(selectedPolicy.policyId, amountOut, deadline, signature, {
            gasPrice: getGasValue(gasPrices.selected.value),
            gasLimit: GAS_LIMIT,
          })
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: '0', status: TransactionCondition.PENDING, unit: Unit.ID }
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

  const getUserBalances = async () => {
    if (!account || !library || !tokenPositionDataInitialized || !chainId || !selectedPolicy) return
    if (policyConfig[chainId]) {
      try {
        const balances: Token[] = await policyConfig[chainId ?? DEFAULT_CHAIN_ID].getBalances[
          selectedPolicy.productName
        ](account, library, chainId)
        setPositionBalances(balances)
      } catch (err) {
        console.log(err)
      }
    }
  }

  const handleClose = useCallback(() => {
    setClaimSubmitted(false)
    setModalLoading(false)
    closeModal()
    needApproval.current = true
  }, [closeModal])

  /*************************************************************************************

    useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    const load = async () => {
      if (!selectedPolicy || !isOpen) return
      if (selectedPolicy.productName == ProductName.AAVE) needApproval.current = false
      setAsyncLoading(true)
      if (policyConfig[chainId ?? DEFAULT_CHAIN_ID]) {
        await getUserBalances()
      }
      if (needApproval.current) {
        const tokenContract = getContract(selectedPolicy.positionContract, cTokenABI, library, account)
        setContractForAllowance(tokenContract)
        setSpenderAddress(getProtocolByName(selectedPolicy.productName)?.address || null)
      }
      const assessment = await getClaimAssessment(String(selectedPolicy.policyId), chainId ?? DEFAULT_CHAIN_ID)
      setAssessment(assessment)
      canLoadOverTime.current = true
      setAsyncLoading(false)
    }
    load()
  }, [isOpen, selectedPolicy, account, library, tokenPositionDataInitialized])

  useEffect(() => {
    const loadOverTime = async () => {
      if (canLoadOverTime.current) {
        await getUserBalances()
      }
    }
    loadOverTime()
  }, [latestBlock])

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={'Policy Claim'} disableCloseButton={modalLoading}>
      <Fragment>
        <PolicyModalInfo selectedPolicy={selectedPolicy} latestBlock={latestBlock} />
        {!modalLoading && !asyncLoading ? (
          <Fragment>
            <FormRow mb={0}>
              <FormCol>
                <Text3 autoAlign nowrap>
                  {assessment?.amountIn != undefined
                    ? width > MAX_MOBILE_SCREEN_WIDTH
                      ? 'By submitting a claim you swap'
                      : 'Swapping'
                    : width > MAX_MOBILE_SCREEN_WIDTH
                    ? 'By submitting a claim, you receive'
                    : null}
                </Text3>
              </FormCol>
              <FormCol>
                {assessment?.amountIn != undefined && (
                  <Heading2 autoAlign>
                    {positionBalances &&
                      positionBalances.map(
                        (position: any) =>
                          position.token.address == selectedPolicy?.positionContract &&
                          `${truncateBalance(
                            fixedPositionBalance(assessment?.amountIn || '', position.token.decimals)
                          )} ${position.token.symbol}`
                      )}{' '}
                  </Heading2>
                )}
              </FormCol>
            </FormRow>
            <FormRow mb={0}>
              <FormCol>
                <Text3 autoAlign nowrap>
                  {assessment?.amountIn != undefined
                    ? width > MAX_MOBILE_SCREEN_WIDTH
                      ? 'for pre-exploit assets value equal to'
                      : 'for pre-exploit assets'
                    : width > MAX_MOBILE_SCREEN_WIDTH
                    ? 'pre-exploit assets value equal to'
                    : 'Receiving'}
                </Text3>
              </FormCol>
              <FormCol>
                <Heading2 autoAlign>{truncateBalance(formatEther(assessment?.amountOut || 0))} ETH</Heading2>
              </FormCol>
            </FormRow>
            <SmallBox transparent mt={!assessment?.lossEventDetected ? 10 : 0} collapse={assessment?.lossEventDetected}>
              <Text2 autoAlign error={!assessment?.lossEventDetected}>
                No loss event detected, unable to submit claims yet.
              </Text2>
            </SmallBox>
            {!hasApproval(tokenAllowance, assessment?.amountIn) && needApproval.current && !claimSubmitted && (
              <ButtonWrapper>
                <Button
                  widthP={100}
                  disabled={errors.length > 0 || !assessment?.lossEventDetected}
                  onClick={() => approve()}
                >
                  Approve Solace Protocol to transfer your{' '}
                  {positionBalances &&
                    positionBalances.map(
                      (position: any) =>
                        position.token.address == selectedPolicy?.positionContract && position.token.symbol
                    )}
                </Button>
              </ButtonWrapper>
            )}
            {claimSubmitted ? (
              <Box purple mt={20} mb={20}>
                <Heading2 autoAlign>Claim has been validated and payout submitted to the escrow.</Heading2>
              </Box>
            ) : (
              <ButtonWrapper>
                <Button
                  widthP={100}
                  disabled={
                    errors.length > 0 ||
                    !assessment?.lossEventDetected ||
                    (!hasApproval(tokenAllowance, assessment?.amountIn) && needApproval.current)
                  }
                  onClick={() => submitClaim()}
                >
                  Submit Claim
                </Button>
              </ButtonWrapper>
            )}
            {width > MAX_MOBILE_SCREEN_WIDTH && (
              <>
                <SmallBox transparent>
                  <Heading3 autoAlign warning>
                    Please wait for the cooldown period to elapse before withdrawing your payout.
                  </Heading3>
                </SmallBox>
              </>
            )}
            <Table isHighlight>
              <TableBody>
                <TableRow>
                  <TableData t2>Current Cooldown Period</TableData>
                  <TableData t2 textAlignRight>
                    {timeToText(parseInt(cooldown) * 1000)}
                  </TableData>
                </TableRow>
              </TableBody>
            </Table>
          </Fragment>
        ) : (
          <Loader />
        )}
      </Fragment>
    </Modal>
  )
}
