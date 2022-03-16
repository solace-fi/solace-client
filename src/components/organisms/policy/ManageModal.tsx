/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import components
    import constants
    import hooks
    import utils

    ManageModal
      hooks
      contract functions
      local functions
      useEffect hooks

  *************************************************************************************/

/* import packages */
import React, { Fragment, useState, useEffect, useMemo, useCallback } from 'react'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { Block } from '@ethersproject/abstract-provider'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'

/* import managers */
import { useCachedData } from '../../../context/CachedDataManager'
import { useNotifications } from '../../../context/NotificationsManager'
import { useContracts } from '../../../context/ContractsManager'
import { useNetwork } from '../../../context/NetworkManager'
import { useGeneral } from '../../../context/GeneralManager'

/* import components */
import { Modal } from '../../molecules/Modal'
import { Text } from '../../atoms/Typography'
import { PolicyModalInfo } from './PolicyModalInfo'
import { Input, StyledSlider } from '../../../components/atoms/Input'
import { Button, ButtonWrapper } from '../../atoms/Button'
import { Loader } from '../../atoms/Loader'
import { Flex, MultiTabIndicator } from '../../atoms/Layout'
import { ModalCell } from '../../atoms/Modal'
import { SourceContract } from '../SourceContract'

/* import constants */
import { BKPT_3, DAYS_PER_YEAR, NUM_BLOCKS_PER_DAY, ZERO } from '../../../constants'
import { FunctionName, TransactionCondition } from '../../../constants/enums'
import { LocalTx, Policy } from '../../../constants/types'
import { FunctionGasLimits } from '../../../constants/mappings/gasMapping'

/* import hooks */
import { useAppraisePolicyPosition, useGetMaxCoverPerPolicy, useGetPolicyPrice } from '../../../hooks/policy/usePolicy'
import { useGetFunctionGas } from '../../../hooks/provider/useGas'
import { useWindowDimensions } from '../../../hooks/internal/useWindowDimensions'

/* import utils */
import { accurateMultiply, convertSciNotaToPrecise, filterAmount, formatAmount } from '../../../utils/formatting'
import { getDaysLeftByBlockNum, getExpiration } from '../../../utils/time'

interface ManageModalProps {
  closeModal: () => void
  isOpen: boolean
  selectedPolicy: Policy | undefined
  latestBlock: Block | undefined
}

export const ManageModal: React.FC<ManageModalProps> = ({ isOpen, closeModal, selectedPolicy, latestBlock }) => {
  /*************************************************************************************

    hooks

  *************************************************************************************/

  const [asyncLoading, setAsyncLoading] = useState<boolean>(true)
  const [inputCoverage, setInputCoverage] = useState<string>('1')
  const [newCoverage, setNewCoverage] = useState<string>('1')
  const [extendedTime, setExtendedTime] = useState<string>('0')
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [isUpdate, setIsUpdate] = useState<boolean>(true)

  const { haveErrors } = useGeneral()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { selectedProtocol, keyContracts } = useContracts()
  const { riskManager } = useMemo(() => keyContracts, [keyContracts])
  const { addLocalTransactions, reload } = useCachedData()
  const { makeTxToast } = useNotifications()
  const maxCoverPerPolicy = useGetMaxCoverPerPolicy()
  const maxCoverPerPolicyInWei = useMemo(() => parseUnits(maxCoverPerPolicy, currencyDecimals), [
    maxCoverPerPolicy,
    currencyDecimals,
  ])
  const { width } = useWindowDimensions()
  const { gasConfig } = useGetFunctionGas()
  const daysLeft = useMemo(
    () =>
      getDaysLeftByBlockNum(selectedPolicy ? selectedPolicy.expirationBlock : 0, latestBlock ? latestBlock.number : 0),
    [latestBlock, selectedPolicy]
  )
  const blocksLeft = useMemo(
    () => BigNumber.from(selectedPolicy ? selectedPolicy.expirationBlock : 0 - (latestBlock ? latestBlock.number : 0)),
    [latestBlock, selectedPolicy]
  )
  const policyPrice = useGetPolicyPrice(selectedPolicy ? selectedPolicy.policyId : 0)
  const paidprice = useMemo(() => BigNumber.from(policyPrice || '0'), [policyPrice])
  const currentCoverAmount = useMemo(() => (selectedPolicy ? selectedPolicy.coverAmount : '0'), [selectedPolicy])
  const refundAmount = useMemo(
    () =>
      blocksLeft
        .mul(currentCoverAmount)
        .mul(paidprice)
        .div(String(Math.pow(10, 12))),
    [blocksLeft, currentCoverAmount, paidprice]
  )

  const appraisal = useAppraisePolicyPosition(selectedPolicy)
  const [coveredAssets, setCoveredAssets] = useState<string>(currentCoverAmount)

  /*************************************************************************************

    Contract functions

  *************************************************************************************/

  const updatePolicy = async () => {
    setModalLoading(true)
    if (!selectedProtocol || !selectedPolicy || !riskManager) return
    const txType = FunctionName.UPDATE_POLICY
    try {
      const params = await riskManager.productRiskParams(selectedProtocol.address)
      const newPremium = BigNumber.from(newCoverage)
        .mul(params.price)
        .mul(
          selectedPolicy.expirationBlock +
            NUM_BLOCKS_PER_DAY * parseInt(extendedTime) -
            (latestBlock ? latestBlock.number : 0)
        )
        .div(String(Math.pow(10, 12)))
      const tx = await selectedProtocol.updatePolicy(
        selectedPolicy.policyId,
        newCoverage,
        NUM_BLOCKS_PER_DAY * parseInt(extendedTime),
        {
          value: newPremium,
          ...gasConfig,
          gasLimit: FunctionGasLimits['selectedProtocol.updatePolicy'],
        }
      )
      const localTx: LocalTx = {
        hash: tx.hash,
        type: txType,
        status: TransactionCondition.PENDING,
      }
      await handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('updatePolicy:', err, txType)
    }
  }

  const updateCoverAmount = async () => {
    setModalLoading(true)
    if (!selectedProtocol || !selectedPolicy || !riskManager) return
    const txType = FunctionName.UPDATE_POLICY_AMOUNT
    try {
      const params = await riskManager.productRiskParams(selectedProtocol.address)
      const newPremium = BigNumber.from(newCoverage)
        .mul(params.price)
        .mul(selectedPolicy.expirationBlock - (latestBlock ? latestBlock.number : 0))
        .div(String(Math.pow(10, 12)))
      const tx = await selectedProtocol.updateCoverAmount(selectedPolicy.policyId, newCoverage, {
        value: newPremium,
        ...gasConfig,
        gasLimit: FunctionGasLimits['selectedProtocol.updateCoverAmount'],
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: txType,
        status: TransactionCondition.PENDING,
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
          gasLimit: FunctionGasLimits['selectedProtocol.extendPolicy'],
        }
      )
      const localTx: LocalTx = {
        hash: tx.hash,
        type: txType,
        status: TransactionCondition.PENDING,
      }
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
        gasLimit: FunctionGasLimits['selectedProtocol.cancelPolicy'],
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: txType,
        status: TransactionCondition.PENDING,
      }
      await handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('cancelPolicy:', err, txType)
    }
  }

  /*************************************************************************************

    local functions

  *************************************************************************************/

  const handleToast = async (tx: TransactionResponse | null, localTx: LocalTx | null) => {
    if (!tx || !localTx) return
    setModalLoading(false)
    handleClose()
    addLocalTransactions(localTx)
    reload()
    makeTxToast(localTx.type, TransactionCondition.PENDING, localTx.hash)
    await tx.wait(activeNetwork.rpc.blockConfirms).then((receipt: TransactionReceipt) => {
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
      formatUnits(
        BigNumber.from(`${convertFromSciNota ? convertSciNotaToPrecise(coverAmount) : coverAmount}`),
        currencyDecimals
      )
    )
    setNewCoverage(`${convertFromSciNota ? convertSciNotaToPrecise(coverAmount) : coverAmount}`)
  }

  const handleInputCoverage = (input: string) => {
    // allow only numbers and decimals
    const filtered = filterAmount(input, inputCoverage)

    // if filtered is only "0." or "." or '', filtered becomes '0.0'
    const formatted = formatAmount(filtered)

    // if number has more than max decimal places, do not update
    if (filtered.includes('.') && filtered.split('.')[1]?.length > currencyDecimals) return

    // if number is greater than the max cover per user, do not update
    if (parseUnits(formatted, currencyDecimals).gt(maxCoverPerPolicyInWei)) return

    setNewCoverage(accurateMultiply(filtered, currencyDecimals)) // set new amount in wei
    setInputCoverage(filtered) // set new amount in eth
  }

  const filteredTime = (input: string) => {
    const filtered = input.replace(/[^0-9]*/g, '')
    if (
      parseFloat(filtered) <=
        DAYS_PER_YEAR -
          getDaysLeftByBlockNum(
            selectedPolicy ? selectedPolicy.expirationBlock : 0,
            latestBlock ? latestBlock.number : 0
          ) ||
      filtered == ''
    ) {
      setExtendedTime(filtered)
    }
  }

  const handleClose = useCallback(() => {
    setExtendedTime('0')
    setIsUpdate(true)
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

  const setPositionCover = () => {
    if (appraisal.lte(maxCoverPerPolicyInWei)) {
      handleCoverageChange(appraisal.toString())
    } else {
      setMaxCover()
    }
  }

  /*************************************************************************************

    useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    const load = async () => {
      if (!selectedPolicy || !isOpen) return
      setAsyncLoading(true)
      if (BigNumber.from(currentCoverAmount).lte(ZERO)) return
      handleCoverageChange(currentCoverAmount)
      setAsyncLoading(false)
    }
    load()
  }, [isOpen, selectedPolicy, currentCoverAmount])

  useEffect(() => {
    setCoveredAssets(formatUnits(BigNumber.from(newCoverage), currencyDecimals))
  }, [newCoverage, currencyDecimals])

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={'Policy Management'} disableCloseButton={modalLoading}>
      <Fragment>
        <PolicyModalInfo selectedPolicy={selectedPolicy} latestBlock={latestBlock} appraisal={appraisal} />
        <div
          style={{
            gridTemplateColumns: '1fr 1fr',
            display: 'grid',
            position: 'relative',
            width: width > BKPT_3 ? '600px' : undefined,
          }}
        >
          <MultiTabIndicator style={{ left: isUpdate ? '0' : '50%' }} />
          <ModalCell
            pt={5}
            pb={10}
            pl={0}
            pr={0}
            onClick={() => setIsUpdate(true)}
            jc={'center'}
            style={{ cursor: 'pointer' }}
          >
            <Text t1 info={isUpdate}>
              Update
            </Text>
          </ModalCell>
          <ModalCell
            pt={5}
            pb={10}
            pl={0}
            pr={0}
            onClick={() => setIsUpdate(false)}
            jc={'center'}
            style={{ cursor: 'pointer' }}
          >
            <Text t1 info={!isUpdate}>
              Cancel
            </Text>
          </ModalCell>
        </div>
        {!modalLoading ? (
          isUpdate ? (
            <Flex col justifyCenter mt={20}>
              <div style={{ width: '100%' }}>
                <div style={{ textAlign: 'center', padding: '5px' }}>
                  <Text t4>Edit Coverage</Text>
                  <Input
                    mt={5}
                    mb={20}
                    textAlignCenter
                    disabled={asyncLoading}
                    type="text"
                    value={inputCoverage}
                    onChange={(e) => handleInputCoverage(e.target.value)}
                  />
                  {maxCoverPerPolicyInWei.gt(appraisal) && (
                    <Button
                      disabled={haveErrors}
                      ml={10}
                      pt={4}
                      pb={4}
                      pl={2}
                      pr={2}
                      width={120}
                      height={30}
                      onClick={setPositionCover}
                      info
                    >
                      Cover to position
                    </Button>
                  )}
                  <Button
                    disabled={haveErrors}
                    ml={10}
                    pt={4}
                    pb={4}
                    pl={8}
                    pr={8}
                    width={79}
                    height={30}
                    onClick={setMaxCover}
                    info
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
                  <Text t4>Add days</Text>
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
                  <Text t4>New expiration: {getExpiration(daysLeft + parseFloat(extendedTime || '0'))}</Text>
                  <ButtonWrapper>
                    {!asyncLoading ? (
                      <Button widthP={100} disabled={haveErrors || coveredAssets == '0.0'} onClick={handleFunc} info>
                        Update Policy
                      </Button>
                    ) : (
                      <Loader width={10} height={10} />
                    )}
                  </ButtonWrapper>
                </div>
              </div>
            </Flex>
          ) : (
            <Flex col mt={180} mb={30}>
              <Flex stretch between mb={10}>
                <Text t4>
                  Refund amount: {formatUnits(refundAmount, currencyDecimals)} {activeNetwork.nativeCurrency.symbol}
                </Text>
              </Flex>
              <Text></Text>
              <ButtonWrapper>
                {policyPrice !== '' ? (
                  <Button widthP={100} disabled={haveErrors} onClick={cancelPolicy} info>
                    Cancel Policy
                  </Button>
                ) : (
                  <Loader width={10} height={10} />
                )}
              </ButtonWrapper>
            </Flex>
          )
        ) : (
          <Loader />
        )}
        {selectedProtocol && <SourceContract contract={selectedProtocol} />}
      </Fragment>
    </Modal>
  )
}
