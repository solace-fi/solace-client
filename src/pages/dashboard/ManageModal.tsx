/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import components
    import constants
    import hooks
    import utils

    ManageModal function
      useState hooks
      custom hooks
      Contract functions
      Local functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { Fragment, useState, useEffect } from 'react'

/* import packages */
import styled from 'styled-components'
import { Slider } from '@rebass/forms'
import { parseEther, formatEther } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import managers */
import { useUserData } from '../../context/UserDataManager'
import { useToasts } from '../../context/NotificationsManager'
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'

/* import components */
import { Modal } from '../../components/Modal/Modal'
import { BoxChooseRow, BoxChooseCol, BoxChooseText } from '../../components/Box/BoxChoose'
import { Text1, Text3 } from '../../components/Text'
import { PolicyInfo } from './PolicyInfo'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { Loader } from '../../components/Loader'

/* import constants */
import { DAYS_PER_YEAR, NUM_BLOCKS_PER_DAY, GAS_LIMIT } from '../../constants'
import { FunctionName, TransactionCondition, Unit } from '../../constants/enums'
import { Policy } from '../../constants/types'

/* import hooks */
import { useAppraisePosition, useGetCancelFee, useGetPolicyPrice, useGetQuote } from '../../hooks/usePolicy'

/* import utils */
import { getGasValue } from '../../utils/formatting'
import { getDays, getDateStringWithMonthName, getDateExtended } from '../../utils/time'

interface ManageModalProps {
  closeModal: () => void
  isOpen: boolean
  selectedPolicy: Policy | undefined
  latestBlock: number
}

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

export const ManageModal: React.FC<ManageModalProps> = ({ isOpen, closeModal, selectedPolicy, latestBlock }) => {
  /*************************************************************************************

    useState hooks

  *************************************************************************************/

  const [asyncLoading, setAsyncLoading] = useState<boolean>(false)
  const [inputCoverage, setInputCoverage] = useState<string>('1')
  const [feedbackCoverage, setFeedbackCoverage] = useState<string>('1')
  const [extendedTime, setExtendedTime] = useState<string>('0')
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [coverLimit, setCoverLimit] = useState<string | null>(null)

  /*************************************************************************************

    custom hooks

  *************************************************************************************/

  const { selectedProtocol, getProtocolByName } = useContracts()
  const wallet = useWallet()
  const { addLocalTransactions } = useUserData()
  const { makeTxToast } = useToasts()
  const policyPrice = useGetPolicyPrice(selectedPolicy ? selectedPolicy.policyId : 0)
  const cancelFee = useGetCancelFee()
  const quote = useGetQuote(
    selectedPolicy ? coverLimit : null,
    selectedPolicy ? selectedPolicy.positionContract : null,
    extendedTime
  )
  const { getAppraisePosition } = useAppraisePosition()

  /*************************************************************************************

    Contract functions

  *************************************************************************************/

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
      setModalLoading(false)
      close()
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
      setModalLoading(false)
      close()
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

    Local variables

  *************************************************************************************/

  const daysLeft = getDays(selectedPolicy ? parseFloat(selectedPolicy.expirationBlock) : 0, latestBlock)
  const blocksLeft = BigNumber.from(parseFloat(selectedPolicy ? selectedPolicy.expirationBlock : '0') - latestBlock)
  const coverAmount = BigNumber.from(selectedPolicy ? selectedPolicy.coverAmount : '0')
  const price = BigNumber.from(policyPrice || '0')
  const refundAmount = blocksLeft
    .mul(coverAmount)
    .mul(price)
    .div(String(Math.pow(10, 12)))

  /*************************************************************************************

    Local functions

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

  const getCurrentExpiration = (): string => {
    return getDateStringWithMonthName(getDateExtended(daysLeft))
  }

  const getNewExpiration = (): string => {
    return getDateStringWithMonthName(getDateExtended(parseFloat(extendedTime || '0')))
  }

  const handleCoverageChange = (coverageLimit: string) => {
    setInputCoverage((parseInt(coverageLimit) / 100).toString())
    setFeedbackCoverage(coverageLimit)
  }

  const handleInputCoverage = (input: string) => {
    const filtered = input.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')

    if (parseFloat(filtered) > 100) {
      return
    }
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 2) {
      return
    }
    const multiplied = filtered == '' ? '100' : Math.round(parseFloat(filtered) * 100).toString()
    setInputCoverage(filtered)
    setFeedbackCoverage(multiplied)
  }

  const filteredTime = (input: string) => {
    const filtered = input.replace(/[^0-9]*/g, '')
    if (
      parseFloat(filtered) <=
        DAYS_PER_YEAR - getDays(selectedPolicy ? parseFloat(selectedPolicy.expirationBlock) : 0, latestBlock) ||
      filtered == ''
    ) {
      setExtendedTime(filtered)
    }
  }

  const handleClose = () => {
    setExtendedTime('0')
    closeModal()
  }

  /*************************************************************************************

    useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    const load = async () => {
      if (!selectedPolicy || !wallet.chainId || !wallet.account || !isOpen) return
      setAsyncLoading(true)
      const positionAmount = await getAppraisePosition(
        getProtocolByName(selectedPolicy.productName),
        selectedPolicy.positionContract
      )
      getCoverLimit(selectedPolicy, positionAmount)
      setAsyncLoading(false)
    }
    load()
  }, [isOpen, selectedPolicy, wallet.account, wallet.chainId])

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={'Policy Management'} modalLoading={modalLoading}>
      <Fragment>
        <PolicyInfo selectedPolicy={selectedPolicy} latestBlock={latestBlock} asyncLoading={asyncLoading} />
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
                  <BoxChooseText>Add days (0 - {DAYS_PER_YEAR - daysLeft} days)</BoxChooseText>
                </BoxChooseCol>
                <BoxChooseCol>
                  <Slider
                    disabled={asyncLoading}
                    width={150}
                    backgroundColor={'#fff'}
                    value={extendedTime == '' ? '0' : extendedTime}
                    onChange={(e) => setExtendedTime(e.target.value)}
                    min="0"
                    max={DAYS_PER_YEAR - daysLeft}
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
                {/* <BoxChooseDate> */}
                <BoxChooseCol>
                  <Text3 nowrap>Expiration: {getCurrentExpiration()}</Text3>
                </BoxChooseCol>
                <BoxChooseCol>
                  <Text3 nowrap>New expiration: {getNewExpiration()}</Text3>
                </BoxChooseCol>
                {/* </BoxChooseDate> */}
              </BoxChooseRow>
              <BoxChooseRow mb={5} style={{ justifyContent: 'flex-end' }}>
                {!asyncLoading ? (
                  <Button disabled={wallet.errors.length > 0} onClick={() => extendPolicy()}>
                    Update Policy
                  </Button>
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
                    Refund amount: {formatEther(refundAmount)} ETH
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
                  <Button
                    disabled={wallet.errors.length > 0 || refundAmount.lte(parseEther(cancelFee))}
                    onClick={() => cancelPolicy()}
                  >
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
      </Fragment>
    </Modal>
  )
}
