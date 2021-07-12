/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import managers
    import components
    import hooks
    import utils
    styled components

    Dashboard function
      useRef variables
      useState variables
      Hook variables
      variables
      contract functions
      Local helper functions
      useEffect hooks
      JSX Elements
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useRef, useEffect, useState } from 'react'

/* import packages */
import { Contract } from '@ethersproject/contracts'
import { Slider } from '@rebass/forms'
import { BigNumber } from 'ethers'
import { formatEther, parseEther } from 'ethers/lib/utils'
import styled from 'styled-components'

/* import constants */
import { Unit, PolicyStatus } from '../../constants/enums'
import { CHAIN_ID, DAYS_PER_YEAR, GAS_LIMIT, NUM_BLOCKS_PER_DAY } from '../../constants'
import { TransactionCondition, FunctionName } from '../../constants/enums'
import cTokenABI from '../../constants/abi/contracts/interface/ICToken.sol/ICToken.json'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'
import { useUserData } from '../../context/UserDataManager'
import { useToasts } from '../../context/NotificationsManager'

/* import components */
import { Content, HeroContainer } from '../../components/Layout'
import { CardContainer, InvestmentCard, CardHeader, CardTitle, CardBlock, ClaimCard } from '../../components/Card'
import { Heading1, Heading2, Heading3, Text1, Text2, Text3 } from '../../components/Text'
import { Button, ButtonWrapper } from '../../components/Button'
import { Table, TableHead, TableHeader, TableRow, TableBody, TableData, TableDataGroup } from '../../components/Table'
import { Modal, ModalHeader, ModalContent, ModalCloseButton } from '../../components/Modal'
import { Input } from '../../components/Input'
import { BoxChooseDate, BoxChooseCol, BoxChooseRow, BoxChooseText } from '../../components/Box/BoxChoose'
import { Box, BoxItem, BoxItemTitle, BoxItemValue, SmallBox } from '../../components/Box'
import { Loader } from '../../components/Loader'
import { ProtocolImage, Protocol, ProtocolTitle } from '../../components/Protocol'

/* import hooks */
import { useUserStakedValue } from '../../hooks/useUserStakedValue'
import { useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'
import { useGetCancelFee, useGetQuote, useGetPolicyPrice, useAppraisePosition } from '../../hooks/usePolicy'
import { useTokenAllowance } from '../../hooks/useTokenAllowance'
import { useClaimsEscrow } from '../../hooks/useClaimsEscrow'
import { usePolicyGetter, Policy } from '../../hooks/useGetter'

/* import utils */
import { getGasValue, truncateBalance, fixedPositionBalance } from '../../utils/formatting'
import { fetchEtherscanLatestBlockNumber } from '../../utils/etherscan'
import { getUserPolicies, ClaimAssessment, getClaimAssessment, getPositions } from '../../utils/paclas'
import { getContract, hasApproval } from '../../utils'
import { timer, timeToText } from '../../utils/time'

/*************************************************************************************

styled components

*************************************************************************************/

const UpdatePolicySec = styled.div`
  display: grid;
  grid-template-columns: 440px 150px;
  grid-template-rows: 1fr 1fr 1fr;
  justify-content: space-between;
  margin-bottom: 20px;
`

const CancelPolicySec = styled.div`
  display: grid;
  grid-template-columns: 440px 150px;
  grid-template-rows: 1fr 1fr;
  justify-content: space-between;
`

function Dashboard(): any {
  /************************************************************************************* 

    useRef variables 

  *************************************************************************************/

  const cpFarmContract = useRef<Contract | null>()
  const lpFarmContract = useRef<Contract | null>()

  /*************************************************************************************

    useState variables

  *************************************************************************************/

  const [policies, setPolicies] = useState<Policy[]>([])
  const [claimDetails, setClaimDetails] = useState<any[]>([])
  const [positionBalances, setPositionBalances] = useState<any>(null)
  const [positionAmount, setPositionAmount] = useState<string | null>(null)
  const [latestBlock, setLatestBlock] = useState<number>(0)
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false)
  const [showManageModal, setShowManageModal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [asyncLoading, setAsyncLoading] = useState<boolean>(false)
  const [extendedTime, setExtendedTime] = useState<string>('0')
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | undefined>(undefined)
  const [assessment, setAssessment] = useState<ClaimAssessment | null>(null)
  const [coverLimit, setCoverLimit] = useState<string | null>(null)
  const [inputCoverage, setInputCoverage] = useState<string>('1')
  const [feedbackCoverage, setFeedbackCoverage] = useState<string>('1')
  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const [claimId, setClaimId] = useState<any>(null)
  const [cooldownPeriod, setCooldownPeriod] = useState<string>('-')

  /*************************************************************************************

    Hook variables

  *************************************************************************************/

  const [cpUserRewards] = useUserPendingRewards(cpFarmContract.current)
  const [cpUserRewardsPerDay] = useUserRewardsPerDay(1, cpFarmContract.current)
  const [lpUserRewards] = useUserPendingRewards(lpFarmContract.current)
  const [lpUserRewardsPerDay] = useUserRewardsPerDay(2, lpFarmContract.current)
  const cpUserStakeValue = useUserStakedValue(cpFarmContract.current)
  const lpUserStakeValue = useUserStakedValue(lpFarmContract.current)
  const {
    cpFarm,
    lpFarm,
    selectedProtocol,
    claimsEscrow,
    setSelectedProtocolByName,
    getProtocolByName,
  } = useContracts()
  const { addLocalTransactions } = useUserData()
  const { makeTxToast } = useToasts()
  const wallet = useWallet()
  const quote = useGetQuote(
    selectedPolicy ? coverLimit : null,
    selectedPolicy ? selectedPolicy.positionContract : null,
    extendedTime
  )
  const policyPrice = useGetPolicyPrice(selectedPolicy ? selectedPolicy.policyId : 0)
  const cancelFee = useGetCancelFee()
  const tokenAllowance = useTokenAllowance(contractForAllowance, spenderAddress)
  const { getClaimDetails, getCooldownPeriod } = useClaimsEscrow()
  const { getPolicies } = usePolicyGetter()
  const { getAppraisePosition } = useAppraisePosition()

  /*************************************************************************************

  variables

  *************************************************************************************/

  const date = new Date()
  const blocksLeft = BigNumber.from(parseFloat(selectedPolicy ? selectedPolicy.expirationBlock : '0') - latestBlock)
  const coverAmount = BigNumber.from(selectedPolicy ? selectedPolicy.coverAmount : '0')
  const price = BigNumber.from(policyPrice || '0')
  const refundAmount = blocksLeft
    .mul(coverAmount)
    .mul(price)
    .div(String(Math.pow(10, 12)))
  const formattedRefundAmount = formatEther(refundAmount)

  /*************************************************************************************

  Contract functions

  *************************************************************************************/

  const approve = async () => {
    setModalLoading(true)
    if (!selectedProtocol || !assessment || !selectedPolicy) return
    const { amountIn } = assessment
    const txType = FunctionName.APPROVE
    const contractForAllowance = getContract(selectedPolicy.positionContract, cTokenABI, wallet.library, wallet.account)
    try {
      const approval = await contractForAllowance.approve(selectedProtocol.address, amountIn)
      const approvalHash = approval.hash
      makeTxToast(FunctionName.APPROVE, TransactionCondition.PENDING, approvalHash)
      await approval.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(FunctionName.APPROVE, status, approvalHash)
        wallet.reload()
      })
      setModalLoading(false)
    } catch (err) {
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      wallet.reload()
    }
  }

  const submitClaim = async () => {
    setModalLoading(true)
    if (!selectedProtocol || !assessment || !selectedPolicy) return
    const { tokenIn, amountIn, tokenOut, amountOut, deadline, signature } = assessment
    const txType = FunctionName.SUBMIT_CLAIM
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
      const localTx = { hash: txHash, type: txType, value: '0', status: TransactionCondition.PENDING, unit: Unit.ID }
      addLocalTransactions(localTx)
      wallet.reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        const rawClaimId = receipt.logs[2].topics[1]
        setClaimId(parseInt(rawClaimId))
        makeTxToast(txType, status, txHash)
        wallet.reload()
      })
      setModalLoading(false)
    } catch (err) {
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      wallet.reload()
    }
  }

  const extendPolicy = async () => {
    setModalLoading(true)
    if (!selectedProtocol) return
    const txType = FunctionName.EXTEND_POLICY
    const extension = BigNumber.from(NUM_BLOCKS_PER_DAY * parseInt(extendedTime))
    try {
      const tx = await selectedProtocol.extendPolicy(selectedPolicy?.policyId, extension, {
        value: coverAmount
          .mul(price)
          .mul(extension)
          .div(String(Math.pow(10, 12)))
          .add(parseEther(quote).div('10000')),
        gasPrice: getGasValue(wallet.gasPrices.selected.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: '0', status: TransactionCondition.PENDING, unit: Unit.ID }
      closeModal()
      addLocalTransactions(localTx)
      wallet.reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      wallet.reload()
    }
  }

  const cancelPolicy = async () => {
    setModalLoading(true)
    if (!selectedProtocol || !selectedPolicy) return
    const txType = FunctionName.CANCEL_POLICY
    try {
      const tx = await selectedProtocol.cancelPolicy(selectedPolicy.policyId, {
        gasPrice: getGasValue(wallet.gasPrices.selected.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: String(selectedPolicy.policyId),
        status: TransactionCondition.PENDING,
        unit: Unit.ID,
      }
      closeModal()
      addLocalTransactions(localTx)
      wallet.reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      wallet.reload()
    }
  }

  const withdrawPayout = async (_claimId: any) => {
    setModalLoading(true)
    if (!claimsEscrow || !_claimId) return
    const txType = FunctionName.WITHDRAW_CLAIMS_PAYOUT
    try {
      const tx = await claimsEscrow.withdrawClaimsPayout(_claimId, {
        gasPrice: getGasValue(wallet.gasPrices.selected.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: String(_claimId),
        status: TransactionCondition.PENDING,
        unit: Unit.ID,
      }
      closeModal()
      addLocalTransactions(localTx)
      wallet.reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      wallet.reload()
    }
  }

  /*************************************************************************************

  Local helper functions

  *************************************************************************************/

  const getCoverLimit = (policy: Policy | undefined, positionAmount: any) => {
    if (positionAmount == undefined || policy == undefined) return null
    const coverAmount = policy.coverAmount
    const coverLimit = BigNumber.from(coverAmount).mul('10000').div(positionAmount).toString()
    setCoverLimit(coverLimit)
    setFeedbackCoverage(coverLimit)
    setInputCoverage(
      coverLimit.substring(0, coverLimit.length - 2) +
        '.' +
        coverLimit.substring(coverLimit.length - 2, coverLimit.length)
    )
  }

  const calculatePolicyExpirationDate = (expirationBlock: string): string => {
    const days = getDays(expirationBlock)
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toLocaleDateString()
  }

  const getDays = (expirationBlock: string): number => {
    return Math.floor((parseFloat(expirationBlock) - latestBlock) / NUM_BLOCKS_PER_DAY)
  }

  const openStatusModal = async (policy: Policy) => {
    if (!wallet.chainId || !wallet.account) return
    setShowStatusModal((prev) => !prev)
    setSelectedProtocolByName(policy.productName.toLowerCase())
    document.body.style.overflowY = 'hidden'
    setSelectedPolicy(policy)
    setAsyncLoading(true)
    const tokenContract = getContract(policy.positionContract, cTokenABI, wallet.library, wallet.account)
    const assessment = await getClaimAssessment(String(policy.policyId))
    const balances = await getPositions(policy.productName.toLowerCase(), wallet.chainId, wallet.account)
    const positionAmount = await getAppraisePosition(
      getProtocolByName(policy.productName.toLowerCase()),
      policy.positionContract
    )

    // for display
    setPositionAmount(formatEther(positionAmount))

    // for approval
    setContractForAllowance(tokenContract)
    setSpenderAddress(getProtocolByName(policy.productName.toLowerCase())?.address || null)

    // slider
    getCoverLimit(policy, positionAmount)

    // getting token symbol
    setPositionBalances(balances)

    // set claim assessment to judge eligibility for claim
    setAssessment(assessment)
    setAsyncLoading(false)
  }

  const openManageModal = async (days: number, policy: Policy) => {
    setShowManageModal((prev) => !prev)
    setSelectedProtocolByName(policy.productName.toLowerCase())
    document.body.style.overflowY = 'hidden'
    setSelectedPolicy(policy)
    setAsyncLoading(true)
    const positionAmount = await getAppraisePosition(
      getProtocolByName(policy.productName.toLowerCase()),
      policy.positionContract
    )
    setPositionAmount(formatEther(positionAmount))
    getCoverLimit(policy, positionAmount)
    setAsyncLoading(false)
  }

  const closeModal = () => {
    setShowStatusModal(false)
    setShowManageModal(false)
    document.body.style.overflowY = 'scroll'
    setModalLoading(false)
    setExtendedTime('0')
    setClaimId(null)
  }

  const filteredTime = (input: string) => {
    const filtered = input.replace(/[^0-9]*/g, '')
    if (
      parseFloat(filtered) <= DAYS_PER_YEAR - getDays(selectedPolicy ? selectedPolicy.expirationBlock : '0') ||
      filtered == ''
    ) {
      setExtendedTime(filtered)
    }
  }

  const handleInputCoverage = (input: string) => {
    // allow only numbers and decimals
    const filtered = input.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')

    // if number is greater than 100, do not update
    if (parseFloat(filtered) > 100) {
      return
    }

    // if number has more than 2 decimal places, do not update
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 2) {
      return
    }

    // convert input into BigNumber-compatible data
    const multiplied = filtered == '' ? '100' : Math.round(parseFloat(filtered) * 100).toString()
    setInputCoverage(filtered)
    setFeedbackCoverage(multiplied)
  }

  const handleCoverageChange = (coverageLimit: string) => {
    setInputCoverage((parseInt(coverageLimit) / 100).toString())
    setFeedbackCoverage(coverageLimit)
  }

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    cpFarmContract.current = cpFarm
    lpFarmContract.current = lpFarm
  }, [cpFarm, lpFarm])

  useEffect(() => {
    try {
      const fetchLatestBlockNumber = async () => {
        const { latestBlockNumber } = await fetchEtherscanLatestBlockNumber(Number(CHAIN_ID))
        setLatestBlock(latestBlockNumber)
      }
      fetchLatestBlockNumber()
    } catch (e) {
      console.log(e)
    }
  }, [policies])

  useEffect(() => {
    if (!wallet.isActive || !wallet.account) {
      return
    }

    try {
      const fetchPoliciesAndClaims = async () => {
        if (!wallet.account) return
        setLoading(true)
        // PACLAS: const policies = await getUserPolicies(wallet.account as string, Number(CHAIN_ID))
        const policies = await getPolicies(wallet.account)
        const claimDetails = await getClaimDetails(wallet.account)
        const cooldown = await getCooldownPeriod()
        setCooldownPeriod(cooldown)
        setClaimDetails(claimDetails)
        setPolicies(policies)
        setLoading(false)
      }
      fetchPoliciesAndClaims()
    } catch (err) {
      console.log(err)
    }
  }, [wallet.account, wallet.isActive, wallet.version])

  useEffect(() => {
    const checkClaims = async () => {
      if (!wallet.account) return
      const claimDetails = await getClaimDetails(wallet.account)
      setClaimDetails(claimDetails)
    }
    checkClaims()
  }, [wallet.dataVersion])

  /*************************************************************************************

    JSX Elements

  *************************************************************************************/

  const PolicyInfo = () => {
    return (
      <Fragment>
        <Box transparent pl={10} pr={10} pt={20} pb={20}>
          <BoxItem>
            <BoxItemTitle h3>Policy ID</BoxItemTitle>
            <BoxItemValue h2 nowrap>
              {selectedPolicy?.policyId}
            </BoxItemValue>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3>Days to expiration</BoxItemTitle>
            <BoxItemValue h2 nowrap>
              {getDays(selectedPolicy ? selectedPolicy.expirationBlock : '0')}
            </BoxItemValue>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3>Cover Amount</BoxItemTitle>
            <BoxItemValue h2 nowrap>
              {selectedPolicy?.coverAmount ? truncateBalance(formatEther(selectedPolicy.coverAmount)) : 0} ETH
            </BoxItemValue>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3>Position Amount</BoxItemTitle>
            <BoxItemValue h2 nowrap>
              {positionAmount && !asyncLoading ? (
                `${truncateBalance(positionAmount || '0')} ETH`
              ) : (
                <Loader width={10} height={10} />
              )}
            </BoxItemValue>
          </BoxItem>
        </Box>
        <HeroContainer height={150}>
          <BoxChooseRow>
            <BoxChooseCol>
              <Protocol style={{ alignItems: 'center', flexDirection: 'column' }}>
                <ProtocolImage width={70} height={70} mb={10}>
                  <img src={`https://assets.solace.fi/${selectedPolicy?.productName.toLowerCase()}.svg`} />
                </ProtocolImage>
                <ProtocolTitle t2>{selectedPolicy?.productName}</ProtocolTitle>
              </Protocol>
            </BoxChooseCol>
            <BoxChooseCol>
              <Protocol style={{ alignItems: 'center', flexDirection: 'column' }}>
                <ProtocolImage width={70} height={70} mb={10}>
                  <img src={`https://assets.solace.fi/${selectedPolicy?.positionName.toLowerCase()}.svg`} />
                </ProtocolImage>
                <ProtocolTitle t2>{selectedPolicy?.positionName}</ProtocolTitle>
              </Protocol>
            </BoxChooseCol>
          </BoxChooseRow>
        </HeroContainer>
        <hr style={{ marginBottom: '20px' }} />
      </Fragment>
    )
  }

  const MyPolicies = () => {
    return (
      <Content>
        <Heading1>Your Policies</Heading1>
        {loading && !showManageModal && !showStatusModal ? (
          <Loader />
        ) : policies.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>{'Id'}</TableHeader>
                <TableHeader>{'Status'}</TableHeader>
                <TableHeader>{'Product'}</TableHeader>
                <TableHeader>{'Position'}</TableHeader>
                <TableHeader>{'Expiration Date'}</TableHeader>
                <TableHeader>{'Covered Amount'}</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>{renderPolicies()}</TableBody>
          </Table>
        ) : (
          <Heading2 textAlignCenter>You do not own any policies.</Heading2>
        )}
      </Content>
    )
  }

  const renderPolicies = () => {
    return policies.map((policy) => {
      return (
        <TableRow key={policy.policyId}>
          <TableData>{policy.policyId}</TableData>
          <TableData>{policy.status}</TableData>
          <TableData>{policy.productName}</TableData>
          <TableData>{policy.positionName}</TableData>
          <TableData>{calculatePolicyExpirationDate(policy.expirationBlock)}</TableData>
          <TableData>
            {policy.coverAmount ? truncateBalance(parseFloat(formatEther(policy.coverAmount)), 2) : 0} {Unit.ETH}
          </TableData>

          <TableData textAlignRight>
            {policy.status === PolicyStatus.ACTIVE && (
              <TableDataGroup>
                <Button onClick={() => openStatusModal(policy)}>Claim</Button>
                <Button onClick={() => openManageModal(getDays(policy.expirationBlock), policy)}>Manage</Button>
              </TableDataGroup>
            )}
          </TableData>
        </TableRow>
      )
    })
  }

  const MyClaims = () => {
    return (
      <Fragment>
        {claimDetails && claimDetails.length > 0 && !loading && !showManageModal && !showStatusModal && (
          <Content>
            <Heading1>Your Claims</Heading1>
            <CardContainer cardsPerRow={2}>{renderClaims()}</CardContainer>
          </Content>
        )}
      </Fragment>
    )
  }

  const renderClaims = () => {
    return claimDetails.map((claim) => {
      return (
        <ClaimCard key={claim.id}>
          <Box pt={20} pb={20} green={claim.canWithdraw}>
            <BoxItem>
              <BoxItemTitle h3>Amount</BoxItemTitle>
              <BoxItemValue h2>{formatEther(claim.amount)} ETH</BoxItemValue>
            </BoxItem>
            <BoxItem>
              <BoxItemTitle h3>Payout Status</BoxItemTitle>
              <BoxItemValue h2>
                {claim.canWithdraw
                  ? 'Withdrawal Ready'
                  : `${claim.cooldown == '-' ? claim.cooldown : timer(parseInt(claim.cooldown) * 1000)} left`}
              </BoxItemValue>
            </BoxItem>
          </Box>
          <ButtonWrapper>
            <Button widthP={100} onClick={() => withdrawPayout(claim.id)} disabled={!claim.canWithdraw}>
              Withdraw Payout
            </Button>
          </ButtonWrapper>
        </ClaimCard>
      )
    })
  }

  const MyInvestments = () => {
    return (
      <Content>
        <Heading1>Your Investments</Heading1>
        <CardContainer>
          <InvestmentCard>
            <CardHeader>
              <CardTitle h2>Capital Pool</CardTitle>
              <Heading3>
                {wallet.account ? truncateBalance(parseFloat(cpUserStakeValue), 2) : 0} {Unit.ETH}
              </Heading3>
            </CardHeader>
            <CardBlock>
              <CardTitle t2>Daily Earnings</CardTitle>
              <CardTitle t3>
                {wallet.account ? truncateBalance(parseFloat(cpUserRewardsPerDay), 2) : 0} {Unit.SOLACE}
              </CardTitle>
            </CardBlock>
            <CardBlock>
              <CardTitle t2>Total Earnings</CardTitle>
              <CardTitle t3>
                {wallet.account ? truncateBalance(parseFloat(cpUserRewards), 2) : 0} {Unit.SOLACE}
              </CardTitle>
            </CardBlock>
          </InvestmentCard>
          <InvestmentCard>
            <CardHeader>
              <CardTitle h2>Liquidity Pool</CardTitle>
              <Heading3>
                {wallet.account ? truncateBalance(parseFloat(lpUserStakeValue), 2) : 0} {Unit.SOLACE}
              </Heading3>
            </CardHeader>
            <CardBlock>
              <CardTitle t2>Daily Earnings</CardTitle>
              <CardTitle t3>
                {wallet.account ? truncateBalance(parseFloat(lpUserRewardsPerDay), 2) : 0} {Unit.SOLACE}
              </CardTitle>
            </CardBlock>
            <CardBlock>
              <CardTitle t2>Total Earnings</CardTitle>
              <CardTitle t3>
                {wallet.account ? truncateBalance(parseFloat(lpUserRewards), 2) : 0} {Unit.SOLACE}
              </CardTitle>
            </CardBlock>
          </InvestmentCard>
        </CardContainer>
      </Content>
    )
  }

  const ManageModalContent = () => {
    return (
      <Fragment>
        <ModalHeader>
          <Heading2>Policy Management</Heading2>
          <ModalCloseButton hidden={modalLoading} onClick={() => closeModal()} />
        </ModalHeader>
        <hr style={{ marginBottom: '20px' }} />
        <ModalContent>
          <PolicyInfo />
          {!modalLoading ? (
            <Fragment>
              <BoxChooseRow>
                <Text1>Update Policy</Text1>
              </BoxChooseRow>
              <UpdatePolicySec>
                <BoxChooseRow mb={5}>
                  <BoxChooseCol>
                    <BoxChooseText>Edit coverage (1 - 100%)</BoxChooseText>
                  </BoxChooseCol>
                  <BoxChooseCol>
                    <Slider
                      disabled={asyncLoading}
                      width={150}
                      backgroundColor={'#fff'}
                      value={feedbackCoverage}
                      onChange={(e) => handleCoverageChange(e.target.value)}
                      min={100}
                      max={10000}
                    />
                  </BoxChooseCol>
                  <BoxChooseCol>
                    <Input
                      disabled={asyncLoading}
                      type="text"
                      width={50}
                      value={inputCoverage}
                      onChange={(e) => handleInputCoverage(e.target.value)}
                    />
                  </BoxChooseCol>
                </BoxChooseRow>
                <BoxChooseCol></BoxChooseCol>
                <BoxChooseRow mb={5}>
                  <BoxChooseCol>
                    <BoxChooseText>
                      Add days (0 - {DAYS_PER_YEAR - getDays(selectedPolicy ? selectedPolicy.expirationBlock : '0')}{' '}
                      days)
                    </BoxChooseText>
                  </BoxChooseCol>
                  <BoxChooseCol>
                    <Slider
                      disabled={asyncLoading}
                      width={150}
                      backgroundColor={'#fff'}
                      value={extendedTime == '' ? '0' : extendedTime}
                      onChange={(e) => setExtendedTime(e.target.value)}
                      min="0"
                      max={DAYS_PER_YEAR - getDays(selectedPolicy ? selectedPolicy.expirationBlock : '0')}
                    />
                  </BoxChooseCol>
                  <BoxChooseCol>
                    <Input
                      disabled={asyncLoading}
                      type="text"
                      pattern="[0-9]+"
                      width={50}
                      value={extendedTime}
                      onChange={(e) => filteredTime(e.target.value)}
                      maxLength={3}
                    />
                  </BoxChooseCol>
                </BoxChooseRow>
                <BoxChooseCol></BoxChooseCol>
                <BoxChooseRow mb={5}>
                  <BoxChooseDate>
                    Current expiration{' '}
                    <Input
                      readOnly
                      type="date"
                      value={`${new Date(
                        date.setDate(date.getDate() + getDays(selectedPolicy ? selectedPolicy.expirationBlock : '0'))
                      )
                        .toISOString()
                        .substr(0, 10)}`}
                    />{' '}
                    New expiration{' '}
                    <Input
                      readOnly
                      type="date"
                      value={`${new Date(date.setDate(date.getDate() + parseFloat(extendedTime || '0')))
                        .toISOString()
                        .substr(0, 10)}`}
                    />
                  </BoxChooseDate>
                </BoxChooseRow>
                <BoxChooseRow mb={5} style={{ justifyContent: 'flex-end' }}>
                  {!asyncLoading ? (
                    <Button onClick={() => extendPolicy()}>Update Policy</Button>
                  ) : (
                    <Loader width={10} height={10} />
                  )}
                </BoxChooseRow>
              </UpdatePolicySec>
              <BoxChooseRow>
                <Text1>Cancel Policy</Text1>
              </BoxChooseRow>
              <CancelPolicySec>
                <BoxChooseRow mb={10}>
                  <BoxChooseCol>
                    <BoxChooseText error={policyPrice !== '' && refundAmount.lte(parseEther(cancelFee))}>
                      Refund amount: {formattedRefundAmount} ETH
                    </BoxChooseText>
                  </BoxChooseCol>
                </BoxChooseRow>
                <BoxChooseCol></BoxChooseCol>
                <BoxChooseRow mb={10}>
                  <BoxChooseCol>
                    <BoxChooseText>Cancellation fee: {cancelFee} ETH</BoxChooseText>
                    {policyPrice !== '' && refundAmount.lte(parseEther(cancelFee)) && (
                      <BoxChooseText error>Refund amount must offset cancellation fee</BoxChooseText>
                    )}
                  </BoxChooseCol>
                </BoxChooseRow>
                <BoxChooseRow mb={10} style={{ justifyContent: 'flex-end' }}>
                  {policyPrice !== '' ? (
                    <Button disabled={refundAmount.lte(parseEther(cancelFee))} onClick={() => cancelPolicy()}>
                      Cancel Policy
                    </Button>
                  ) : (
                    <Loader width={10} height={10} />
                  )}
                </BoxChooseRow>
              </CancelPolicySec>
            </Fragment>
          ) : (
            <Loader />
          )}
        </ModalContent>
      </Fragment>
    )
  }

  const StatusModalContent = () => {
    return (
      <Fragment>
        <ModalHeader>
          <Heading2>Policy Claim</Heading2>
          <ModalCloseButton hidden={modalLoading} onClick={() => closeModal()} />
        </ModalHeader>
        <hr style={{ marginBottom: '20px' }} />
        <ModalContent>
          <PolicyInfo />
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
      </Fragment>
    )
  }

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Fragment>
      {!wallet.account ? (
        <HeroContainer>
          <Heading1>Please connect wallet to view dashboard</Heading1>
        </HeroContainer>
      ) : (
        <Fragment>
          <Modal isOpen={showManageModal}>
            <ManageModalContent />
          </Modal>
          <Modal isOpen={showStatusModal}>
            <StatusModalContent />
          </Modal>
          <MyPolicies />
          <MyClaims />
          <MyInvestments />
        </Fragment>
      )}
    </Fragment>
  )
}

export default Dashboard
