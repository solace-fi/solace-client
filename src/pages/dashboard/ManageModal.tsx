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
import React, { Fragment, useState, useEffect, useMemo, useCallback } from 'react'

/* import packages */
import styled from 'styled-components'
import { Slider } from '@rebass/forms'
import { parseEther, formatEther } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import managers */
import { useCachedData } from '../../context/CachedDataManager'
import { useToasts } from '../../context/NotificationsManager'
import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'

/* import components */
import { Modal } from '../../components/Modal/Modal'
import { FormRow, FormCol } from '../../components/Form'
import { Text1, Text3 } from '../../components/Typography'
import { PolicyInfo } from './PolicyInfo'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { Loader } from '../../components/Loader/Loader'

/* import constants */
import { DAYS_PER_YEAR, NUM_BLOCKS_PER_DAY, GAS_LIMIT, ZERO } from '../../constants'
import { FunctionName, TransactionCondition, Unit } from '../../constants/enums'
import { Policy } from '../../constants/types'

/* import hooks */
import { useAppraisePosition, useGetCancelFee, useGetPolicyPrice, useGetQuote } from '../../hooks/usePolicy'

/* import utils */
import { getGasValue } from '../../utils/formatting'
import { getDays, getExpiration } from '../../utils/time'

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

  /*************************************************************************************

    custom hooks

  *************************************************************************************/

  const { selectedProtocol } = useContracts()
  const wallet = useWallet()
  const { addLocalTransactions, reload, gasPrices } = useCachedData()
  const { makeTxToast } = useToasts()
  const policyPrice = useGetPolicyPrice(selectedPolicy ? selectedPolicy.policyId : 0)
  const cancelFee = useGetCancelFee()

  const daysLeft = useMemo(
    () => getDays(parseFloat(selectedPolicy ? selectedPolicy.expirationBlock : '0'), latestBlock),
    [latestBlock, selectedPolicy]
  )
  const blocksLeft = useMemo(
    () => BigNumber.from(parseFloat(selectedPolicy ? selectedPolicy.expirationBlock : '0') - latestBlock),
    [latestBlock, selectedPolicy]
  )
  const coverAmount = useMemo(() => BigNumber.from(selectedPolicy ? selectedPolicy.coverAmount : '0'), [selectedPolicy])
  const price = useMemo(() => BigNumber.from(policyPrice || '0'), [policyPrice])
  const refundAmount = useMemo(
    () =>
      blocksLeft
        .mul(coverAmount)
        .mul(price)
        .div(String(Math.pow(10, 12))),
    [blocksLeft, coverAmount, price]
  )
  const appraisal = useAppraisePosition(selectedPolicy)
  const coverLimit = useMemo(
    () => (appraisal == ZERO ? ZERO.toString() : BigNumber.from(coverAmount).mul('10000').div(appraisal).toString()),
    [appraisal, coverAmount]
  )
  const quote = useGetQuote(
    selectedPolicy ? coverLimit : null,
    selectedPolicy ? selectedPolicy.positionContract : null,
    extendedTime
  )

  /*************************************************************************************

    Contract functions

  *************************************************************************************/

  const extendPolicy = async () => {
    setModalLoading(true)
    if (!selectedProtocol || !selectedPolicy) return
    const txType = FunctionName.EXTEND_POLICY
    const extension = BigNumber.from(NUM_BLOCKS_PER_DAY * parseInt(extendedTime))
    try {
      const tx = await selectedProtocol.extendPolicy(selectedPolicy.policyId, extension, {
        value: coverAmount
          .mul(price)
          .mul(extension)
          .div(String(Math.pow(10, 12)))
          .add(parseEther(quote).div('10000')),
        gasPrice: getGasValue(gasPrices.selected.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: '0', status: TransactionCondition.PENDING, unit: Unit.ID }
      setModalLoading(false)
      closeModal()
      addLocalTransactions(localTx)
      reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        reload()
      })
    } catch (err) {
      console.log('extendPolicy:', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  const cancelPolicy = async () => {
    setModalLoading(true)
    if (!selectedProtocol || !selectedPolicy) return
    const txType = FunctionName.CANCEL_POLICY
    try {
      const tx = await selectedProtocol.cancelPolicy(selectedPolicy.policyId, {
        gasPrice: getGasValue(gasPrices.selected.value),
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
      closeModal()
      addLocalTransactions(localTx)
      reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        reload()
      })
    } catch (err) {
      console.log('cancelPolicy:', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  /*************************************************************************************

    Local functions

  *************************************************************************************/

  const initCoverage = () => {
    setFeedbackCoverage(coverLimit)
    setInputCoverage(
      coverLimit.substring(0, coverLimit.length - 2) +
        '.' +
        coverLimit.substring(coverLimit.length - 2, coverLimit.length)
    )
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

  const handleClose = useCallback(() => {
    setExtendedTime('0')
    closeModal()
  }, [closeModal])

  /*************************************************************************************

    useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    const load = async () => {
      if (!selectedPolicy || !isOpen) return
      setAsyncLoading(true)
      if (BigNumber.from(coverLimit).lte(ZERO)) return
      initCoverage()
      setAsyncLoading(false)
    }
    load()
  }, [isOpen, selectedPolicy, appraisal])

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={'Policy Management'} disableCloseButton={modalLoading}>
      <Fragment>
        <PolicyInfo selectedPolicy={selectedPolicy} latestBlock={latestBlock} />
        {!modalLoading ? (
          <Fragment>
            <FormRow>
              <Text1>Update Policy</Text1>
            </FormRow>
            <UpdatePolicySec>
              <FormRow mb={5}>
                <FormCol>
                  <Text3>Edit coverage (1 - 100%)</Text3>
                </FormCol>
                <FormCol>
                  <Slider
                    disabled={asyncLoading}
                    width={150}
                    backgroundColor={'#fff'}
                    value={feedbackCoverage}
                    onChange={(e) => handleCoverageChange(e.target.value)}
                    min={100}
                    max={10000}
                  />
                </FormCol>
                <FormCol>
                  <Input
                    disabled={asyncLoading}
                    type="text"
                    width={50}
                    value={inputCoverage}
                    onChange={(e) => handleInputCoverage(e.target.value)}
                  />
                </FormCol>
              </FormRow>
              <FormCol></FormCol>
              <FormRow mb={5}>
                <FormCol>
                  <Text3>Add days (0 - {DAYS_PER_YEAR - daysLeft} days)</Text3>
                </FormCol>
                <FormCol>
                  <Slider
                    disabled={asyncLoading}
                    width={150}
                    backgroundColor={'#fff'}
                    value={extendedTime == '' ? '0' : extendedTime}
                    onChange={(e) => setExtendedTime(e.target.value)}
                    min="0"
                    max={DAYS_PER_YEAR - daysLeft}
                  />
                </FormCol>
                <FormCol>
                  <Input
                    disabled={asyncLoading}
                    type="text"
                    pattern="[0-9]+"
                    width={50}
                    value={extendedTime}
                    onChange={(e) => filteredTime(e.target.value)}
                    maxLength={3}
                  />
                </FormCol>
              </FormRow>
              <FormCol></FormCol>
              <FormRow mb={5} style={{ justifyContent: 'flex-start' }}>
                <FormCol>
                  <Text3 nowrap>Expiration: {getExpiration(daysLeft)}</Text3>
                </FormCol>
                <FormCol>
                  <Text3 nowrap>New expiration: {getExpiration(daysLeft + parseFloat(extendedTime || '0'))}</Text3>
                </FormCol>
              </FormRow>
              <FormRow mb={5} style={{ justifyContent: 'flex-end' }}>
                {!asyncLoading ? (
                  <Button disabled={wallet.errors.length > 0} onClick={() => extendPolicy()}>
                    Update Policy
                  </Button>
                ) : (
                  <Loader width={10} height={10} />
                )}
              </FormRow>
            </UpdatePolicySec>
            <FormRow>
              <Text1>Cancel Policy</Text1>
            </FormRow>
            <CancelPolicySec>
              <FormRow mb={10}>
                <FormCol>
                  <Text3 error={policyPrice !== '' && refundAmount.lte(parseEther(cancelFee))}>
                    Refund amount: {formatEther(refundAmount)} ETH
                  </Text3>
                </FormCol>
              </FormRow>
              <FormCol></FormCol>
              <FormRow mb={10}>
                <FormCol>
                  <Text3>Cancellation fee: {cancelFee} ETH</Text3>
                  {policyPrice !== '' && refundAmount.lte(parseEther(cancelFee)) && (
                    <Text3 error>Refund amount must offset cancellation fee</Text3>
                  )}
                </FormCol>
              </FormRow>
              <FormRow mb={10} style={{ justifyContent: 'flex-end' }}>
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
              </FormRow>
            </CancelPolicySec>
          </Fragment>
        ) : (
          <Loader />
        )}
      </Fragment>
    </Modal>
  )
}
