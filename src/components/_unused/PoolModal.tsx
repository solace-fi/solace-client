/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    PoolModal
      hooks
      contract functions
      local functions
      useEffect hooks
      functional components

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
import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import constants */
import { ZERO, GAS_LIMIT, POW_NINE } from '../../constants'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { GasFeeOption, LocalTx, NftTokenInfo } from '../../constants/types'

/* import components */
import { Input } from '../atoms/Input'
import { ModalRow, ModalCell } from '../atoms/Modal'
import { Modal } from '../molecules/Modal'
import { RadioCircle, RadioCircleFigure, RadioCircleInput } from '../atoms/Radio'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Loader } from '../atoms/Loader'
import { Text } from '../atoms/Typography'
import { NftPosition } from '../molecules/NftPosition'
import { StyledSelect } from '../molecules/Select'
import { GasRadioGroup } from '../molecules/GasRadioGroup'
import { PoolModalCooldown } from './PoolModalCooldown'

/* import hooks */
import { useUserStakedValue } from '../../hooks/useFarm'
import {
  useNativeTokenBalance,
  useUserWalletLpBalance,
  useDepositedLpBalance,
  useUserWalletPolicies,
  useDepositedPolicies,
} from '../../hooks/useBalance'
import { useScpBalance } from '../../hooks/useBalance'
import { useTokenAllowance } from '../../hooks/useTokenAllowance'
import { useCooldown, useVault } from '../../hooks/useVault'
import { useGetFunctionGas } from '../../hooks/useGas'
import { useCpFarm } from '../../hooks/useCpFarm'
import { useLpFarm } from '../../hooks/useLpFarm'
import { useSptFarm } from '../../hooks/useSptFarm'

/* import utils */
import { hasApproval } from '../../utils'
import { fixed, filteredAmount, getUnit, truncateBalance } from '../../utils/formatting'
import { timeToDateText } from '../../utils/time'

interface PoolModalProps {
  modalTitle: string
  func: FunctionName
  isOpen: boolean
  closeModal: () => void
}

export const PoolModal: React.FC<PoolModalProps> = ({ modalTitle, func, isOpen, closeModal }) => {
  /*************************************************************************************

  hooks

  *************************************************************************************/

  const { haveErrors, appTheme } = useGeneral()
  const { vault, cpFarm, lpFarm, sptFarm } = useContracts()
  const { activeNetwork, currencyDecimals } = useNetwork()
  const { addLocalTransactions, reload, gasPrices } = useCachedData()
  const { account } = useWallet()
  const cpUserStakeValue = useUserStakedValue(cpFarm, account)
  const lpUserStakeValue = useUserStakedValue(lpFarm, account)
  const sptUserStakeValue = useUserStakedValue(sptFarm, account)
  const nativeTokenBalance = useNativeTokenBalance()
  const scpBalance = useScpBalance()

  const userLpTokenInfo = useUserWalletLpBalance()
  const depositedLpTokenInfo = useDepositedLpBalance()
  const userPolicyTokenInfo = useUserWalletPolicies()
  const depositedUserPolicyTokenInfo = useDepositedPolicies()

  const userNftTokenInfo = useMemo(() => {
    let res: NftTokenInfo[] = []
    switch (func) {
      case FunctionName.DEPOSIT_LP_SIGNED:
        res = userLpTokenInfo
        break
      case FunctionName.DEPOSIT_POLICY_SIGNED:
      default:
        res = userPolicyTokenInfo
    }
    return res
  }, [func, userLpTokenInfo, userPolicyTokenInfo])
  const depositedNftTokenInfo = useMemo(() => {
    let res: NftTokenInfo[] = []
    switch (func) {
      case FunctionName.WITHDRAW_LP:
        res = depositedLpTokenInfo
        break
      case FunctionName.WITHDRAW_POLICY:
      default:
        res = depositedUserPolicyTokenInfo
    }
    return res
  }, [func, depositedLpTokenInfo, depositedUserPolicyTokenInfo])
  const funcIsForNft = useMemo(() => {
    switch (func) {
      case FunctionName.DEPOSIT_LP_SIGNED:
      case FunctionName.WITHDRAW_LP:
      case FunctionName.DEPOSIT_POLICY_SIGNED:
      case FunctionName.WITHDRAW_POLICY:
        return true
      default:
        return false
    }
  }, [func])

  const { makeTxToast } = useNotifications()
  const {
    cooldownStarted,
    timeWaited,
    cooldownMin,
    cooldownMax,
    canWithdrawEth,
    startCooldown,
    stopCooldown,
  } = useCooldown()
  const { depositEth, withdrawEth } = useVault()
  const cpFarmFunctions = useCpFarm()
  const { depositLp, withdrawLp } = useLpFarm()
  const { depositPolicy, withdrawPolicy } = useSptFarm()
  const { getGasConfig } = useGetFunctionGas()

  const [amount, setAmount] = useState<string>('')
  const [isStaking, setIsStaking] = useState<boolean>(false)
  const [selectedGasOption, setSelectedGasOption] = useState<GasFeeOption | undefined>(gasPrices.selected)
  const gasConfig = useMemo(() => getGasConfig(selectedGasOption ? selectedGasOption.value : null), [
    selectedGasOption,
    getGasConfig,
  ])
  const [maxSelected, setMaxSelected] = useState<boolean>(false)
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [canCloseOnLoading, setCanCloseOnLoading] = useState<boolean>(false)
  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const tokenAllowance = useTokenAllowance(contractForAllowance, spenderAddress)
  const [nftId, setNftId] = useState<BigNumber>(ZERO)
  const [nftSelection, setNftSelection] = useState<{ value: string; label: string }>({ value: '', label: '' })

  /*************************************************************************************

  contract functions

  *************************************************************************************/

  const callStartCooldown = async () => {
    setModalLoading(true)
    await startCooldown()
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callStartCooldown', err, FunctionName.START_COOLDOWN))
  }

  const callStopCooldown = async () => {
    setModalLoading(true)
    await stopCooldown()
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callStopCooldown', err, FunctionName.STOP_COOLDOWN))
  }

  const callDeposit = async () => {
    setModalLoading(true)
    await depositEth(
      parseUnits(amount, currencyDecimals),
      `${truncateBalance(amount)} ${getUnit(func, activeNetwork)}`,
      gasConfig
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callDeposit', err, FunctionName.DEPOSIT_ETH))
  }

  const callDepositEth = async () => {
    setModalLoading(true)
    await cpFarmFunctions
      .depositEth(
        parseUnits(amount, currencyDecimals),
        `${truncateBalance(amount)} ${getUnit(func, activeNetwork)}`,
        gasConfig
      )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callDepositEth', err, FunctionName.DEPOSIT_ETH))
  }

  const approve = async () => {
    setModalLoading(true)
    if (!cpFarm || !vault) return
    try {
      const approval = await vault.approve(cpFarm.address, parseUnits(amount, currencyDecimals))
      const approvalHash = approval.hash
      makeTxToast(FunctionName.APPROVE, TransactionCondition.PENDING, approvalHash)
      setCanCloseOnLoading(true)
      await approval.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(FunctionName.APPROVE, status, approvalHash)
        reload()
      })
      setCanCloseOnLoading(false)
      setModalLoading(false)
    } catch (err) {
      handleContractCallError('approve', err, FunctionName.APPROVE)
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
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callDepositCp', err, FunctionName.DEPOSIT_CP))
  }

  const callWithdrawEth = async () => {
    setModalLoading(true)
    if (!canWithdrawEth) return
    await withdrawEth(
      parseUnits(amount, currencyDecimals),
      `${truncateBalance(amount)} ${getUnit(func, activeNetwork)}`,
      gasConfig
    )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callWithdrawEth', err, FunctionName.WITHDRAW_ETH))
  }

  const callWithdrawCp = async () => {
    setModalLoading(true)
    await cpFarmFunctions
      .withdrawCp(
        parseUnits(amount, currencyDecimals),
        `${truncateBalance(amount)} ${getUnit(func, activeNetwork)}`,
        gasConfig
      )
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callWithdrawCp', err, FunctionName.WITHDRAW_CP))
  }

  const callDepositLp = async () => {
    setModalLoading(true)
    await depositLp(nftId, gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callDepositLp', err, FunctionName.DEPOSIT_LP_SIGNED))
  }

  const callWithdrawLp = async () => {
    setModalLoading(true)
    await withdrawLp(nftId, gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callWithdrawLp', err, FunctionName.WITHDRAW_LP))
  }

  const callDepositPolicy = async () => {
    setModalLoading(true)
    await depositPolicy(nftId, gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callDepositPolicy', err, FunctionName.DEPOSIT_POLICY_SIGNED))
  }

  const callWithdrawPolicy = async () => {
    setModalLoading(true)
    await withdrawPolicy(nftId, gasConfig)
      .then((res) => handleToast(res.tx, res.localTx))
      .catch((err) => handleContractCallError('callWithdrawPolicy', err, FunctionName.WITHDRAW_POLICY))
  }

  /*************************************************************************************

  local functions

  *************************************************************************************/

  const handleToast = async (tx: any, localTx: LocalTx | null) => {
    if (!tx || !localTx) return
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

  const isAppropriateAmount = () => {
    if (!amount || amount == '.' || parseUnits(amount, currencyDecimals).lte(ZERO)) return false
    return getAssetBalanceByFunc().gte(parseUnits(amount, currencyDecimals))
  }

  const getAssetBalanceByFunc = (): BigNumber => {
    switch (func) {
      case FunctionName.DEPOSIT_ETH:
        return parseUnits(nativeTokenBalance, currencyDecimals)
      case FunctionName.DEPOSIT_CP:
      case FunctionName.WITHDRAW_ETH:
        return parseUnits(scpBalance, currencyDecimals)
      case FunctionName.WITHDRAW_CP:
        return parseUnits(cpUserStakeValue, currencyDecimals)
      case FunctionName.DEPOSIT_LP_SIGNED:
      case FunctionName.DEPOSIT_POLICY_SIGNED:
        return userNftTokenInfo.reduce((a, b) => a.add(b.value), ZERO)
      case FunctionName.WITHDRAW_LP:
        // return depositedNftTokenInfo.reduce((a, b) => a.add(b.value), ZERO)
        return parseUnits(lpUserStakeValue, currencyDecimals)
      case FunctionName.WITHDRAW_POLICY:
        return parseUnits(sptUserStakeValue, currencyDecimals)

      default:
        return BigNumber.from('999999999999999999999999999999999999')
    }
  }

  const getAssetTokensByFunc = (): NftTokenInfo[] => {
    if (func == FunctionName.DEPOSIT_LP_SIGNED || func == FunctionName.DEPOSIT_POLICY_SIGNED) return userNftTokenInfo
    if (func == FunctionName.WITHDRAW_LP || func == FunctionName.WITHDRAW_POLICY) return depositedNftTokenInfo
    return []
  }

  const calculateMaxEth = (): string | number => {
    const bal = formatUnits(getAssetBalanceByFunc(), currencyDecimals)
    if (func !== FunctionName.DEPOSIT_ETH || !selectedGasOption) return bal
    const gasInEth = (GAS_LIMIT / POW_NINE) * selectedGasOption.value
    return Math.max(fixed(fixed(bal, 6) - fixed(gasInEth, 6), 6), 0)
  }

  const handleSelectChange = (option: GasFeeOption) => setSelectedGasOption(option)

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
    if (func == FunctionName.DEPOSIT_CP) await callDepositCp()
    if (func == FunctionName.WITHDRAW_CP) await callWithdrawCp()
    if (func == FunctionName.DEPOSIT_LP_SIGNED) await callDepositLp()
    if (func == FunctionName.WITHDRAW_LP) await callWithdrawLp()
    if (func == FunctionName.DEPOSIT_POLICY_SIGNED) await callDepositPolicy()
    if (func == FunctionName.WITHDRAW_POLICY) await callWithdrawPolicy()
  }

  const handleClose = useCallback(() => {
    setAmount('')
    setSelectedGasOption(gasPrices.selected)
    setIsStaking(false)
    setMaxSelected(false)
    setModalLoading(false)
    setCanCloseOnLoading(false)
    setNftId(ZERO)
    setNftSelection({ value: '', label: '' })
    closeModal()
  }, [closeModal, gasPrices.selected])

  const handleNft = (target: { value: string; label: string }) => {
    const info = target.label.split(' - ')
    setNftId(BigNumber.from(target.value))
    setAmount(info[1])
    setNftSelection(target)
  }

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    if (!gasPrices.selected) return
    setSelectedGasOption(gasPrices.selected)
  }, [gasPrices])

  useEffect(() => {
    if (maxSelected) {
      const maxEth = calculateMaxEth()
      setAmount(maxEth.toString())
    }
  }, [maxSelected, handleSelectChange])

  useEffect(() => {
    if (isOpen && vault && cpFarm?.address) {
      setContractForAllowance(vault)
      setSpenderAddress(cpFarm?.address)
      if (func == FunctionName.DEPOSIT_LP_SIGNED || func == FunctionName.DEPOSIT_POLICY_SIGNED) {
        if (userNftTokenInfo.length > 0) {
          setNftId(userNftTokenInfo[0].id)
          setAmount(formatUnits(userNftTokenInfo[0].value, currencyDecimals))
          setNftSelection({
            value: `${userNftTokenInfo[0].id.toString()}`,
            label: `#${userNftTokenInfo[0].id.toString()} - ${formatUnits(
              userNftTokenInfo[0].value,
              currencyDecimals
            )}`,
          })
        }
      }
      if (func == FunctionName.WITHDRAW_LP || func == FunctionName.WITHDRAW_POLICY) {
        if (depositedNftTokenInfo.length > 0) {
          setNftId(depositedNftTokenInfo[0].id)
          setAmount(formatUnits(depositedNftTokenInfo[0].value, currencyDecimals))
          setNftSelection({
            value: `${depositedNftTokenInfo[0].id.toString()}`,
            label: `#${depositedNftTokenInfo[0].id.toString()} - ${formatUnits(
              depositedNftTokenInfo[0].value,
              currencyDecimals
            )}`,
          })
        }
      }
    }
  }, [isOpen, cpFarm?.address, vault, userNftTokenInfo, depositedNftTokenInfo, func, currencyDecimals])

  /*************************************************************************************

    functional components

  *************************************************************************************/

  const AutoStakeOption: React.FC = () => (
    <RadioCircle style={{ justifyContent: 'center', marginTop: '10px' }}>
      <RadioCircleInput type="checkbox" checked={isStaking} onChange={(e) => setIsStaking(e.target.checked)} />
      <RadioCircleFigure />
      <Text info={appTheme == 'light'} textAlignCenter t3>
        Auto-Stake for token options as reward
      </Text>
    </RadioCircle>
  )

  const Erc721InputPanel: React.FC = () => (
    <>
      <ModalRow style={{ display: 'block' }}>
        <ModalCell t2>{getUnit(func, activeNetwork)}</ModalCell>
        <ModalCell style={{ display: 'block' }}>
          <StyledSelect
            value={nftSelection}
            onChange={handleNft}
            options={getAssetTokensByFunc().map((token) => ({
              value: `${token.id.toString()}`,
              label: `#${token.id.toString()} - ${formatUnits(token.value, currencyDecimals)}`,
            }))}
          />
          <div style={{ position: 'absolute', top: '77%' }}>
            Available: {func ? truncateBalance(formatUnits(getAssetBalanceByFunc(), currencyDecimals)) : 0}
          </div>
        </ModalCell>
      </ModalRow>
      <div style={{ marginBottom: '20px' }}>
        {getAssetTokensByFunc().length > 0 &&
        (func == FunctionName.DEPOSIT_LP_SIGNED || func == FunctionName.WITHDRAW_LP) ? (
          <ModalCell style={{ justifyContent: 'center' }} p={0}>
            <NftPosition tokenId={nftId} />
          </ModalCell>
        ) : null}
      </div>
    </>
  )

  const Erc20InputPanel: React.FC = () => (
    <ModalRow>
      <ModalCell t2>{getUnit(func, activeNetwork)}</ModalCell>
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
          onChange={(e) => {
            setAmount(filteredAmount(e.target.value, amount))
            setMaxSelected(false)
          }}
          value={amount}
        />
        <div style={{ position: 'absolute', top: '70%' }}>
          Available: {func ? truncateBalance(formatUnits(getAssetBalanceByFunc(), currencyDecimals)) : 0}
        </div>
      </ModalCell>
      <ModalCell t3>
        <Button
          disabled={haveErrors}
          onClick={() => {
            setAmount(calculateMaxEth().toString())
            setMaxSelected(true)
          }}
          info
        >
          MAX
        </Button>
      </ModalCell>
    </ModalRow>
  )

  const UnderwritingForeword: React.FC = () => (
    <>
      <Text t4 bold info textAlignCenter width={270} style={{ margin: '7px auto' }}>
        Note: Once you deposit into this pool, you cannot withdraw from it for at least {timeToDateText(cooldownMin)}.
        This is to avoid economic exploit of underwriters not paying out claims.
      </Text>
      <Text textAlignCenter t4 warning width={270} style={{ margin: '7px auto' }}>
        Disclaimer: The underwriting pool backs the risk of coverage policies, so in case one of the covered protocols
        get exploited, the claims will be paid out from this source of funds.
      </Text>
      <AutoStakeOption />
    </>
  )

  const CpApprovalButtonGroup: React.FC = () => (
    <Fragment>
      {!hasApproval(tokenAllowance, amount && amount != '.' ? parseUnits(amount, currencyDecimals).toString() : '0') &&
        tokenAllowance != '' && (
          <ButtonWrapper>
            <Button
              widthP={100}
              disabled={(isAppropriateAmount() ? false : true) || haveErrors}
              onClick={() => approve()}
              info
            >
              Approve
            </Button>
          </ButtonWrapper>
        )}
      <ButtonWrapper>
        <Button
          widthP={100}
          hidden={modalLoading}
          disabled={
            (isAppropriateAmount() ? false : true) ||
            !hasApproval(
              tokenAllowance,
              amount && amount != '.' ? parseUnits(amount, currencyDecimals).toString() : '0'
            ) ||
            haveErrors
          }
          onClick={handleCallbackFunc}
          info
        >
          Confirm
        </Button>
      </ButtonWrapper>
    </Fragment>
  )

  return (
    <Modal
      isOpen={isOpen}
      handleClose={handleClose}
      modalTitle={modalTitle}
      disableCloseButton={modalLoading && !canCloseOnLoading}
    >
      <Fragment>
        {funcIsForNft ? <Erc721InputPanel /> : <Erc20InputPanel />}
        <GasRadioGroup
          gasPrices={gasPrices}
          selectedGasOption={selectedGasOption}
          handleSelectChange={handleSelectChange}
          mb={20}
        />
        {func == FunctionName.DEPOSIT_ETH && <UnderwritingForeword />}
        {!modalLoading ? (
          <Fragment>
            {func == FunctionName.DEPOSIT_CP ? (
              <CpApprovalButtonGroup />
            ) : func == FunctionName.WITHDRAW_ETH ? (
              <PoolModalCooldown
                isAppropriateAmount={isAppropriateAmount() ? false : true}
                handleCallbackFunc={handleCallbackFunc}
                modalLoading={modalLoading}
                cd={{
                  cooldownStarted,
                  timeWaited,
                  cooldownMin,
                  cooldownMax,
                  canWithdrawEth,
                }}
              />
            ) : (
              <ButtonWrapper>
                <Button
                  widthP={100}
                  hidden={modalLoading}
                  disabled={(isAppropriateAmount() ? false : true) || haveErrors}
                  onClick={handleCallbackFunc}
                  info
                >
                  Confirm
                </Button>
              </ButtonWrapper>
            )}
          </Fragment>
        ) : (
          <Loader />
        )}
      </Fragment>
    </Modal>
  )
}
