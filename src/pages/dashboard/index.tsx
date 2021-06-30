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
import { CHAIN_ID, DAYS_PER_YEAR, NUM_BLOCKS_PER_DAY } from '../../constants'
import { TransactionCondition, FunctionName } from '../../constants/enums'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'
import { useUserData } from '../../context/UserDataManager'
import { useToasts } from '../../context/NotificationsManager'

/* import components */
import { Content, HeroContainer } from '../../components/Layout'
import { CardContainer, InvestmentCardComponent, CardHeader, CardTitle, CardBlock } from '../../components/Card'
import { Heading1, Heading2, Heading3, Text1, Text2 } from '../../components/Text'
import { Button } from '../../components/Button'
import { Table, TableHead, TableHeader, TableRow, TableBody, TableData, TableDataGroup } from '../../components/Table'
import { Modal, ModalHeader, ModalContent, ModalCloseButton } from '../../components/Modal'
import { Input } from '../../components/Input'
import { BoxChooseDate, BoxChooseCol, BoxChooseRow, BoxChooseText } from '../../components/Box/BoxChoose'
import { Loader } from '../../components/Loader'

/* import hooks */
import { useUserStakedValue } from '../../hooks/useUserStakedValue'
import { useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'
import { useGetCancelFee, useGetQuote, useGetPolicyPrice } from '../../hooks/usePolicy'

/* import utils */
import { getGasValue, truncateBalance } from '../../utils/formatting'
import { Policy, getAllPoliciesOfUser } from '../../utils/policyGetter'
import { fetchEtherscanLatestBlock } from '../../utils/etherscan'
import { getPositions } from '../../utils/positionGetter'

/*************************************************************************************

styled components

*************************************************************************************/

const UpdatePolicySec = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  justify-content: space-between;
`

const CancelPolicySec = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
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
  const [latestBlock, setLatestBlock] = useState<number>(0)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [positionsloading, setPositionsLoading] = useState<boolean>(false)
  const [extendedTime, setExtendedTime] = useState<string>('1')
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | undefined>(undefined)
  const [coverLimit, setCoverLimit] = useState<string | null>(null)
  const [inputCoverage, setInputCoverage] = useState<string>('1')
  const [feedbackCoverage, setFeedbackCoverage] = useState<string>('1')

  /*************************************************************************************

    Hook variables

  *************************************************************************************/

  const [cpUserRewards] = useUserPendingRewards(cpFarmContract.current)
  const [cpUserRewardsPerDay] = useUserRewardsPerDay(1, cpFarmContract.current)
  const [lpUserRewards] = useUserPendingRewards(lpFarmContract.current)
  const [lpUserRewardsPerDay] = useUserRewardsPerDay(2, lpFarmContract.current)
  const cpUserStakeValue = useUserStakedValue(cpFarmContract.current)
  const lpUserStakeValue = useUserStakedValue(lpFarmContract.current)
  const { cpFarm, lpFarm, selectedProtocol, setSelectedProtocolByName } = useContracts()
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

  /*************************************************************************************

  variables

  *************************************************************************************/

  const date = new Date()
  const blocksLeft = BigNumber.from(parseFloat(selectedPolicy ? selectedPolicy.expirationBlock : '0') - latestBlock)
  const coverAmount = BigNumber.from(selectedPolicy ? selectedPolicy.coverAmount : '0')
  const price = BigNumber.from(policyPrice)
  const refundAmount = blocksLeft
    .mul(coverAmount)
    .mul(price)
    .div(String(Math.pow(10, 12)))
  const formattedRefundAmount = formatEther(refundAmount)

  /*************************************************************************************

  Contract functions

  *************************************************************************************/

  const extendPolicy = async () => {
    setLoading(true)
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
        gasLimit: 450000,
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
      setLoading(false)
      wallet.reload()
    }
  }

  const cancelPolicy = async () => {
    setLoading(true)
    if (!selectedProtocol || !selectedPolicy) return
    const txType = FunctionName.CANCEL_POLICY
    try {
      const tx = await selectedProtocol.cancelPolicy(selectedPolicy.policyId)
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
      setLoading(false)
      wallet.reload()
    }
  }

  /*************************************************************************************

  Local helper functions

  *************************************************************************************/

  const getCoverLimit = (policy: Policy | undefined, balances: any) => {
    if (balances == undefined || policy == undefined) return null
    const coverAmount = policy.coverAmount
    const positionAmount = balances.filter((balance: any) => policy.positionName == balance.underlying.symbol)[0].eth
      .balance
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

          <TableData cellAlignRight>
            {policy.status === PolicyStatus.ACTIVE && (
              <TableDataGroup>
                <Button>Claim</Button>
                <Button onClick={() => openModal(getDays(policy.expirationBlock), policy)}>Manage</Button>
              </TableDataGroup>
            )}
          </TableData>
        </TableRow>
      )
    })
  }

  const openModal = async (days: number, policy: Policy) => {
    setShowModal((prev) => !prev)
    setSelectedProtocolByName(policy.productName.toLowerCase())
    document.body.style.overflowY = 'hidden'
    setSelectedPolicy(policy)
    setPositionsLoading(true)
    const balances = await getPositions(policy.productName.toLowerCase(), wallet.chainId ?? 1, wallet.account ?? '0x')
    getCoverLimit(policy, balances)
    setPositionsLoading(false)
  }

  const closeModal = () => {
    setShowModal(false)
    document.body.style.overflowY = 'scroll'
    setLoading(false)
    setExtendedTime('1')
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
      const fetchLatestBlock = async () => {
        const { latestBlockNumber } = await fetchEtherscanLatestBlock(Number(CHAIN_ID))
        setLatestBlock(latestBlockNumber)
      }
      fetchLatestBlock()
    } catch (e) {
      console.log(e)
    }
  }, [policies])

  useEffect(() => {
    if (!wallet.isActive || !wallet.account) {
      return
    }

    try {
      const fetchPolicies = async () => {
        setLoading(true)
        const policies = await getAllPoliciesOfUser(wallet.account as string, Number(CHAIN_ID))
        setPolicies(policies)
        setLoading(false)
      }
      fetchPolicies()
    } catch (err) {
      console.log(err)
    }
  }, [wallet.account, wallet.isActive, wallet.version])

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
          <Modal isOpen={showModal}>
            <ModalHeader>
              <Heading2>
                Policy Management: {selectedPolicy?.productName} - {selectedPolicy?.positionName}
              </Heading2>
              <ModalCloseButton hidden={loading} onClick={() => closeModal()} />
            </ModalHeader>
            <ModalContent>
              <BoxChooseRow>
                <BoxChooseCol>
                  <Text2>Id: {selectedPolicy?.policyId}</Text2>
                </BoxChooseCol>
                <BoxChooseCol>
                  <Text2>Days left: {getDays(selectedPolicy ? selectedPolicy.expirationBlock : '0')}</Text2>
                </BoxChooseCol>
              </BoxChooseRow>
              <BoxChooseRow>
                <BoxChooseCol></BoxChooseCol>
                <BoxChooseCol>
                  <Text2>
                    Cover Amount: {selectedPolicy?.coverAmount ? formatEther(selectedPolicy.coverAmount) : 0} ETH
                  </Text2>
                </BoxChooseCol>
              </BoxChooseRow>
              <BoxChooseRow>
                <BoxChooseCol></BoxChooseCol>
                <BoxChooseCol>
                  <Text2>
                    {coverLimit && !positionsloading ? (
                      `Coverage: ${
                        coverLimit.substring(0, coverLimit.length - 2) +
                        '.' +
                        coverLimit.substring(coverLimit.length - 2, coverLimit.length)
                      }%`
                    ) : (
                      <Loader width={10} height={10} />
                    )}
                  </Text2>
                </BoxChooseCol>
              </BoxChooseRow>
              <hr style={{ marginBottom: '20px' }} />
              {!loading ? (
                <Fragment>
                  <UpdatePolicySec>
                    <BoxChooseRow>
                      <Text1>Update Policy</Text1>
                    </BoxChooseRow>
                    <BoxChooseCol></BoxChooseCol>
                    <BoxChooseRow>
                      <BoxChooseCol>
                        <BoxChooseText>Edit coverage (1 - 100%)</BoxChooseText>
                      </BoxChooseCol>
                      <BoxChooseCol>
                        <Slider
                          disabled={positionsloading}
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
                          disabled={positionsloading}
                          type="text"
                          width={50}
                          value={inputCoverage}
                          onChange={(e) => handleInputCoverage(e.target.value)}
                        />
                      </BoxChooseCol>
                    </BoxChooseRow>
                    <BoxChooseCol></BoxChooseCol>
                    <BoxChooseRow>
                      <BoxChooseCol>
                        <BoxChooseText>
                          Add days (1 - {DAYS_PER_YEAR - getDays(selectedPolicy ? selectedPolicy.expirationBlock : '0')}{' '}
                          days)
                        </BoxChooseText>
                      </BoxChooseCol>
                      <BoxChooseCol>
                        <Slider
                          disabled={positionsloading}
                          width={150}
                          backgroundColor={'#fff'}
                          value={extendedTime == '' ? '1' : extendedTime}
                          onChange={(e) => setExtendedTime(e.target.value)}
                          min="1"
                          max={DAYS_PER_YEAR - getDays(selectedPolicy ? selectedPolicy.expirationBlock : '0')}
                        />
                      </BoxChooseCol>
                      <BoxChooseCol>
                        <Input
                          disabled={positionsloading}
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
                    <BoxChooseRow>
                      <BoxChooseDate>
                        Current expiration{' '}
                        <Input
                          readOnly
                          type="date"
                          value={`${new Date(
                            date.setDate(
                              date.getDate() + getDays(selectedPolicy ? selectedPolicy.expirationBlock : '0')
                            )
                          )
                            .toISOString()
                            .substr(0, 10)}`}
                        />{' '}
                        New expiration{' '}
                        <Input
                          readOnly
                          type="date"
                          value={`${new Date(date.setDate(date.getDate() + parseFloat(extendedTime || '1')))
                            .toISOString()
                            .substr(0, 10)}`}
                        />
                      </BoxChooseDate>
                    </BoxChooseRow>
                    <BoxChooseRow style={{ justifyContent: 'flex-end' }}>
                      {!positionsloading ? (
                        <Button onClick={() => extendPolicy()}>Update Policy</Button>
                      ) : (
                        <Loader width={10} height={10} />
                      )}
                    </BoxChooseRow>
                  </UpdatePolicySec>
                  <CancelPolicySec>
                    <BoxChooseRow>
                      <Text1>Cancel Policy</Text1>
                    </BoxChooseRow>
                    <BoxChooseCol></BoxChooseCol>
                    <BoxChooseRow>
                      <BoxChooseCol>
                        <BoxChooseText warning={policyPrice !== '0' && refundAmount.lte(parseEther(cancelFee))}>
                          Refund amount: {formattedRefundAmount} ETH
                        </BoxChooseText>
                      </BoxChooseCol>
                    </BoxChooseRow>
                    <BoxChooseCol></BoxChooseCol>
                    <BoxChooseRow>
                      <BoxChooseCol>
                        <BoxChooseText>Cancellation fee: {cancelFee} ETH</BoxChooseText>
                        {policyPrice !== '0' && refundAmount.lte(parseEther(cancelFee)) && (
                          <BoxChooseText warning>Refund amount must offset cancellation fee</BoxChooseText>
                        )}
                      </BoxChooseCol>
                    </BoxChooseRow>
                    <BoxChooseRow style={{ justifyContent: 'flex-end' }}>
                      {policyPrice !== '0' ? (
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
          </Modal>
          <Content>
            <Heading1>Your Policies</Heading1>
            {loading ? (
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
                    <TableHeader>{'Amount'}</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>{renderPolicies()}</TableBody>
              </Table>
            ) : (
              <Heading2 textAlignCenter>You do not own any policies.</Heading2>
            )}
          </Content>
          <Content>
            <Heading1>Your Investments</Heading1>
            <CardContainer>
              <InvestmentCardComponent>
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
              </InvestmentCardComponent>
              <InvestmentCardComponent>
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
              </InvestmentCardComponent>
            </CardContainer>
          </Content>
        </Fragment>
      )}
    </Fragment>
  )
}

export default Dashboard
