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
import { Slider } from '@rebass/forms'
import { parseUnits, formatUnits } from '@ethersproject/units'
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
import { Heading2, Text3 } from '../atoms/Typography'
import { PolicyModalInfo } from '../molecules/PolicyModalInfo'
import { Input } from '../atoms/Input'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Loader } from '../atoms/Loader'
import { FlexCol } from '../atoms/Layout'
import { SmallBox } from '../atoms/Box'

/* import constants */
import { DAYS_PER_YEAR, NUM_BLOCKS_PER_DAY, GAS_LIMIT, ZERO } from '../../constants'
import { FunctionName, TransactionCondition, Unit } from '../../constants/enums'
import { Policy } from '../../constants/types'

/* import hooks */
import { useAppraisePosition, useGetMaxCoverPerUser, useGetPolicyPrice } from '../../hooks/usePolicy'

/* import utils */
import { accurateMultiply, getGasValue } from '../../utils/formatting'
import { getDaysLeft, getExpiration } from '../../utils/time'

interface ManageModalProps {
  closeModal: () => void
  isOpen: boolean
  selectedPolicy: Policy | undefined
  latestBlock: number
}

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
  const maxCoverPerUser = useGetMaxCoverPerUser()
  const { activeNetwork, currencyDecimals } = useNetwork()

  const daysLeft = useMemo(() => getDaysLeft(selectedPolicy ? selectedPolicy.expirationBlock : 0, latestBlock), [
    latestBlock,
    selectedPolicy,
  ])
  const blocksLeft = useMemo(() => BigNumber.from(selectedPolicy ? selectedPolicy.expirationBlock : 0 - latestBlock), [
    latestBlock,
    selectedPolicy,
  ])
  const currentCoverAmount = useMemo(() => (selectedPolicy ? selectedPolicy.coverAmount : '0'), [selectedPolicy])
  const paidprice = useMemo(() => BigNumber.from(policyPrice || '0'), [policyPrice])
  const refundAmount = useMemo(
    () =>
      blocksLeft
        .mul(currentCoverAmount)
        .mul(paidprice)
        .div(String(Math.pow(10, 12))),
    [blocksLeft, currentCoverAmount, paidprice]
  )
  const appraisal = useAppraisePosition(selectedPolicy)

  /*************************************************************************************

    Contract functions

  *************************************************************************************/

  const updatePolicy = async () => {
    setModalLoading(true)
    if (!selectedProtocol || !selectedPolicy) return
    const txType = FunctionName.UPDATE_POLICY
    const price = await selectedProtocol.price()
    try {
      const newPremium = BigNumber.from(newCoverage)
        .mul(price)
        .mul(selectedPolicy.expirationBlock + NUM_BLOCKS_PER_DAY * parseInt(extendedTime) - latestBlock)
        .div(String(Math.pow(10, 12)))
      // const paidPremium = BigNumber.from(currentCoverAmount)
      //   .mul(paidprice)
      //   .mul(selectedPolicy.expirationBlock - latestBlock)
      //   .div(String(Math.pow(10, 12)))
      // const premium = newPremium.sub(paidPremium)
      // console.log('newPremium:', newPremium)
      // console.log('paidPremium:', paidPremium)
      // console.log('newPremium >= paidPremium ? ', newPremium.gte(paidPremium))
      // console.log('premium = newPremium - paidPremium: ', premium)
      // console.log('newPremium >= premium ? ', newPremium.gte(premium))
      const tx = await selectedProtocol.updatePolicy(
        selectedPolicy.policyId,
        newCoverage,
        NUM_BLOCKS_PER_DAY * parseInt(extendedTime),
        {
          value: newPremium,
          gasPrice: getGasValue(gasPrices.selected.value),
          gasLimit: GAS_LIMIT,
        }
      )
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
    const price = await selectedProtocol.price()
    const newPremium = BigNumber.from(newCoverage)
      .mul(price)
      .mul(selectedPolicy.expirationBlock - latestBlock)
      .div(String(Math.pow(10, 12)))
    // const paidPremium = BigNumber.from(currentCoverAmount)
    //   .mul(paidprice)
    //   .mul(selectedPolicy.expirationBlock - latestBlock)
    //   .div(String(Math.pow(10, 12)))
    // const premium = newPremium.sub(paidPremium)
    // console.log('newPremium:', newPremium)
    // console.log('paidPremium:', paidPremium)
    // console.log('newPremium >= paidPremium ? ', newPremium.gte(paidPremium))
    // console.log('premium = newPremium - paidPremium: ', premium)
    // console.log('newPremium >= premium ? ', newPremium.gte(premium))
    try {
      const tx = await selectedProtocol.updateCoverAmount(selectedPolicy.policyId, newCoverage, {
        value: newPremium,
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
    const newPremium = BigNumber.from(currentCoverAmount)
      .mul(paidprice)
      .mul(BigNumber.from(NUM_BLOCKS_PER_DAY * parseInt(extendedTime)))
      .div(String(Math.pow(10, 12)))
    try {
      const tx = await selectedProtocol.extendPolicy(
        selectedPolicy.policyId,
        NUM_BLOCKS_PER_DAY * parseInt(extendedTime),
        {
          value: newPremium,
          gasPrice: getGasValue(gasPrices.selected.value),
          gasLimit: GAS_LIMIT,
        }
      )
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
    setInputCoverage(formatUnits(BigNumber.from(coverAmount), currencyDecimals)) // coveramount in eth
  }

  const handleInputCoverage = (input: string) => {
    // allow only numbers and decimals
    const filtered = input.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')

    // if number is greater than the max cover per user, do not update
    if (parseFloat(filtered) > parseFloat(maxCoverPerUser)) return

    // if number is greater than the position amount, do not update
    if (parseFloat(filtered) > parseFloat(formatUnits(appraisal, currencyDecimals))) return

    // if number is empty or less than smallest denomination of currency, do not update
    if (filtered == '' || parseFloat(filtered) < parseFloat(formatUnits(BigNumber.from(1), currencyDecimals))) return

    // if number has more than max decimal places, do not update
    if (filtered.includes('.') && filtered.split('.')[1]?.length > currencyDecimals) return

    setNewCoverage(accurateMultiply(filtered, currencyDecimals)) // set new amount in wei
    setInputCoverage(filtered) // set new amount in eth
  }

  const filteredTime = (input: string) => {
    const filtered = input.replace(/[^0-9]*/g, '')
    if (
      parseFloat(filtered) <=
        DAYS_PER_YEAR - getDaysLeft(selectedPolicy ? selectedPolicy.expirationBlock : 0, latestBlock) ||
      filtered == ''
    ) {
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
                      collapse={
                        !parseUnits(inputCoverage, currencyDecimals).gt(parseUnits(maxCoverPerUser, currencyDecimals))
                      }
                      mb={
                        !parseUnits(inputCoverage, currencyDecimals).gt(parseUnits(maxCoverPerUser, currencyDecimals))
                          ? 0
                          : 5
                      }
                    >
                      <Text3 error autoAlign>
                        You can only cover up to {maxCoverPerUser} {activeNetwork.nativeCurrency.symbol}.
                      </Text3>
                    </SmallBox>
                    <ButtonWrapper>
                      {!asyncLoading ? (
                        <Button
                          widthP={100}
                          disabled={
                            errors.length > 0 ||
                            parseUnits(inputCoverage, currencyDecimals).gt(
                              parseUnits(maxCoverPerUser, currencyDecimals)
                            )
                          }
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
            <div style={{ textAlign: 'center' }}>
              <Heading2>Cancel Policy</Heading2>
              <FlexCol mt={20}>
                <FormRow mb={10}>
                  <FormCol>
                    <Text3>
                      Refund amount: {formatUnits(refundAmount, currencyDecimals)} {activeNetwork.nativeCurrency.symbol}
                    </Text3>
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
          </Fragment>
        ) : (
          <Loader />
        )}
      </Fragment>
    </Modal>
  )
}
