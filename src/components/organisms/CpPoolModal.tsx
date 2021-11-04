/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    CpPoolModal
      hooks
      contract functions
      local functions
      useEffect hooks

  *************************************************************************************/

/* import packages */
import React, { useState, Fragment, useEffect, useCallback, useMemo } from 'react'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'
import { Contract } from '@ethersproject/contracts'

/* import managers */
import { useNotifications } from '../../context/NotificationsManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import constants */
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx } from '../../constants/types'

/* import components */
import { Modal } from '../molecules/Modal'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Loader } from '../atoms/Loader'
import { GasRadioGroup } from '../molecules/GasRadioGroup'
import { Erc20InputPanel, PoolModalProps, usePoolModal } from './PoolModalRouter'
import { Text } from '../atoms/Typography'

/* import hooks */
import { useUserStakedValue } from '../../hooks/useFarm'
import { useScpBalance } from '../../hooks/useBalance'
import { useTokenAllowance } from '../../hooks/useTokenAllowance'
import { useCpFarm } from '../../hooks/useCpFarm'
import { useVault } from '../../hooks/useVault'

/* import utils */
import { hasApproval } from '../../utils'
import { getUnit, truncateBalance } from '../../utils/formatting'

export const CpPoolModal: React.FC<PoolModalProps> = ({ modalTitle, func, isOpen, closeModal }) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/

  const { haveErrors } = useGeneral()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { vault, cpFarm } = useContracts()
  const { reload } = useCachedData()
  const cpUserStakeValue = useUserStakedValue(cpFarm)
  const scpBalance = useScpBalance()
  const {
    gasConfig,
    gasPrices,
    selectedGasOption,
    amount,
    maxSelected,
    handleSelectChange,
    isAppropriateAmount,
    handleToast,
    handleContractCallError,
    calculateMaxEth,
    handleInputChange,
    setMax,
    setAmount,
    resetAmount,
  } = usePoolModal()

  const { makeTxToast } = useNotifications()
  const { canTransfer } = useVault()
  const cpFarmFunctions = useCpFarm()

  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [canCloseOnLoading, setCanCloseOnLoading] = useState<boolean>(false)
  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const tokenAllowance = useTokenAllowance(contractForAllowance, spenderAddress)
  const approval = useMemo(
    () => hasApproval(tokenAllowance, amount && amount != '.' ? parseUnits(amount, currencyDecimals).toString() : '0'),
    [amount, currencyDecimals, tokenAllowance]
  )
  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)

  /*************************************************************************************

  contract functions

  *************************************************************************************/

  const approve = async () => {
    setModalLoading(true)
    if (!cpFarm || !vault) return
    try {
      const tx = await vault.approve(cpFarm.address, parseUnits(amount, currencyDecimals))
      const txHash = tx.hash
      setCanCloseOnLoading(true)
      makeTxToast(FunctionName.APPROVE, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(FunctionName.APPROVE, status, txHash)
        reload()
      })
      setCanCloseOnLoading(false)
      setModalLoading(false)
    } catch (err) {
      _handleContractCallError('approve', err, FunctionName.APPROVE)
    }
  }

  const callDepositCp = async () => {
    setModalLoading(true)
    await cpFarmFunctions
      .depositCp(
        parseUnits(amount, currencyDecimals),
        `${truncateBalance(amount)} ${getUnit(func, activeNetwork)}`,
        gasConfig
      )
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callDepositCp', err, FunctionName.DEPOSIT_CP))
  }

  const callWithdrawCp = async () => {
    setModalLoading(true)
    await cpFarmFunctions
      .withdrawCp(
        parseUnits(amount, currencyDecimals),
        `${truncateBalance(amount)} ${getUnit(func, activeNetwork)}`,
        gasConfig
      )
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callWithdrawCp', err, FunctionName.WITHDRAW_CP))
  }

  /*************************************************************************************

  local functions

  *************************************************************************************/

  const _handleToast = async (tx: any, localTx: LocalTx | null) => {
    if (!tx || !localTx) return
    handleClose()
    await handleToast(tx, localTx)
  }

  const _handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    handleContractCallError(functionName, err, txType)
    setModalLoading(false)
  }

  const getAssetBalanceByFunc = (f: FunctionName): BigNumber => {
    switch (f) {
      case FunctionName.DEPOSIT_CP:
        return parseUnits(scpBalance, currencyDecimals)
      case FunctionName.WITHDRAW_CP:
      default:
        return parseUnits(cpUserStakeValue, currencyDecimals)
    }
  }

  const _setMax = () => {
    setMax(getAssetBalanceByFunc(func), func)
  }

  const handleCallbackFunc = async () => {
    if (func == FunctionName.DEPOSIT_CP) await callDepositCp()
    if (func == FunctionName.WITHDRAW_CP) await callWithdrawCp()
  }

  const handleClose = useCallback(() => {
    resetAmount()
    handleSelectChange(gasPrices.selected)
    setModalLoading(false)
    setCanCloseOnLoading(false)
    closeModal()
  }, [closeModal, gasPrices.selected])

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    if (maxSelected) setAmount(calculateMaxEth(getAssetBalanceByFunc(func), func).toString())
  }, [handleSelectChange])

  useEffect(() => {
    setIsAcceptableAmount(isAppropriateAmount(amount, getAssetBalanceByFunc(func)))
  }, [amount, func])

  useEffect(() => {
    if (isOpen && vault && cpFarm?.address) {
      setContractForAllowance(vault)
      setSpenderAddress(cpFarm?.address)
    }
  }, [isOpen, cpFarm?.address, vault, func, currencyDecimals])

  return (
    <Modal
      isOpen={isOpen}
      handleClose={handleClose}
      modalTitle={modalTitle}
      disableCloseButton={modalLoading && !canCloseOnLoading}
    >
      <Erc20InputPanel
        unit={getUnit(func, activeNetwork)}
        availableBalance={truncateBalance(formatUnits(getAssetBalanceByFunc(func), currencyDecimals))}
        amount={amount}
        handleInputChange={handleInputChange}
        setMax={_setMax}
      />
      <GasRadioGroup
        gasPrices={gasPrices}
        selectedGasOption={selectedGasOption}
        handleSelectChange={handleSelectChange}
        mb={20}
      />
      {!canTransfer && (
        <Text t4 bold textAlignCenter width={270} style={{ margin: '7px auto' }}>
          You cannot interact with this pool during a thaw.
        </Text>
      )}
      {modalLoading ? (
        <Loader />
      ) : func == FunctionName.DEPOSIT_CP ? (
        <Fragment>
          {!approval && tokenAllowance != '' && (
            <ButtonWrapper>
              <Button widthP={100} disabled={!isAcceptableAmount || haveErrors} onClick={approve} info>
                Approve
              </Button>
            </ButtonWrapper>
          )}
          <ButtonWrapper>
            <Button
              widthP={100}
              hidden={modalLoading}
              disabled={!isAcceptableAmount || !approval || haveErrors || !canTransfer}
              onClick={handleCallbackFunc}
              info
            >
              Confirm
            </Button>
          </ButtonWrapper>
        </Fragment>
      ) : (
        <ButtonWrapper>
          <Button
            widthP={100}
            hidden={modalLoading}
            disabled={!isAcceptableAmount || haveErrors || !canTransfer}
            onClick={handleCallbackFunc}
            info
          >
            Confirm
          </Button>
        </ButtonWrapper>
      )}
    </Modal>
  )
}
