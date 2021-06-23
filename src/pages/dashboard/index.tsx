/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import managers
    import components
    import hooks
    import utils

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
import { Content } from '../../components/Layout'
import { CardContainer, InvestmentCardComponent, CardHeader, CardTitle, CardBlock } from '../../components/Card'
import { Heading1, Heading2, Heading3, Text1, Text2 } from '../../components/Text'
import { Button, ButtonWrapper } from '../../components/Button'
import { Table, TableHead, TableHeader, TableRow, TableBody, TableData, TableDataGroup } from '../../components/Table'
import { Modal, ModalHeader, ModalContent, ModalRow, ModalCloseButton } from '../../components/Modal'
import { Input } from '../../components/Input'
import { BoxChooseDate, BoxChooseCol, BoxChooseRow, BoxChooseText } from '../../components/Box/BoxChoose'
import { Loader } from '../../components/Loader'

/* import hooks */
import { useUserStakedValue } from '../../hooks/useUserStakedValue'
import { useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'
import { useGetCancelFee, useGetQuote, useGetPolicyPrice } from '../../hooks/usePolicy'

/* import utils */
import { fixed, getGasValue } from '../../utils/formatting'
import { Policy, getAllPoliciesOfUser } from '../../utils/policyGetter'
import { fetchEtherscanLatestBlock } from '../../utils/etherscan'

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
  const [extendedTime, setExtendedTime] = useState<string>('1')
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | undefined>(undefined)

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
    selectedPolicy ? selectedPolicy.coverAmount : null,
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
  const refundAmount = formatEther(
    blocksLeft
      .mul(coverAmount)
      .mul(price)
      .div(String(Math.pow(10, 12)))
  )

  /*************************************************************************************

  Contract functions

  *************************************************************************************/

  const extendPolicy = async () => {
    setLoading(true)
    if (!selectedProtocol) return
    const txType = FunctionName.EXTEND_POLICY
    try {
      const tx = await selectedProtocol.extendPolicy(
        selectedPolicy?.policyId,
        BigNumber.from(NUM_BLOCKS_PER_DAY * parseInt(extendedTime)),
        {
          value: parseEther(quote).add(parseEther(quote).div('10000')),
          gasPrice: getGasValue(wallet.gasPrices.selected.value),
          gasLimit: 450000,
        }
      )
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
            {policy.coverAmount ? fixed(parseFloat(formatEther(policy.coverAmount)), 2) : 0} {Unit.ETH}
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

  const openModal = (days: number, policy: Policy) => {
    setShowModal((prev) => !prev)
    setSelectedProtocolByName(policy.productName.toLowerCase())
    document.body.style.overflowY = 'hidden'
    setSelectedPolicy(policy)
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
        const policies = await getAllPoliciesOfUser(wallet.account as string, Number(CHAIN_ID))
        setPolicies(policies)
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
      <Modal isOpen={showModal}>
        <ModalHeader>
          <Heading2>Policy Management</Heading2>
          <ModalCloseButton hidden={loading} onClick={() => closeModal()} />
        </ModalHeader>
        <ModalContent>
          <BoxChooseRow>
            <BoxChooseCol>
              <Text2>
                {selectedPolicy?.productName}-{selectedPolicy?.positionName}
              </Text2>
            </BoxChooseCol>
            <BoxChooseCol>
              <Text2>Id: {selectedPolicy?.policyId}</Text2>
            </BoxChooseCol>
          </BoxChooseRow>
          <BoxChooseRow>
            <BoxChooseCol>
              <Text2>Cover Amount: </Text2>
            </BoxChooseCol>
            <BoxChooseCol>
              <Text2>{selectedPolicy?.coverAmount ? formatEther(selectedPolicy.coverAmount) : 0} ETH</Text2>
            </BoxChooseCol>
          </BoxChooseRow>
          <hr style={{ marginBottom: '20px' }} />
          {!loading ? (
            <Fragment>
              <BoxChooseRow>
                <Text1>Extend Policy</Text1>
              </BoxChooseRow>
              <BoxChooseRow>
                <BoxChooseCol>
                  <BoxChooseText>
                    New Period (1 - {DAYS_PER_YEAR - getDays(selectedPolicy ? selectedPolicy.expirationBlock : '0')}{' '}
                    days)
                  </BoxChooseText>
                </BoxChooseCol>
                <BoxChooseCol>
                  <Slider
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
                    type="text"
                    pattern="[0-9]+"
                    width={50}
                    value={extendedTime}
                    onChange={(e) => filteredTime(e.target.value)}
                    maxLength={3}
                  />
                </BoxChooseCol>
              </BoxChooseRow>
              <BoxChooseRow>
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
                    value={`${new Date(date.setDate(date.getDate() + parseFloat(extendedTime || '1')))
                      .toISOString()
                      .substr(0, 10)}`}
                  />
                </BoxChooseDate>
              </BoxChooseRow>
              <ButtonWrapper>
                <Button onClick={() => extendPolicy()}>Extend Policy Period</Button>
              </ButtonWrapper>
              <BoxChooseRow>
                <Text1>Cancel Policy</Text1>
              </BoxChooseRow>
              <BoxChooseRow>
                <BoxChooseCol>
                  <BoxChooseText warning={policyPrice !== '0' && parseEther(refundAmount).lte(parseEther(cancelFee))}>
                    Refund amount: {refundAmount} ETH
                  </BoxChooseText>
                </BoxChooseCol>
              </BoxChooseRow>
              <BoxChooseRow>
                <BoxChooseCol>
                  <BoxChooseText>Cancellation fee: {cancelFee} ETH</BoxChooseText>
                </BoxChooseCol>
              </BoxChooseRow>
              {policyPrice !== '0' && parseEther(refundAmount).lte(parseEther(cancelFee)) && (
                <BoxChooseText warning>Refund amount must offset cancellation fee</BoxChooseText>
              )}
              <ModalRow>
                <ButtonWrapper>
                  <Button disabled={parseEther(refundAmount).lte(parseEther(cancelFee))} onClick={() => cancelPolicy()}>
                    Cancel Policy
                  </Button>
                </ButtonWrapper>
              </ModalRow>
            </Fragment>
          ) : (
            <Loader />
          )}
        </ModalContent>
      </Modal>
      <Content>
        <Heading1>Your Policies</Heading1>
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
      </Content>
      <Content>
        <Heading1>Your Investments</Heading1>
        <CardContainer>
          <InvestmentCardComponent>
            <CardHeader>
              <CardTitle h2>Capital Pool</CardTitle>
              <Heading3>
                {wallet.account ? fixed(parseFloat(cpUserStakeValue), 2) : 0} {Unit.ETH}
              </Heading3>
            </CardHeader>
            <CardBlock>
              <CardTitle t2>Daily Earnings</CardTitle>
              <CardTitle t3>
                {wallet.account ? fixed(parseFloat(cpUserRewardsPerDay), 2) : 0} {Unit.SOLACE}
              </CardTitle>
            </CardBlock>
            <CardBlock>
              <CardTitle t2>Total Earnings</CardTitle>
              <CardTitle t3>
                {wallet.account ? fixed(parseFloat(cpUserRewards), 2) : 0} {Unit.SOLACE}
              </CardTitle>
            </CardBlock>
          </InvestmentCardComponent>
          <InvestmentCardComponent>
            <CardHeader>
              <CardTitle h2>Liquidity Pool</CardTitle>
              <Heading3>
                {wallet.account ? fixed(parseFloat(lpUserStakeValue), 2) : 0} {Unit.SOLACE}
              </Heading3>
            </CardHeader>
            <CardBlock>
              <CardTitle t2>Daily Earnings</CardTitle>
              <CardTitle t3>
                {wallet.account ? fixed(parseFloat(lpUserRewardsPerDay), 2) : 0} {Unit.SOLACE}
              </CardTitle>
            </CardBlock>
            <CardBlock>
              <CardTitle t2>Total Earnings</CardTitle>
              <CardTitle t3>
                {wallet.account ? fixed(parseFloat(lpUserRewards), 2) : 0} {Unit.SOLACE}
              </CardTitle>
            </CardBlock>
          </InvestmentCardComponent>
        </CardContainer>
      </Content>
    </Fragment>
  )
}

export default Dashboard
