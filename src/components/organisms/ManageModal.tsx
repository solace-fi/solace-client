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
import React, { Fragment, useState, useEffect, useMemo, useCallback, useRef } from 'react'

/* import packages */
import { parseUnits, formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import managers */
import { useCachedData } from '../../context/CachedDataManager'
import { useToasts } from '../../context/NotificationsManager'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import components */
import { Modal } from '../molecules/Modal'
import { FormRow, FormCol } from '../atoms/Form'
import { Heading2, Text4 } from '../atoms/Typography'
import { PolicyModalInfo } from './PolicyModalInfo'
import { Input, StyledSlider } from '../../components/atoms/Input'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Loader } from '../atoms/Loader'
import { FlexCol } from '../atoms/Layout'

/* import constants */
import { DAYS_PER_YEAR, NUM_BLOCKS_PER_DAY, GAS_LIMIT, ZERO } from '../../constants'
import { FunctionName, TransactionCondition, Unit } from '../../constants/enums'
import { LocalTx, Policy } from '../../constants/types'

/* import hooks */
import { useAppraisePosition, useGetMaxCoverPerPolicy, useGetPolicyPrice } from '../../hooks/usePolicy'
import { useGasConfig } from '../../hooks/useFetchGasPrice'

/* import utils */
import { accurateMultiply, filteredAmount } from '../../utils/formatting'
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

  const { errors } = useGeneral()
  const { selectedProtocol } = useContracts()
  const { addLocalTransactions, reload, gasPrices } = useCachedData()
  const { makeTxToast } = useToasts()
  const policyPrice = useGetPolicyPrice(selectedPolicy ? selectedPolicy.policyId : 0)
  const maxCoverPerPolicy = useGetMaxCoverPerPolicy()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { gasConfig } = useGasConfig(gasPrices.selected?.value)
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
  const maxCoverPerPolicyInWei = useMemo(() => {
    return parseUnits(maxCoverPerPolicy, currencyDecimals)
  }, [maxCoverPerPolicy, currencyDecimals])
  const appraisal = useAppraisePosition(selectedPolicy)
  const mounting = useRef(true)

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
      const tx = await selectedProtocol.updatePolicy(
        selectedPolicy.policyId,
        newCoverage,
        NUM_BLOCKS_PER_DAY * parseInt(extendedTime),
        {
          value: newPremium,
          ...gasConfig,
          gasLimit: GAS_LIMIT,
        }
      )
      const localTx = {
        hash: tx.hash,
        type: txType,
        value: '0',
        status: TransactionCondition.PENDING,
        unit: activeNetwork.nativeCurrency.symbol,
      }
      await handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('updatePolicy:', err, txType)
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
    try {
      const tx = await selectedProtocol.updateCoverAmount(selectedPolicy.policyId, newCoverage, {
        value: newPremium,
        ...gasConfig,
        gasLimit: GAS_LIMIT,
      })
      const localTx = {
        hash: tx.hash,
        type: txType,
        value: '0',
        status: TransactionCondition.PENDING,
        unit: Unit.ID,
      }
      await handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('updateCoverAmount:', err, txType)
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
          ...gasConfig,
          gasLimit: GAS_LIMIT,
        }
      )
      const localTx = { hash: tx.hash, type: txType, value: '0', status: TransactionCondition.PENDING, unit: Unit.ID }
      await handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('extendPolicy:', err, txType)
    }
  }

  const cancelPolicy = async () => {
    setModalLoading(true)
    if (!selectedProtocol || !selectedPolicy) return
    const txType = FunctionName.CANCEL_POLICY
    try {
      const tx = await selectedProtocol.cancelPolicy(selectedPolicy.policyId, {
        ...gasConfig,
        gasLimit: GAS_LIMIT,
      })
      const localTx = {
        hash: tx.hash,
        type: txType,
        value: String(selectedPolicy.policyId),
        status: TransactionCondition.PENDING,
        unit: Unit.ID,
      }
      await handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('cancelPolicy:', err, txType)
    }
  }

  /*************************************************************************************

    Local functions

  *************************************************************************************/

  const handleToast = async (tx: any, localTx: LocalTx) => {
    setModalLoading(false)
    handleClose()
    addLocalTransactions(localTx)
    reload()
    makeTxToast(localTx.type, TransactionCondition.PENDING, localTx.hash)
    await tx.wait().then((receipt: any) => {
      const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
      makeTxToast(localTx.type, status, localTx.hash)
      reload()
    })
  }

  const handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    console.log(functionName, err)
    makeTxToast(txType, TransactionCondition.CANCELLED)
    setModalLoading(false)
    reload()
  }

  const handleCoverageChange = (coverAmount: string, convertFromSciNota = true) => {
    setInputCoverage(
      formatUnits(BigNumber.from(`${convertFromSciNota ? +coverAmount : coverAmount}`), currencyDecimals)
    )
    setNewCoverage(`${convertFromSciNota ? +coverAmount : coverAmount}`)
  }

  const handleInputCoverage = (input: string) => {
    // allow only numbers and decimals
    const filtered = input.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')

    // if number is greater than the max cover per user, do not update
    if (parseUnits(filtered, currencyDecimals).gt(maxCoverPerPolicyInWei)) return

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

  const setMaxCover = () => {
    const adjustedCoverAmount = maxCoverPerPolicyInWei.toString()
    handleCoverageChange(adjustedCoverAmount, false)
  }

  /*************************************************************************************

    useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    const load = async () => {
      if (!selectedPolicy || !isOpen) return
      setAsyncLoading(true)
      if (BigNumber.from(currentCoverAmount).lte(ZERO) || appraisal.lte(ZERO)) return
      if (mounting.current) {
        handleCoverageChange(currentCoverAmount)
        mounting.current = false
      }
      setAsyncLoading(false)
    }
    load()
  }, [isOpen, selectedPolicy, currentCoverAmount, appraisal])

  useEffect(() => {
    setMaxCover()
  }, [maxCoverPerPolicy])

  /*************************************************************************************

    Render

  *************************************************************************************/

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={'Policy Management'} disableCloseButton={modalLoading}>
      <Fragment>
        <PolicyModalInfo selectedPolicy={selectedPolicy} latestBlock={latestBlock} appraisal={appraisal} />
        {!modalLoading ? (
          <Fragment>
            <div style={{ textAlign: 'center' }}>
              <Heading2 high_em>Update Policy</Heading2>
              <FlexCol style={{ justifyContent: 'center', marginTop: '20px' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center', padding: '5px' }}>
                    <Text4>Edit Coverage</Text4>
                    <Input
                      mt={5}
                      mb={20}
                      textAlignCenter
                      disabled={asyncLoading}
                      type="text"
                      value={inputCoverage}
                      onChange={(e) => handleInputCoverage(filteredAmount(e.target.value, inputCoverage))}
                    />
                    <Button
                      disabled={errors.length > 0}
                      ml={10}
                      pt={4}
                      pb={4}
                      pl={8}
                      pr={8}
                      width={79}
                      height={30}
                      onClick={() => setMaxCover()}
                    >
                      MAX
                    </Button>
                    <StyledSlider
                      disabled={asyncLoading}
                      value={newCoverage}
                      onChange={(e) => handleCoverageChange(e.target.value)}
                      min={1}
                      max={maxCoverPerPolicyInWei.toString()}
                    />
                  </div>
                </div>
                <div style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center', padding: '5px' }}>
                    <Text4>Add days</Text4>
                    <Input
                      mt={5}
                      mb={20}
                      textAlignCenter
                      disabled={asyncLoading}
                      type="text"
                      pattern="[0-9]+"
                      value={extendedTime}
                      onChange={(e) => filteredTime(e.target.value)}
                      maxLength={3}
                    />
                    <StyledSlider
                      disabled={asyncLoading}
                      value={extendedTime == '' ? '0' : extendedTime}
                      onChange={(e) => setExtendedTime(e.target.value)}
                      min="0"
                      max={DAYS_PER_YEAR - daysLeft}
                    />
                    <Text4 high_em>New expiration: {getExpiration(daysLeft + parseFloat(extendedTime || '0'))}</Text4>
                    <ButtonWrapper>
                      {!asyncLoading ? (
                        <Button
                          widthP={100}
                          disabled={errors.length > 0 || !inputCoverage || inputCoverage == '.'}
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
              <Heading2 high_em>Cancel Policy</Heading2>
              <FlexCol mt={20}>
                <FormRow mb={10}>
                  <FormCol>
                    <Text4 high_em>
                      Refund amount: {formatUnits(refundAmount, currencyDecimals)} {activeNetwork.nativeCurrency.symbol}
                    </Text4>
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
