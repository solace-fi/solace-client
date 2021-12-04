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
import { Contract } from '@ethersproject/contracts'

/* import managers */
import { useNotifications } from '../../context/NotificationsManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import constants */
import { FunctionName, TransactionCondition, ExplorerscanApi } from '../../constants/enums'
import { LocalTx } from '../../constants/types'

/* import components */
import { Modal, ModalAddendum } from '../molecules/Modal'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Loader } from '../atoms/Loader'
import { GasRadioGroup } from '../molecules/GasRadioGroup'
import { Erc20InputPanel, PoolModalProps } from './PoolModalRouter'
import { Text } from '../atoms/Typography'
import { StyledLinkExternal } from '../atoms/Icon'
import { HyperLink } from '../atoms/Link'

/* import hooks */
import { useUserStakedValue } from '../../hooks/useFarm'
import { useScpBalance } from '../../hooks/useBalance'
import { useTokenAllowance } from '../../hooks/useToken'
import { useCpFarm } from '../../hooks/useCpFarm'
import { useVault } from '../../hooks/useVault'
import { useInputAmount } from '../../hooks/useInputAmount'

/* import utils */
import { getUnit, truncateBalance } from '../../utils/formatting'
import { getExplorerItemUrl } from '../../utils/explorer'

export const CpPoolModal: React.FC<PoolModalProps> = ({ modalTitle, func, isOpen, closeModal }) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/

  const { haveErrors } = useGeneral()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { keyContracts } = useContracts()
  const { cpFarm, vault } = useMemo(() => keyContracts, [keyContracts])
  const { reload } = useCachedData()
  const { makeTxToast } = useNotifications()
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [canCloseOnLoading, setCanCloseOnLoading] = useState<boolean>(false)
  const [isAcceptableAmount, setIsAcceptableAmount] = useState<boolean>(false)

  const { canTransfer } = useVault()
  const cpFarmFunctions = useCpFarm()
  const cpUserStakeValue = useUserStakedValue(cpFarm)
  const scpBalance = useScpBalance()
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
    handleInputChange,
    setMax,
    resetAmount,
  } = useInputAmount()

  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const approval = useTokenAllowance(
    contractForAllowance,
    spenderAddress,
    amount && amount != '.' ? parseUnits(amount, currencyDecimals).toString() : '0'
  )
  const assetBalance = useMemo(() => {
    switch (func) {
      case FunctionName.DEPOSIT_CP:
        return parseUnits(scpBalance, currencyDecimals)
      case FunctionName.WITHDRAW_CP:
      default:
        return parseUnits(cpUserStakeValue, currencyDecimals)
    }
  }, [cpUserStakeValue, currencyDecimals, func, scpBalance])

  /*************************************************************************************

  contract functions

  *************************************************************************************/

  const approve = async () => {
    if (!cpFarm || !vault) return
    setModalLoading(true)
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
    handleClose()
    await handleToast(tx, localTx)
  }

  const _handleContractCallError = (functionName: string, err: any, txType: FunctionName) => {
    handleContractCallError(functionName, err, txType)
    setModalLoading(false)
  }

  const _setMax = () => {
    setMax(assetBalance, currencyDecimals, func, 'cpFarm')
  }

  const handleCallbackFunc = async () => {
    if (func == FunctionName.DEPOSIT_CP) await callDepositCp()
    if (func == FunctionName.WITHDRAW_CP) await callWithdrawCp()
  }

  const handleClose = useCallback(() => {
    resetAmount()
    handleSelectGasChange(gasPrices.selected)
    setModalLoading(false)
    setCanCloseOnLoading(false)
    closeModal()
  }, [closeModal, gasPrices.selected])

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    if (maxSelected) _setMax()
  }, [handleSelectGasChange])

  useEffect(() => {
    setIsAcceptableAmount(isAppropriateAmount(amount, currencyDecimals, assetBalance))
  }, [amount, assetBalance, assetBalance])

  useEffect(() => {
    if (isOpen && vault && cpFarm?.address) {
      setContractForAllowance(vault)
      setSpenderAddress(cpFarm?.address)
    }
  }, [isOpen, cpFarm?.address, vault])

  return (
    <Modal
      isOpen={isOpen}
      handleClose={handleClose}
      modalTitle={modalTitle}
      disableCloseButton={modalLoading && !canCloseOnLoading}
    >
      <Erc20InputPanel
        unit={getUnit(func, activeNetwork)}
        availableBalance={truncateBalance(formatUnits(assetBalance, currencyDecimals))}
        amount={amount}
        handleInputChange={handleInputChange}
        setMax={_setMax}
      />
      <GasRadioGroup
        gasPrices={gasPrices}
        selectedGasOption={selectedGasOption}
        handleSelectGasChange={handleSelectGasChange}
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
          {!approval && (
            <ButtonWrapper>
              <Button widthP={100} disabled={haveErrors} onClick={approve} info>
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
      {cpFarm && (
        <ModalAddendum>
          <HyperLink
            href={getExplorerItemUrl(activeNetwork.explorer.url, cpFarm.address, ExplorerscanApi.ADDRESS)}
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
