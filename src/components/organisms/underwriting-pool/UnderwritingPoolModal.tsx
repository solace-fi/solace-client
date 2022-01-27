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
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { formatUnits, parseUnits } from '@ethersproject/units'

/* import managers */
import { useNetwork } from '../../../context/NetworkManager'
import { useGeneral } from '../../../context/GeneralManager'
import { useCachedData } from '../../../context/CachedDataManager'

/* import constants */
import { FunctionName, Unit } from '../../../constants/enums'
import { LocalTx } from '../../../constants/types'
import { BKPT_3 } from '../../../constants'
import { FunctionGasLimits } from '../../../constants/mappings/gasMapping'

/* import components */
import { Modal } from '../../molecules/Modal'
import { Button, ButtonWrapper } from '../../atoms/Button'
import { Loader } from '../../atoms/Loader'
import { Text } from '../../atoms/Typography'
import { GasRadioGroup } from '../../molecules/GasRadioGroup'
import { CheckboxOption, PoolModalProps } from '../PoolModalRouter'
import { Box, BoxItem, BoxItemTitle } from '../../atoms/Box'
import { Input } from '../../atoms/Input'
import { ModalRow, ModalCell } from '../../atoms/Modal'
import { SourceContract } from '../SourceContract'

/* import hooks */
import { useNativeTokenBalance } from '../../../hooks/useBalance'
import { useScpBalance } from '../../../hooks/useBalance'
import { useCooldown, useVault } from '../../../hooks/useVault'
import { useCpFarm } from '../../../hooks/useCpFarm'
import { useWindowDimensions } from '../../../hooks/useWindowDimensions'
import { useInputAmount, useTransactionExecution } from '../../../hooks/useInputAmount'

/* import utils */
import { truncateValue } from '../../../utils/formatting'
import { getLongtimeFromMillis, getTimeFromMillis } from '../../../utils/time'

export const UnderwritingPoolModal: React.FC<PoolModalProps> = ({ modalTitle, func, isOpen, closeModal }) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/

  const { haveErrors } = useGeneral()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { gasPrice } = useCachedData()

  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [canCloseOnLoading, setCanCloseOnLoading] = useState<boolean>(false)
  const [isStaking, setIsStaking] = useState<boolean>(false)
  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)

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
  const { canTransfer, vault, depositEth, withdrawEth } = useVault()
  const cpFarmFunctions = useCpFarm()
  const { amount, maxSelected, isAppropriateAmount, handleInputChange, setMax, resetAmount } = useInputAmount()
  const { handleToast, handleContractCallError } = useTransactionExecution()
  const { width } = useWindowDimensions()
  const assetBalance = useMemo(() => {
    switch (func) {
      case FunctionName.DEPOSIT_ETH:
        return parseUnits(nativeTokenBalance, currencyDecimals)
      case FunctionName.WITHDRAW_ETH:
      default:
        return parseUnits(scpBalance, currencyDecimals)
    }
  }, [currencyDecimals, func, nativeTokenBalance, scpBalance])

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
    await depositEth(parseUnits(amount, currencyDecimals))
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callDeposit', err, FunctionName.DEPOSIT_ETH))
  }

  const callDepositEth = async () => {
    setModalLoading(true)
    await cpFarmFunctions
      .depositEth(parseUnits(amount, currencyDecimals))
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callDepositEth', err, FunctionName.DEPOSIT_ETH))
  }

  const callWithdrawEth = async () => {
    setModalLoading(true)
    await withdrawEth(parseUnits(amount, currencyDecimals))
      .then((res) => _handleToast(res.tx, res.localTx))
      .catch((err) => _handleContractCallError('callWithdrawEth', err, FunctionName.WITHDRAW_ETH))
  }

  /*************************************************************************************

  local functions

  *************************************************************************************/

  const _handleToast = async (tx: any, localTx: LocalTx | null) => {
    handleClose()
    await handleToast(tx, localTx)
  }

  const _handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    handleContractCallError(functionName, err, txType)
    setModalLoading(false)
  }

  const _setMax = () => {
    setMax(
      assetBalance,
      currencyDecimals,
      func == FunctionName.DEPOSIT_ETH ? FunctionGasLimits['vault.depositEth'] : undefined
    )
  }

  const handleClose = useCallback(() => {
    resetAmount()
    setIsStaking(false)
    setModalLoading(false)
    setCanCloseOnLoading(false)
    closeModal()
  }, [closeModal])

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    if (maxSelected) _setMax()
  }, [gasPrice])

  useEffect(() => {
    setIsAcceptableAmount(isAppropriateAmount(amount, currencyDecimals, assetBalance))
  }, [amount, assetBalance])

  /*************************************************************************************

    functional components

  *************************************************************************************/

  const UnderwritingForeword: React.FC = () => (
    <>
      <Text t4 bold textAlignCenter width={270} style={{ margin: '7px auto' }}>
        Once you deposit into this pool, you cannot withdraw from it for at least {getLongtimeFromMillis(cooldownMin)}.
        This is to avoid economic exploit of underwriters not paying out claims.
      </Text>
      <Text textAlignCenter t4 width={270} style={{ margin: '7px auto' }}>
        Disclaimer: The underwriting pool backs the risk of coverage policies, so in case one of the covered protocols
        gets exploited, the claims will be paid out from this source of funds.
      </Text>
      {!isStaking && !canTransfer && (
        <Text t4 bold textAlignCenter width={270} style={{ margin: '7px auto' }} warning>
          Depositing into this pool during a thaw will stop the thaw, but auto-staking will not.
        </Text>
      )}
      <CheckboxOption
        jc={'center'}
        isChecked={isStaking}
        setChecked={setIsStaking}
        text={'Autostake for token options as reward'}
      />
    </>
  )

  const CooldownForword: React.FC = () => (
    <>
      <Text textAlignCenter t4 bold width={270} style={{ margin: '7px auto' }}>
        You won&apos;t be able to deposit or withdraw CP tokens via the Options Farming Pool during a thaw.
      </Text>
      <Text textAlignCenter t4 bold width={270} style={{ margin: '7px auto' }}>
        If you stop the thaw between {getLongtimeFromMillis(cooldownMin)} and {getLongtimeFromMillis(cooldownMax)}, you
        will need to restart the thaw if you wish to withdraw again.
      </Text>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      handleClose={handleClose}
      modalTitle={modalTitle}
      disableCloseButton={modalLoading && !canCloseOnLoading}
    >
      <ModalRow>
        <ModalCell t2>{func == FunctionName.DEPOSIT_ETH ? activeNetwork.nativeCurrency.symbol : Unit.SCP}</ModalCell>
        <ModalCell>
          <Input
            widthP={100}
            t3
            textAlignRight
            type="text"
            autoComplete="off"
            autoCorrect="off"
            inputMode="decimal"
            placeholder="0.0"
            minLength={1}
            maxLength={79}
            onChange={(e) => handleInputChange(e.target.value)}
            value={amount}
          />
          <div style={{ position: 'absolute', top: '70%' }}>
            Available: {truncateValue(formatUnits(assetBalance, currencyDecimals))}
          </div>
        </ModalCell>
        <ModalCell t3>
          <Button disabled={haveErrors} onClick={_setMax} info>
            MAX
          </Button>
        </ModalCell>
      </ModalRow>
      {func == FunctionName.DEPOSIT_ETH && <UnderwritingForeword />}
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
                  {getTimeFromMillis(timeWaited)}
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
          {canWithdrawEth ? (
            <ButtonWrapper isColumn={width <= BKPT_3}>
              <Button
                widthP={100}
                hidden={modalLoading}
                disabled={!isAcceptableAmount || haveErrors}
                onClick={callWithdrawEth}
                info
              >
                Withdraw
              </Button>
              <Button widthP={100} hidden={modalLoading} onClick={callStopCooldown} info>
                Stop Thaw
              </Button>
            </ButtonWrapper>
          ) : (
            <>
              {assetBalance.isZero() && (
                <Text t4 bold textAlignCenter width={270} style={{ margin: '7px auto' }} warning>
                  You are trying to start a thaw without any CP tokens in your wallet. Please withdraw them from the
                  Options Farming Pool first.
                </Text>
              )}
              <ButtonWrapper>
                {!cooldownStarted && (
                  <Button
                    widthP={100}
                    hidden={modalLoading}
                    disabled={haveErrors || assetBalance.isZero()}
                    onClick={callStartCooldown}
                    info
                  >
                    Start Thaw
                  </Button>
                )}
                {cooldownStarted && (cooldownMax < timeWaited || timeWaited < cooldownMin) && (
                  <Button widthP={100} hidden={modalLoading} disabled={haveErrors} onClick={callStopCooldown} info>
                    Stop Thaw
                  </Button>
                )}
              </ButtonWrapper>
            </>
          )}
        </>
      ) : (
        <ButtonWrapper>
          <Button
            widthP={100}
            hidden={modalLoading}
            disabled={!isAcceptableAmount || haveErrors}
            onClick={isStaking ? callDepositEth : callDeposit}
            info
          >
            Confirm
          </Button>
        </ButtonWrapper>
      )}
      {vault && <SourceContract contract={vault} />}
    </Modal>
  )
}
