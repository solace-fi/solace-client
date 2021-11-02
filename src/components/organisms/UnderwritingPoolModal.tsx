/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    UnderwritingPoolModal
      hooks
      contract functions
      local functions
      useEffect hooks
      functional components

  *************************************************************************************/

/* import packages */
import React, { useState, Fragment, useEffect, useCallback } from 'react'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import managers */
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import constants */
import { FunctionName } from '../../constants/enums'
import { LocalTx } from '../../constants/types'

/* import components */
import { Modal } from '../molecules/Modal'
import { RadioCircle, RadioCircleFigure, RadioCircleInput } from '../atoms/Radio'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Loader } from '../atoms/Loader'
import { Text } from '../atoms/Typography'
import { GasRadioGroup } from '../molecules/GasRadioGroup'
import { Erc20InputPanel, PoolModalProps, usePoolModal } from './PoolModalRouter'
import { Box, BoxItem, BoxItemTitle } from '../atoms/Box'

/* import hooks */
import { useNativeTokenBalance } from '../../hooks/useBalance'
import { useScpBalance } from '../../hooks/useBalance'
import { useCooldown, useVault } from '../../hooks/useVault'
import { useCpFarm } from '../../hooks/useCpFarm'

/* import utils */
import { getUnit, truncateBalance } from '../../utils/formatting'
import { timeToDateText, getTimeFromMillis, timeToDate } from '../../utils/time'

export const UnderwritingPoolModal: React.FC<PoolModalProps> = ({ modalTitle, func, isOpen, closeModal }) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/

  const { haveErrors } = useGeneral()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const nativeTokenBalance = useNativeTokenBalance()
  const scpBalance = useScpBalance()

  const {
    cooldownStarted,
    timeWaited,
    cooldownMin,
    cooldownMax,
    canWithdrawEth,
    startCooldown,
    stopCooldown,
  } = useCooldown()
  const { canTransfer, depositEth, withdrawEth } = useVault()
  const cpFarmFunctions = useCpFarm()
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

  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [canCloseOnLoading, setCanCloseOnLoading] = useState<boolean>(false)
  const [isStaking, setIsStaking] = useState<boolean>(false)

  /*************************************************************************************

  contract functions

  *************************************************************************************/

  const callStartCooldown = async () => {
    setModalLoading(true)
    await startCooldown()
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callStartCooldown', err, FunctionName.START_COOLDOWN))
  }

  const callStopCooldown = async () => {
    setModalLoading(true)
    await stopCooldown()
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callStopCooldown', err, FunctionName.STOP_COOLDOWN))
  }

  const callDeposit = async () => {
    setModalLoading(true)
    await depositEth(
      parseUnits(amount, currencyDecimals),
      `${truncateBalance(amount)} ${getUnit(func, activeNetwork)}`,
      gasConfig
    )
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callDeposit', err, FunctionName.DEPOSIT_ETH))
  }

  const callDepositEth = async () => {
    setModalLoading(true)
    await cpFarmFunctions
      .depositEth(
        parseUnits(amount, currencyDecimals),
        `${truncateBalance(amount)} ${getUnit(func, activeNetwork)}`,
        gasConfig
      )
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callDepositEth', err, FunctionName.DEPOSIT_ETH))
  }

  const callWithdrawEth = async () => {
    setModalLoading(true)
    if (!canWithdrawEth) return
    await withdrawEth(
      parseUnits(amount, currencyDecimals),
      `${truncateBalance(amount)} ${getUnit(func, activeNetwork)}`,
      gasConfig
    )
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callWithdrawEth', err, FunctionName.WITHDRAW_ETH))
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

  const getAssetBalanceByFunc = (): BigNumber => {
    switch (func) {
      case FunctionName.DEPOSIT_ETH:
        return parseUnits(nativeTokenBalance, currencyDecimals)
      case FunctionName.WITHDRAW_ETH:
      default:
        return parseUnits(scpBalance, currencyDecimals)
    }
  }

  const _setMax = () => {
    setMax(getAssetBalanceByFunc(), func)
  }

  const handleCallbackFunc = async () => {
    if (!func) return

    if (func == FunctionName.DEPOSIT_ETH) {
      if (isStaking) {
        await callDepositEth()
      } else {
        await callDeposit()
      }
    }
    if (func == FunctionName.WITHDRAW_ETH) {
      if (!cooldownStarted) {
        await callStartCooldown()
        return
      }
      if (canWithdrawEth) {
        await callWithdrawEth()
        return
      }
      if (cooldownMax < timeWaited || timeWaited < cooldownMin) {
        await callStopCooldown()
        return
      }
    }
  }

  const handleClose = useCallback(() => {
    resetAmount()
    handleSelectChange(gasPrices.selected)
    setIsStaking(false)
    setModalLoading(false)
    setCanCloseOnLoading(false)
    closeModal()
  }, [closeModal, gasPrices.selected])

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    if (maxSelected) setAmount(calculateMaxEth(getAssetBalanceByFunc(), func).toString())
  }, [handleSelectChange])

  /*************************************************************************************

    functional components

  *************************************************************************************/

  const AutoStakeOption: React.FC = () => (
    <RadioCircle style={{ justifyContent: 'center', marginTop: '10px' }}>
      <RadioCircleInput type="checkbox" checked={isStaking} onChange={(e) => setIsStaking(e.target.checked)} />
      <RadioCircleFigure />
      <Text info textAlignCenter t3>
        Auto-Stake for token options as reward
      </Text>
    </RadioCircle>
  )

  const UnderwritingForeword: React.FC = () => (
    <>
      <Text t4 bold textAlignCenter width={270} style={{ margin: '7px auto' }}>
        Once you deposit into this pool, you cannot withdraw from it for at least {timeToDateText(cooldownMin)}. This is
        to avoid economic exploit of underwriters not paying out claims.
      </Text>
      <Text textAlignCenter t4 warning width={270} style={{ margin: '7px auto' }}>
        Disclaimer: The underwriting pool backs the risk of coverage policies, so in case one of the covered protocols
        get exploited, the claims will be paid out from this source of funds.
      </Text>
      <AutoStakeOption />
    </>
  )

  const CooldownForword: React.FC = () => (
    <Text t4 bold textAlignCenter width={270} style={{ margin: '7px auto' }}>
      Note: You will not be able to deposit or withdraw CP tokens via the Options Farming Pool during a thaw.
    </Text>
  )

  return (
    <Modal
      isOpen={isOpen}
      handleClose={handleClose}
      modalTitle={modalTitle}
      disableCloseButton={modalLoading && !canCloseOnLoading}
    >
      <Erc20InputPanel
        unit={getUnit(func, activeNetwork)}
        availableBalance={func ? truncateBalance(formatUnits(getAssetBalanceByFunc(), currencyDecimals)) : '0'}
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
      {func == FunctionName.DEPOSIT_ETH && <UnderwritingForeword />}
      {isStaking && !canTransfer && (
        <Text t4 bold textAlignCenter width={270} style={{ margin: '7px auto' }} warning>
          Staking during a thaw will stop the thaw.
        </Text>
      )}
      {modalLoading ? (
        <Loader />
      ) : func == FunctionName.WITHDRAW_ETH ? (
        <>
          <CooldownForword />
          {canWithdrawEth && (
            <Box success glow mt={20} mb={20}>
              <Text t3 bold autoAlign light>
                You can withdraw now!
              </Text>
            </Box>
          )}
          {cooldownStarted && timeWaited < cooldownMin && (
            <Box color1 mt={20} mb={20}>
              <Text t3 bold autoAlign light>
                Thaw Elapsing...
              </Text>
            </Box>
          )}
          <Box info>
            <BoxItem>
              <BoxItemTitle t4 textAlignCenter light>
                Minimum Thaw Period
              </BoxItemTitle>
              <Text t4 textAlignCenter light>
                {getTimeFromMillis(cooldownMin)}
              </Text>
            </BoxItem>
            {cooldownStarted && (
              <BoxItem>
                <BoxItemTitle t4 textAlignCenter light>
                  Time waited
                </BoxItemTitle>
                <Text t4 textAlignCenter success={canWithdrawEth} light={!canWithdrawEth}>
                  {timeToDate(timeWaited)}
                </Text>
              </BoxItem>
            )}
            <BoxItem>
              <BoxItemTitle t4 textAlignCenter light>
                Maximum Thaw Period
              </BoxItemTitle>
              <Text t4 textAlignCenter light>
                {getTimeFromMillis(cooldownMax)}
              </Text>
            </BoxItem>
          </Box>
          {!canWithdrawEth && (
            <ButtonWrapper>
              <Button widthP={100} hidden={modalLoading} disabled={haveErrors} onClick={handleCallbackFunc} info>
                {!cooldownStarted
                  ? 'Start thaw'
                  : timeWaited < cooldownMin
                  ? 'Stop thaw'
                  : cooldownMax < timeWaited
                  ? 'Restart thaw'
                  : 'Unknown error'}
              </Button>
            </ButtonWrapper>
          )}
          {canWithdrawEth && (
            <ButtonWrapper>
              <Button
                widthP={100}
                hidden={modalLoading}
                disabled={isAppropriateAmount(amount, getAssetBalanceByFunc()) || haveErrors}
                onClick={handleCallbackFunc}
                info
              >
                Withdraw
              </Button>
              <Button widthP={100} hidden={modalLoading} onClick={callStopCooldown} info>
                Stop Cooldown
              </Button>
            </ButtonWrapper>
          )}
        </>
      ) : (
        <ButtonWrapper>
          <Button
            widthP={100}
            hidden={modalLoading}
            disabled={(isAppropriateAmount(amount, getAssetBalanceByFunc()) ? false : true) || haveErrors}
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
