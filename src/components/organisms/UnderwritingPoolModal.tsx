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
import React, { useState, useEffect, useCallback } from 'react'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { BigNumber } from 'ethers'

/* import managers */
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import constants */
import { ExplorerscanApi, FunctionName, Unit } from '../../constants/enums'
import { LocalTx } from '../../constants/types'
import { BKPT_3 } from '../../constants'

/* import components */
import { Modal, ModalAddendum } from '../molecules/Modal'
import { RadioCircle, RadioCircleFigure, RadioCircleInput } from '../atoms/Radio'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Loader } from '../atoms/Loader'
import { Text } from '../atoms/Typography'
import { GasRadioGroup } from '../molecules/GasRadioGroup'
import { PoolModalProps } from './PoolModalRouter'
import { Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { Input } from '../atoms/Input'
import { ModalRow, ModalCell } from '../atoms/Modal'
import { StyledLinkExternal } from '../atoms/Icon'
import { HyperLink } from '../atoms/Link'

/* import hooks */
import { useNativeTokenBalance } from '../../hooks/useBalance'
import { useScpBalance } from '../../hooks/useBalance'
import { useCooldown, useVault } from '../../hooks/useVault'
import { useCpFarm } from '../../hooks/useCpFarm'
import { useWindowDimensions } from '../../hooks/useWindowDimensions'
import { useInputAmount } from '../../hooks/useInputAmount'

/* import utils */
import { getUnit, truncateBalance } from '../../utils/formatting'
import { getLongtimeFromMillis, getTimeFromMillis } from '../../utils/time'
import { getExplorerItemUrl } from '../../utils/explorer'

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
  const { canTransfer, vault, depositEth, withdrawEth } = useVault()
  const cpFarmFunctions = useCpFarm()
  const {
    gasConfig,
    gasPrices,
    selectedGasOption,
    amount,
    maxSelected,
    handleSelectGasChange,
    isAppropriateAmount,
    handleToast,
    handleContractCallError,
    calculateMaxAmount,
    handleInputChange,
    setMax,
    setAmount,
    resetAmount,
  } = useInputAmount()

  const { width } = useWindowDimensions()
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [canCloseOnLoading, setCanCloseOnLoading] = useState<boolean>(false)
  const [isStaking, setIsStaking] = useState<boolean>(false)

  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)

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
    handleClose()
    await handleToast(tx, localTx)
  }

  const _handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    handleContractCallError(functionName, err, txType)
    setModalLoading(false)
  }

  const getAssetBalanceByFunc = (f: FunctionName): BigNumber => {
    switch (f) {
      case FunctionName.DEPOSIT_ETH:
        return parseUnits(nativeTokenBalance, currencyDecimals)
      case FunctionName.WITHDRAW_ETH:
      default:
        return parseUnits(scpBalance, currencyDecimals)
    }
  }

  const _setMax = () => {
    setMax(getAssetBalanceByFunc(func), currencyDecimals, func)
  }

  const handleClose = useCallback(() => {
    resetAmount()
    handleSelectGasChange(gasPrices.selected)
    setIsStaking(false)
    setModalLoading(false)
    setCanCloseOnLoading(false)
    closeModal()
  }, [closeModal, gasPrices.selected])

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    if (maxSelected) setAmount(calculateMaxAmount(getAssetBalanceByFunc(func), currencyDecimals, func).toString())
  }, [handleSelectGasChange])

  useEffect(() => {
    setIsAcceptableAmount(isAppropriateAmount(amount, currencyDecimals, getAssetBalanceByFunc(func)))
  }, [amount, func])

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
      <AutoStakeOption />
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
            Available: {truncateBalance(formatUnits(getAssetBalanceByFunc(func), currencyDecimals))}
          </div>
        </ModalCell>
        <ModalCell t3>
          <Button disabled={haveErrors} onClick={_setMax} info>
            MAX
          </Button>
        </ModalCell>
      </ModalRow>
      <GasRadioGroup
        gasPrices={gasPrices}
        selectedGasOption={selectedGasOption}
        handleSelectGasChange={handleSelectGasChange}
        mb={20}
      />
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
              {getAssetBalanceByFunc(func).isZero() && (
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
                    disabled={haveErrors || getAssetBalanceByFunc(func).isZero()}
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
      {vault && (
        <ModalAddendum>
          <HyperLink
            href={getExplorerItemUrl(activeNetwork.explorer.url, vault.address, ExplorerscanApi.ADDRESS)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button>
              Source Contract <StyledLinkExternal size={20} />
            </Button>
          </HyperLink>
        </ModalAddendum>
      )}
    </Modal>
  )
}
