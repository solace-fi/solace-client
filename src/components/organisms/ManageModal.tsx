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
import { useNetwork } from '../../context/NetworkManager'

/* import components */
import { Modal } from '../molecules/Modal'
import { FormRow, FormCol } from '../atoms/Form'
import { Heading2, Text1, Text3, TextSpan } from '../atoms/Typography'
import { PolicyModalInfo } from '../molecules/PolicyModalInfo'
import { Input } from '../atoms/Input'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Loader } from '../atoms/Loader'
import { FlexCol } from '../atoms/Layout'
import { SmallBox } from '../atoms/Box'

/* import constants */
import { DAYS_PER_YEAR, NUM_BLOCKS_PER_DAY, GAS_LIMIT, ZERO, MAX_MOBILE_SCREEN_WIDTH } from '../../constants'
import { FunctionName, TransactionCondition, Unit } from '../../constants/enums'
import { Policy } from '../../constants/types'

/* import hooks */
import { useAppraisePosition, useGetMaxCoverPerUser, useGetPolicyPrice, useGetQuote } from '../../hooks/usePolicy'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'

/* import utils */
import { accurateMultiply, getGasValue } from '../../utils/formatting'
import { getDaysLeft, getExpiration } from '../../utils/time'

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
  const [newCoverage, setNewCoverage] = useState<string>('1')
  const [extendedTime, setExtendedTime] = useState<string>('0')
  const [modalLoading, setModalLoading] = useState<boolean>(false)

  /*************************************************************************************

    custom hooks

  *************************************************************************************/

  const { selectedProtocol } = useContracts()
  const { errors } = useWallet()
  const { addLocalTransactions, reload, gasPrices } = useCachedData()
  const { makeTxToast } = useToasts()
  const policyPrice = useGetPolicyPrice(selectedPolicy ? selectedPolicy.policyId : 0)
  const { width } = useWindowDimensions()
  const maxCoverPerUser = useGetMaxCoverPerUser()
  const { activeNetwork } = useNetwork()

  const daysLeft = useMemo(
    () => getDaysLeft(parseFloat(selectedPolicy ? selectedPolicy.expirationBlock : '0'), latestBlock),
    [latestBlock, selectedPolicy]
  )
  const blocksLeft = useMemo(
    () => BigNumber.from(parseFloat(selectedPolicy ? selectedPolicy.expirationBlock : '0') - latestBlock),
    [latestBlock, selectedPolicy]
  )
  const currentCoverAmount = useMemo(() => (selectedPolicy ? selectedPolicy.coverAmount : '0'), [selectedPolicy])
  const price = useMemo(() => BigNumber.from(policyPrice || '0'), [policyPrice])
  const refundAmount = useMemo(
    () =>
      blocksLeft
        .mul(currentCoverAmount)
        .mul(price)
        .div(String(Math.pow(10, 12))),
    [blocksLeft, currentCoverAmount, price]
  )
  const appraisal = useAppraisePosition(selectedPolicy)

  /*************************************************************************************

    Contract functions

  *************************************************************************************/

  const updatePolicy = async () => {
    setModalLoading(true)
    if (!selectedProtocol || !selectedPolicy) return
    const txType = FunctionName.UPDATE_POLICY
    const extension = BigNumber.from(NUM_BLOCKS_PER_DAY * parseInt(extendedTime))
    try {
      const tx = await selectedProtocol.updatePolicy(selectedPolicy.policyId, newCoverage, extension, {
        value: BigNumber.from(newCoverage)
          .mul(price)
          .mul(BigNumber.from(parseFloat(selectedPolicy.expirationBlock) - latestBlock))
          .div(String(Math.pow(10, 12))),
        gasPrice: getGasValue(gasPrices.selected.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: '0',
        status: TransactionCondition.PENDING,
        unit: activeNetwork.nativeCurrency.symbol,
      }
      setModalLoading(false)
      handleClose()
      addLocalTransactions(localTx)
      reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        reload()
      })
    } catch (err) {
      console.log('updatePolicy:', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  const updateCoverAmount = async () => {
    setModalLoading(true)
    if (!selectedProtocol || !selectedPolicy) return
    const txType = FunctionName.UPDATE_POLICY_AMOUNT
    try {
      const tx = await selectedProtocol.updateCoverAmount(selectedPolicy.policyId, newCoverage, {
        value: BigNumber.from(newCoverage)
          .mul(BigNumber.from(parseFloat(selectedPolicy.expirationBlock) - latestBlock))
          .mul(price)
          .div(String(Math.pow(10, 12))),
        gasPrice: getGasValue(gasPrices.selected.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: '0',
        status: TransactionCondition.PENDING,
        unit: Unit.ID,
      }
      setModalLoading(false)
      handleClose()
      addLocalTransactions(localTx)
      reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        reload()
      })
    } catch (err) {
      console.log('updateCoverAmount:', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  const extendPolicy = async () => {
    setModalLoading(true)
    if (!selectedProtocol || !selectedPolicy) return
    const txType = FunctionName.EXTEND_POLICY_PERIOD
    const extension = BigNumber.from(NUM_BLOCKS_PER_DAY * parseInt(extendedTime))
    try {
      const tx = await selectedProtocol.extendPolicy(selectedPolicy.policyId, extension, {
        value: BigNumber.from(currentCoverAmount)
          .mul(price)
          .mul(extension)
          .div(String(Math.pow(10, 12))),
        gasPrice: getGasValue(gasPrices.selected.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: '0', status: TransactionCondition.PENDING, unit: Unit.ID }
      setModalLoading(false)
      handleClose()
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
      handleClose()
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

  const handleCoverageChange = (coverAmount: string) => {
    setNewCoverage(coverAmount) // coveramount in wei
    setInputCoverage(formatEther(BigNumber.from(coverAmount))) // coveramount in eth
  }

  const handleInputCoverage = (input: string) => {
    // allow only numbers and decimals
    const filtered = input.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')

    // if number is greater than the max cover per user, do not update
    if (parseFloat(filtered) > parseFloat(maxCoverPerUser)) return

    // if number is greater than the position amount, do not update
    if (parseFloat(filtered) > parseFloat(formatEther(appraisal))) return

    // if number is empty or less than smallest denomination of currency, do not update
    if (filtered == '' || parseFloat(filtered) < parseFloat(formatEther(BigNumber.from(1)))) return

    // if number has more than 18 decimal places, do not update
    if (filtered.includes('.') && filtered.split('.')[1]?.length > 18) return

    setNewCoverage(accurateMultiply(filtered, 18)) // set new amount in wei
    setInputCoverage(filtered) // set new amount in eth
  }

  const filteredTime = (input: string) => {
    const filtered = input.replace(/[^0-9]*/g, '')
    if (
      parseFloat(filtered) <=
        DAYS_PER_YEAR - getDaysLeft(selectedPolicy ? parseFloat(selectedPolicy.expirationBlock) : 0, latestBlock) ||
      filtered == ''
    ) {
      console.log('filtered time', filtered)
      setExtendedTime(filtered)
    }
  }

  const handleClose = useCallback(() => {
    setExtendedTime('0')
    closeModal()
  }, [closeModal])

  const handleFunc = async () => {
    if (extendedTime != '0' && extendedTime != '' && newCoverage != currentCoverAmount) {
      await updatePolicy()
      return
    }
    if (extendedTime != '0' && extendedTime != '') {
      await extendPolicy()
      return
    }
    if (newCoverage != currentCoverAmount) {
      await updateCoverAmount()
      return
    }
  }

  /*************************************************************************************

    useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    const load = async () => {
      if (!selectedPolicy || !isOpen) return
      setAsyncLoading(true)
      if (BigNumber.from(currentCoverAmount).lte(ZERO) || appraisal.lte(ZERO)) return
      handleCoverageChange(currentCoverAmount)
      setAsyncLoading(false)
    }
    load()
  }, [isOpen, selectedPolicy, currentCoverAmount, appraisal])

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={'Policy Management'} disableCloseButton={modalLoading}>
      <Fragment>
        <PolicyModalInfo selectedPolicy={selectedPolicy} latestBlock={latestBlock} />
        {!modalLoading ? (
          <Fragment>
            {width <= MAX_MOBILE_SCREEN_WIDTH ? (
              <>
                <FormRow>
                  <Text1>Update Policy</Text1>
                </FormRow>
                <UpdatePolicySec>
                  <FormRow mb={5}>
                    <FormCol>
                      <Text3>Edit coverage</Text3>
                    </FormCol>
                    <FormCol>
                      <Slider
                        disabled={asyncLoading}
                        width={150}
                        backgroundColor={'#fff'}
                        value={newCoverage}
                        onChange={(e) => handleCoverageChange(e.target.value)}
                        min={1}
                        max={appraisal.toString()}
                      />
                    </FormCol>
                    <FormCol>
                      <Input
                        disabled={asyncLoading}
                        type="text"
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
                  <SmallBox
                    transparent
                    outlined
                    error
                    collapse={!parseEther(inputCoverage).gt(parseEther(maxCoverPerUser))}
                    mb={!parseEther(inputCoverage).gt(parseEther(maxCoverPerUser)) ? 0 : 5}
                  >
                    <Text3 error autoAlign>
                      You can only cover up to {maxCoverPerUser} ETH.
                    </Text3>
                  </SmallBox>
                  <FormRow mb={5} style={{ justifyContent: 'flex-end' }}>
                    {!asyncLoading ? (
                      <Button
                        disabled={errors.length > 0 || parseEther(inputCoverage).gt(parseEther(maxCoverPerUser))}
                        onClick={handleFunc}
                      >
                        Update Policy
                      </Button>
                    ) : (
                      <Loader width={10} height={10} />
                    )}
                  </FormRow>
                </UpdatePolicySec>
              </>
            ) : (
              // mobile version
              <div style={{ textAlign: 'center' }}>
                <Heading2>Update Policy</Heading2>
                <FlexCol style={{ justifyContent: 'center', marginTop: '20px' }}>
                  <div style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center', padding: '5px' }}>
                      <Text3>Edit Coverage</Text3>
                      <Input
                        mt={5}
                        mb={5}
                        textAlignCenter
                        disabled={asyncLoading}
                        type="text"
                        value={inputCoverage}
                        onChange={(e) => handleInputCoverage(e.target.value)}
                      />
                      <Slider
                        disabled={asyncLoading}
                        backgroundColor={'#fff'}
                        value={newCoverage}
                        onChange={(e) => handleCoverageChange(e.target.value)}
                        min={1}
                        max={appraisal.toString()}
                      />
                    </div>
                  </div>
                  <div style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center', padding: '5px' }}>
                      <Text3>Add days</Text3>
                      <Input
                        mt={5}
                        mb={5}
                        textAlignCenter
                        disabled={asyncLoading}
                        type="text"
                        pattern="[0-9]+"
                        value={extendedTime}
                        onChange={(e) => filteredTime(e.target.value)}
                        maxLength={3}
                      />
                      <Slider
                        disabled={asyncLoading}
                        backgroundColor={'#fff'}
                        value={extendedTime == '' ? '0' : extendedTime}
                        onChange={(e) => setExtendedTime(e.target.value)}
                        min="0"
                        max={DAYS_PER_YEAR - daysLeft}
                      />
                      <Text3>New expiration: {getExpiration(daysLeft + parseFloat(extendedTime || '0'))}</Text3>
                      <SmallBox
                        transparent
                        outlined
                        error
                        collapse={!parseEther(inputCoverage).gt(parseEther(maxCoverPerUser))}
                        mb={!parseEther(inputCoverage).gt(parseEther(maxCoverPerUser)) ? 0 : 5}
                      >
                        <Text3 error autoAlign>
                          You can only cover up to {maxCoverPerUser} ETH.
                        </Text3>
                      </SmallBox>
                      <ButtonWrapper>
                        {!asyncLoading ? (
                          <Button
                            widthP={100}
                            disabled={errors.length > 0 || parseEther(inputCoverage).gt(parseEther(maxCoverPerUser))}
                            onClick={handleFunc}
                          >
                            Update Policy
                          </Button>
                        ) : (
                          <Loader width={10} height={10} />
                        )}
                      </ButtonWrapper>
                    </div>
                  </div>
                </FlexCol>
              </div>
            )}
            {width <= MAX_MOBILE_SCREEN_WIDTH ? (
              <>
                <FormRow>
                  <Text1>Cancel Policy</Text1>
                </FormRow>
                <CancelPolicySec>
                  <FormRow mb={10}>
                    <FormCol>
                      <Text3>
                        Refund amount: <TextSpan nowrap>{formatEther(refundAmount)} ETH</TextSpan>
                      </Text3>
                    </FormCol>
                  </FormRow>
                  <FormCol></FormCol>
                  <FormRow mb={10} style={{ justifyContent: 'flex-end' }}>
                    {policyPrice !== '' ? (
                      <Button disabled={errors.length > 0} onClick={() => cancelPolicy()}>
                        Cancel Policy
                      </Button>
                    ) : (
                      <Loader width={10} height={10} />
                    )}
                  </FormRow>
                </CancelPolicySec>
              </>
            ) : (
              // mobile version
              <div style={{ textAlign: 'center' }}>
                <Heading2>Cancel Policy</Heading2>
                <FlexCol mt={20}>
                  <FormRow mb={10}>
                    <FormCol>
                      <Text3>Refund amount: {formatEther(refundAmount)} ETH</Text3>
                    </FormCol>
                  </FormRow>
                  <FormCol></FormCol>
                  <ButtonWrapper>
                    {policyPrice !== '' ? (
                      <Button widthP={100} disabled={errors.length > 0} onClick={() => cancelPolicy()}>
                        Cancel Policy
                      </Button>
                    ) : (
                      <Loader width={10} height={10} />
                    )}
                  </ButtonWrapper>
                </FlexCol>
              </div>
            )}
          </Fragment>
        ) : (
          <Loader />
        )}
      </Fragment>
    </Modal>
  )
}
