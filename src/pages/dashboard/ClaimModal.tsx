/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import components
    import constants
    import hooks
    import utils

    ClaimModal function
      useState hooks
      custom hooks
      Contract functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useEffect, useState } from 'react'

/* import packages */
import { formatEther } from '@ethersproject/units'
import { Contract } from 'ethers'

/* import managers */
import { useWallet } from '../../context/WalletManager'
import { useUserData } from '../../context/UserDataManager'
import { useToasts } from '../../context/NotificationsManager'
import { useContracts } from '../../context/ContractsManager'

/* import components */
import { Modal, ModalHeader, ModalContent, ModalCloseButton } from '../../components/Modal'
import { BoxChooseRow, BoxChooseCol } from '../../components/Box/BoxChoose'
import { Heading2, Heading3, Text2, Text3 } from '../../components/Text'
import { PolicyInfo } from './PolicyInfo'
import { Loader } from '../../components/Loader'
import { SmallBox, Box } from '../../components/Box'
import { Button, ButtonWrapper } from '../../components/Button'
import { Table, TableBody, TableRow, TableData } from '../../components/Table'

/* import constants */
import { FunctionNames, TransactionConditions, Units } from '../../constants/enums'
import cTokenABI from '../../constants/abi/contracts/interface/ICToken.sol/ICToken.json'
import { GAS_LIMIT } from '../../constants'

/* import hooks */
import { useTokenAllowance } from '../../hooks/useTokenAllowance'
import { useClaimsEscrow } from '../../hooks/useClaimsEscrow'
import { Policy } from '../../hooks/useGetter'

/* import utils */
import { ClaimAssessment, getClaimAssessment, getPositions } from '../../utils/paclas'
import { truncateBalance, fixedPositionBalance, getGasValue } from '../../utils/formatting'
import { hasApproval, getContract } from '../../utils'
import { timeToText } from '../../utils/time'

type ClaimModalProps = {
  closeModal?: any
  isOpen: boolean
  latestBlock: number
  selectedPolicy: Policy | undefined
}

export const ClaimModal: React.FC<ClaimModalProps> = ({ isOpen, selectedPolicy, closeModal, latestBlock }) => {
  /*************************************************************************************

    useState hooks

  *************************************************************************************/
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [claimId, setClaimId] = useState<any>(null)
  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const [asyncLoading, setAsyncLoading] = useState<boolean>(false)
  const [assessment, setAssessment] = useState<ClaimAssessment | null>(null)
  const [positionBalances, setPositionBalances] = useState<any>(null)
  const [cooldownPeriod, setCooldownPeriod] = useState<string>('-')

  /*************************************************************************************

    custom hooks

  *************************************************************************************/

  const { getCooldownPeriod } = useClaimsEscrow()
  const tokenAllowance = useTokenAllowance(contractForAllowance, spenderAddress)
  const { addLocalTransactions } = useUserData()
  const { selectedProtocol, getProtocolByName } = useContracts()
  const { makeTxToast } = useToasts()
  const wallet = useWallet()

  /*************************************************************************************

    Contract functions

  *************************************************************************************/

  const approve = async () => {
    setModalLoading(true)
    if (!selectedProtocol || !assessment || !selectedPolicy) return
    const { amountIn } = assessment
    const txType = FunctionNames.APPROVE
    const contractForAllowance = getContract(selectedPolicy.positionContract, cTokenABI, wallet.library, wallet.account)
    try {
      const approval = await contractForAllowance.approve(selectedProtocol.address, amountIn)
      const approvalHash = approval.hash
      makeTxToast(FunctionNames.APPROVE, TransactionConditions.PENDING, approvalHash)
      await approval.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionConditions.SUCCESS : TransactionConditions.FAILURE
        makeTxToast(FunctionNames.APPROVE, status, approvalHash)
        wallet.reload()
      })
      setModalLoading(false)
    } catch (err) {
      makeTxToast(txType, TransactionConditions.CANCELLED)
      setModalLoading(false)
      wallet.reload()
    }
  }

  const submitClaim = async () => {
    setModalLoading(true)
    if (!selectedProtocol || !assessment || !selectedPolicy) return
    const { tokenIn, amountIn, tokenOut, amountOut, deadline, signature } = assessment
    const txType = FunctionNames.SUBMIT_CLAIM
    try {
      const tx = await selectedProtocol.submitClaim(
        selectedPolicy?.policyId,
        tokenIn,
        amountIn,
        tokenOut,
        amountOut,
        deadline,
        signature,
        {
          gasPrice: getGasValue(wallet.gasPrices.selected.value),
          gasLimit: GAS_LIMIT,
        }
      )
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: '0', status: TransactionConditions.PENDING, unit: Units.ID }
      addLocalTransactions(localTx)
      wallet.reload()
      makeTxToast(txType, TransactionConditions.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionConditions.SUCCESS : TransactionConditions.FAILURE
        const rawClaimId = receipt.logs[2].topics[1]
        setClaimId(parseInt(rawClaimId))
        makeTxToast(txType, status, txHash)
        wallet.reload()
      })
      setModalLoading(false)
    } catch (err) {
      makeTxToast(txType, TransactionConditions.CANCELLED)
      setModalLoading(false)
      wallet.reload()
    }
  }

  /*************************************************************************************

    useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    const load = async () => {
      if (!selectedPolicy || !wallet.chainId || !wallet.account || !isOpen) return
      setAsyncLoading(true)
      const tokenContract = getContract(selectedPolicy.positionContract, cTokenABI, wallet.library, wallet.account)
      const assessment = await getClaimAssessment(String(selectedPolicy?.policyId))
      const balances = await getPositions(selectedPolicy.productName.toLowerCase(), wallet.chainId, wallet.account)
      const cooldown = await getCooldownPeriod()
      setCooldownPeriod(cooldown)
      setPositionBalances(balances)
      setContractForAllowance(tokenContract)
      setSpenderAddress(getProtocolByName(selectedPolicy.productName.toLowerCase())?.address || null)
      setAssessment(assessment)
      setAsyncLoading(false)
    }
    load()
  }, [isOpen, selectedPolicy, wallet.account, wallet.chainId])

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Modal isOpen={isOpen}>
      <ModalHeader>
        <Heading2>Policy Claim</Heading2>
        <ModalCloseButton hidden={modalLoading} onClick={() => closeModal()} />
      </ModalHeader>
      <hr style={{ marginBottom: '20px' }} />
      <ModalContent>
        <PolicyInfo selectedPolicy={selectedPolicy} latestBlock={latestBlock} asyncLoading={asyncLoading} />
        {!modalLoading && !asyncLoading ? (
          <Fragment>
            <BoxChooseRow>
              <BoxChooseCol>
                <Text3 autoAlign>By submitting a claim you swap</Text3>
              </BoxChooseCol>
              <BoxChooseCol>
                <Heading2 autoAlign>
                  {positionBalances &&
                    positionBalances.map(
                      (position: any) =>
                        position.token.address == assessment?.tokenIn &&
                        `${truncateBalance(
                          fixedPositionBalance(assessment?.amountIn || '', position.token.decimals)
                        )} ${position.token.symbol}`
                    )}{' '}
                </Heading2>
              </BoxChooseCol>
            </BoxChooseRow>
            <BoxChooseRow>
              <BoxChooseCol>
                <Text3 autoAlign>for pre-exploit assets value equal to</Text3>
              </BoxChooseCol>
              <BoxChooseCol>
                <Heading2 autoAlign>{formatEther(assessment?.amountOut || 0)} ETH</Heading2>
              </BoxChooseCol>
            </BoxChooseRow>
            <SmallBox mt={10} collapse={assessment?.lossEventDetected}>
              <Text2 autoAlign error={!assessment?.lossEventDetected}>
                No loss event detected, unable to submit claims yet.
              </Text2>
            </SmallBox>
            {!hasApproval(tokenAllowance, assessment?.amountIn) && !claimId && (
              <ButtonWrapper>
                <Button widthP={100} disabled={!assessment?.lossEventDetected} onClick={() => approve()}>
                  Approve Solace Protocol to transfer your{' '}
                  {positionBalances &&
                    positionBalances.map(
                      (position: any) => position.token.address == assessment?.tokenIn && position.token.symbol
                    )}
                </Button>
              </ButtonWrapper>
            )}
            {claimId ? (
              <Box purple mt={20} mb={20}>
                <Heading2 autoAlign>Claim has been validated and payout submitted to the escrow.</Heading2>
              </Box>
            ) : (
              <ButtonWrapper>
                <Button
                  widthP={100}
                  disabled={!assessment?.lossEventDetected || !hasApproval(tokenAllowance, assessment?.amountIn)}
                  onClick={() => submitClaim()}
                >
                  Submit Claim
                </Button>
              </ButtonWrapper>
            )}
            <SmallBox>
              <Heading3 autoAlign warning>
                Please wait for the cooldown period to elapse before withdrawing your payout.
              </Heading3>
            </SmallBox>
            <Table isHighlight>
              <TableBody>
                <TableRow>
                  <TableData>
                    <Text2>Current Cooldown Period</Text2>
                  </TableData>
                  <TableData textAlignRight>
                    <Text2>{timeToText(parseInt(cooldownPeriod) * 1000)}</Text2>
                  </TableData>
                </TableRow>
              </TableBody>
            </Table>
          </Fragment>
        ) : (
          <Loader />
        )}
      </ModalContent>
    </Modal>
  )
}
