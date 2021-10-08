/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import managers
    import constants
    import components
    import hooks
    import utils

    PoolModal function
      custom hooks
      contract functions
      local functions
      useEffect hooks
      functional components
      Render

  *************************************************************************************/

/* import react */
import React, { useState, Fragment, useEffect, useCallback, useMemo } from 'react'

/* import packages */
import { formatUnits, parseUnits } from '@ethersproject/units'
import { BigNumber as BN } from 'ethers'
import { Contract } from '@ethersproject/contracts'

/* import managers */
import { useToasts } from '../../context/NotificationsManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'
import { useNetwork } from '../../context/NetworkManager'
import { useGeneral } from '../../context/GeneralProvider'

/* import constants */
import { ZERO, GAS_LIMIT, POW_NINE, DEADLINE } from '../../constants'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { GasFeeOption, LocalTx, LpTokenInfo } from '../../constants/types'

/* import components */
import { Input } from '../atoms/Input'
import { ModalRow, ModalCell } from '../atoms/Modal'
import { Modal } from '../molecules/Modal'
import {
  RadioElement,
  RadioInput,
  RadioGroup,
  RadioLabel,
  RadioCircle,
  RadioCircleFigure,
  RadioCircleInput,
} from '../atoms/Radio'
import { Button, ButtonWrapper } from '../atoms/Button'
import { Loader } from '../atoms/Loader'
import { Card } from '../atoms/Card'
import { Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { Text } from '../atoms/Typography'
import { NftPosition } from '../molecules/NftPosition'
import { StyledSelect } from '../molecules/Select'
import { GeneralElementProps } from '../generalInterfaces'

/* import hooks */
import { useUserStakedValue } from '../../hooks/useFarm'
import { useNativeTokenBalance, useUserWalletLpBalance, useDepositedLpBalance } from '../../hooks/useBalance'
import { useScpBalance } from '../../hooks/useBalance'
import { useTokenAllowance } from '../../hooks/useTokenAllowance'
import { useCooldown } from '../../hooks/useVault'
import { useGasConfig } from '../../hooks/useGas'

/* import utils */
import getPermitNFTSignature from '../../utils/signature'
import { hasApproval } from '../../utils'
import { fixed, filteredAmount, getUnit, truncateBalance } from '../../utils/formatting'
import { getTimeFromMillis, timeToDate } from '../../utils/time'

interface PoolModalProps {
  modalTitle: string
  func: FunctionName
  isOpen: boolean
  closeModal: () => void
}

export const PoolModal: React.FC<PoolModalProps> = ({ modalTitle, func, isOpen, closeModal }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const { errors, appTheme } = useGeneral()
  const { vault, cpFarm, lpFarm, lpToken } = useContracts()
  const { activeNetwork, currencyDecimals, chainId } = useNetwork()
  const { account, library } = useWallet()
  const [amount, setAmount] = useState<string>('')
  const [isStaking, setIsStaking] = useState<boolean>(false)
  const cpUserStakeValue = useUserStakedValue(cpFarm, account)
  const lpUserStakeValue = useUserStakedValue(lpFarm, account)
  const nativeTokenBalance = useNativeTokenBalance()
  const scpBalance = useScpBalance()
  const userLpTokenInfo = useUserWalletLpBalance()
  const depositedLpTokenInfo = useDepositedLpBalance()
  const { addLocalTransactions, reload, gasPrices } = useCachedData()
  const [selectedGasOption, setSelectedGasOption] = useState<GasFeeOption | undefined>(gasPrices.selected)
  const { gasConfig } = useGasConfig(selectedGasOption ? selectedGasOption.value : null)
  const [maxSelected, setMaxSelected] = useState<boolean>(false)
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const tokenAllowance = useTokenAllowance(contractForAllowance, spenderAddress)
  const { makeTxToast } = useToasts()
  const { cooldownStarted, timeWaited, cooldownMin, cooldownMax, canWithdrawEth } = useCooldown()
  const [nftId, setNftId] = useState<BN>(ZERO)
  const [nftSelection, setNftSelection] = useState<{ value: string; label: string }>({ value: '', label: '' })

  /*************************************************************************************

  contract functions

  *************************************************************************************/

  const callStartCooldown = async () => {
    setModalLoading(true)
    if (!vault) return
    const txType = FunctionName.START_COOLDOWN
    try {
      const tx = await vault.startCooldown()
      const localTx = {
        hash: tx.hash,
        type: txType,
        value: 'Starting Withdrawal Cooldown',
        status: TransactionCondition.PENDING,
        unit: getUnit(func, activeNetwork),
      }
      handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('callStartCooldown', err, txType)
    }
  }

  const callStopCooldown = async () => {
    setModalLoading(true)
    if (!vault) return
    const txType = FunctionName.STOP_COOLDOWN
    try {
      const tx = await vault.stopCooldown()
      const localTx = {
        hash: tx.hash,
        type: txType,
        value: 'Stopping Withdrawal Cooldown',
        status: TransactionCondition.PENDING,
        unit: getUnit(func, activeNetwork),
      }
      handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('callStopCooldown', err, txType)
    }
  }

  const callDeposit = async () => {
    setModalLoading(true)
    if (!vault) return
    const txType = FunctionName.DEPOSIT_ETH
    try {
      const tx = await vault.depositEth({
        value: parseUnits(amount, currencyDecimals),
        ...gasConfig,
        gasLimit: GAS_LIMIT,
      })
      const localTx = {
        hash: tx.hash,
        type: txType,
        value: truncateBalance(amount),
        status: TransactionCondition.PENDING,
        unit: getUnit(func, activeNetwork),
      }
      handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('callDeposit', err, txType)
    }
  }

  const callDepositEth = async () => {
    setModalLoading(true)
    if (!cpFarm) return
    const txType = FunctionName.DEPOSIT_ETH
    try {
      const tx = await cpFarm.depositEth({
        value: parseUnits(amount, currencyDecimals),
        ...gasConfig,
        gasLimit: GAS_LIMIT,
      })
      const localTx = {
        hash: tx.hash,
        type: txType,
        value: truncateBalance(amount),
        status: TransactionCondition.PENDING,
        unit: getUnit(func, activeNetwork),
      }
      handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('callDepositEth', err, txType)
    }
  }

  const approve = async () => {
    setModalLoading(true)
    if (!cpFarm || !vault) return
    const txType = FunctionName.APPROVE
    try {
      const approval = await vault.approve(cpFarm.address, parseUnits(amount, currencyDecimals))
      const approvalHash = approval.hash
      makeTxToast(FunctionName.APPROVE, TransactionCondition.PENDING, approvalHash)
      await approval.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(FunctionName.APPROVE, status, approvalHash)
        reload()
      })
      setModalLoading(false)
    } catch (err) {
      handleContractCallError('approve', err, txType)
    }
  }

  const callDepositCp = async () => {
    setModalLoading(true)
    if (!cpFarm || !vault) return
    const txType = FunctionName.DEPOSIT_CP
    try {
      const tx = await cpFarm.depositCp(parseUnits(amount, currencyDecimals), {
        ...gasConfig,
        gasLimit: GAS_LIMIT,
      })
      const localTx = {
        hash: tx.hash,
        type: txType,
        value: truncateBalance(amount),
        status: TransactionCondition.PENDING,
        unit: getUnit(func, activeNetwork),
      }
      handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('callDepositCp', err, txType)
    }
  }

  const callWithdrawEth = async () => {
    setModalLoading(true)
    if (!vault || !canWithdrawEth) return
    const txType = FunctionName.WITHDRAW_ETH
    try {
      const tx = await vault.withdrawEth(parseUnits(amount, currencyDecimals), {
        ...gasConfig,
        gasLimit: GAS_LIMIT,
      })
      const localTx = {
        hash: tx.hash,
        type: txType,
        value: truncateBalance(amount),
        status: TransactionCondition.PENDING,
        unit: getUnit(func, activeNetwork),
      }
      handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('callWithdrawEth', err, txType)
    }
  }

  const callWithdrawCp = async () => {
    setModalLoading(true)
    if (!cpFarm) return
    const txType = FunctionName.WITHDRAW_CP
    try {
      const tx = await cpFarm.withdrawCp(parseUnits(amount, currencyDecimals), {
        ...gasConfig,
        gasLimit: GAS_LIMIT,
      })
      const localTx = {
        hash: tx.hash,
        type: txType,
        value: truncateBalance(amount),
        status: TransactionCondition.PENDING,
        unit: getUnit(func, activeNetwork),
      }
      handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('callWithdrawCp', err, txType)
    }
  }

  const callDepositLp = async () => {
    setModalLoading(true)
    if (!lpToken || !lpFarm || !nftId || !chainId || !account || !library) return
    const txType = FunctionName.DEPOSIT_SIGNED
    try {
      const { v, r, s } = await getPermitNFTSignature(
        account,
        chainId,
        library,
        lpToken,
        lpFarm.address,
        nftId,
        DEADLINE
      )
      const tx = await lpFarm.depositLpSigned(account, nftId, DEADLINE, v, r, s)
      const localTx = {
        hash: tx.hash,
        type: txType,
        value: `#${nftId.toString()}`,
        status: TransactionCondition.PENDING,
        unit: getUnit(func, activeNetwork),
      }
      handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('callDepositLp', err, txType)
    }
  }

  const callWithdrawLp = async () => {
    setModalLoading(true)
    if (!lpFarm) return
    const txType = FunctionName.WITHDRAW_LP
    try {
      const tx = await lpFarm.withdrawLp(nftId)
      const localTx = {
        hash: tx.hash,
        type: txType,
        value: `#${nftId.toString()}`,
        status: TransactionCondition.PENDING,
        unit: getUnit(func, activeNetwork),
      }
      handleToast(tx, localTx)
    } catch (err) {
      handleContractCallError('callWithdrawLp', err, txType)
    }
  }

  /*************************************************************************************

  local functions

  *************************************************************************************/

  const handleToast = async (tx: any, localTx: LocalTx) => {
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

  const getAssetBalanceByFunc = (): BN => {
    switch (func) {
      case FunctionName.DEPOSIT_ETH:
        return parseUnits(nativeTokenBalance, currencyDecimals)
      case FunctionName.DEPOSIT_CP:
      case FunctionName.WITHDRAW_ETH:
        return parseUnits(scpBalance, currencyDecimals)
      case FunctionName.WITHDRAW_CP:
        return parseUnits(cpUserStakeValue, currencyDecimals)
      case FunctionName.DEPOSIT_SIGNED:
        return userLpTokenInfo.reduce((a, b) => a.add(b.value), ZERO)
      case FunctionName.WITHDRAW_LP:
        // return depositedLpTokenInfo.reduce((a, b) => a.add(b.value), ZERO)
        return parseUnits(lpUserStakeValue, currencyDecimals)
      default:
        return BN.from('999999999999999999999999999999999999')
    }
  }

  const getAssetTokensByFunc = (): LpTokenInfo[] => {
    switch (func) {
      case FunctionName.DEPOSIT_SIGNED:
        return userLpTokenInfo
      case FunctionName.WITHDRAW_LP:
        return depositedLpTokenInfo
      default:
        return []
    }
  }

  const calculateMaxEth = (): string | number => {
    const bal = formatUnits(getAssetBalanceByFunc(), currencyDecimals)
    if (func !== FunctionName.DEPOSIT_ETH || !selectedGasOption) return bal
    const gasInEth = (GAS_LIMIT / POW_NINE) * selectedGasOption.value
    return Math.max(fixed(fixed(bal, 6) - fixed(gasInEth, 6), 6), 0)
  }

  const handleSelectChange = (option: GasFeeOption) => {
    setSelectedGasOption(option)
  }

  const handleCallbackFunc = async () => {
    if (!func) return
    switch (func) {
      case FunctionName.DEPOSIT_ETH:
        isStaking ? await callDepositEth() : await callDeposit()
        break
      case FunctionName.WITHDRAW_ETH:
        if (!cooldownStarted) {
          await callStartCooldown()
          break
        }
        if (canWithdrawEth) {
          await callWithdrawEth()
          break
        }
        if (cooldownMax < timeWaited || timeWaited < cooldownMin) {
          await callStopCooldown()
          break
        }
        break
      case FunctionName.DEPOSIT_CP:
        await callDepositCp()
        break
      case FunctionName.WITHDRAW_CP:
        await callWithdrawCp()
        break
      case FunctionName.DEPOSIT_SIGNED:
        await callDepositLp()
        break
      case FunctionName.WITHDRAW_LP:
        await callWithdrawLp()
        break
    }
  }

  const handleClose = useCallback(() => {
    setAmount('')
    setSelectedGasOption(gasPrices.selected)
    setIsStaking(false)
    setMaxSelected(false)
    setModalLoading(false)
    setNftId(ZERO)
    setNftSelection({ value: '', label: '' })
    closeModal()
  }, [closeModal, gasPrices.selected])

  const handleNft = (target: { value: string; label: string }) => {
    const info = target.label.split(' - ')
    setNftId(BN.from(target.value))
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
      if (func == FunctionName.DEPOSIT_SIGNED) {
        if (userLpTokenInfo.length > 0) {
          setNftId(userLpTokenInfo[0].id)
          setAmount(formatUnits(userLpTokenInfo[0].value, currencyDecimals))
          setNftSelection({
            value: `${userLpTokenInfo[0].id.toString()}`,
            label: `#${userLpTokenInfo[0].id.toString()} - ${formatUnits(userLpTokenInfo[0].value, currencyDecimals)}`,
          })
        }
      }
      if (func == FunctionName.WITHDRAW_LP) {
        if (depositedLpTokenInfo.length > 0) {
          setNftId(depositedLpTokenInfo[0].id)
          setAmount(formatUnits(depositedLpTokenInfo[0].value, currencyDecimals))
          setNftSelection({
            value: `${depositedLpTokenInfo[0].id.toString()}`,
            label: `#${depositedLpTokenInfo[0].id.toString()} - ${formatUnits(
              depositedLpTokenInfo[0].value,
              currencyDecimals
            )}`,
          })
        }
      }
    }
  }, [isOpen, cpFarm?.address, vault, userLpTokenInfo, depositedLpTokenInfo, func, currencyDecimals])

  /*************************************************************************************

    functional components

  *************************************************************************************/

  const GasRadioGroup: React.FC<GeneralElementProps> = (props) => (
    <Card {...props}>
      <RadioGroup m={0}>
        {!gasPrices.loading ? (
          gasPrices.options.map((option: GasFeeOption) => (
            <RadioLabel key={option.key}>
              <RadioInput
                type="radio"
                value={option.value}
                checked={selectedGasOption == option}
                onChange={() => handleSelectChange(option)}
              />
              <RadioElement>
                <div>{option.name}</div>
                <div>{option.value}</div>
              </RadioElement>
            </RadioLabel>
          ))
        ) : (
          <Loader />
        )}
      </RadioGroup>
    </Card>
  )

  const AutoStakeOption: React.FC = () => (
    <RadioCircle style={{ justifyContent: 'center' }}>
      <RadioCircleInput type="checkbox" checked={isStaking} onChange={(e) => setIsStaking(e.target.checked)} />
      <RadioCircleFigure />
      <Text info={appTheme == 'light'}>Earn Solace token options as a reward</Text>
    </RadioCircle>
  )

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={modalTitle} disableCloseButton={modalLoading}>
      <Fragment>
        {func == FunctionName.DEPOSIT_SIGNED || func == FunctionName.WITHDRAW_LP ? (
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
                Available: {func ? truncateBalance(formatUnits(getAssetBalanceByFunc(), currencyDecimals), 6) : 0}
              </div>
            </ModalCell>
          </ModalRow>
        ) : (
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
                Available: {func ? truncateBalance(formatUnits(getAssetBalanceByFunc(), currencyDecimals), 6) : 0}
              </div>
            </ModalCell>
            <ModalCell t3>
              <Button
                disabled={errors.length > 0}
                onClick={() => {
                  setAmount(calculateMaxEth().toString())
                  setMaxSelected(true)
                }}
              >
                MAX
              </Button>
            </ModalCell>
          </ModalRow>
        )}
        {(func == FunctionName.DEPOSIT_SIGNED || func == FunctionName.WITHDRAW_LP) && (
          <div style={{ marginBottom: '20px' }}>
            {getAssetTokensByFunc().length == 0 ? null : (
              <ModalCell style={{ justifyContent: 'center' }} p={0}>
                <NftPosition tokenId={nftId} />
              </ModalCell>
            )}
          </div>
        )}
        <GasRadioGroup mb={20} />
        {func == FunctionName.DEPOSIT_ETH && <AutoStakeOption />}
        {!modalLoading ? (
          <Fragment>
            {func == FunctionName.DEPOSIT_CP ? (
              <Fragment>
                {!hasApproval(
                  tokenAllowance,
                  amount && amount != '.' ? parseUnits(amount, currencyDecimals).toString() : '0'
                ) &&
                  tokenAllowance != '' && (
                    <ButtonWrapper>
                      <Button
                        widthP={100}
                        disabled={(isAppropriateAmount() ? false : true) || errors.length > 0}
                        onClick={() => approve()}
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
                      errors.length > 0
                    }
                    onClick={handleCallbackFunc}
                  >
                    Confirm
                  </Button>
                </ButtonWrapper>
              </Fragment>
            ) : func == FunctionName.WITHDRAW_ETH ? (
              <>
                {canWithdrawEth && (
                  <Box success glow mt={20} mb={20}>
                    <Text t3 bold autoAlign>
                      You can withdraw now!
                    </Text>
                  </Box>
                )}
                {cooldownStarted && timeWaited < cooldownMin && (
                  <Box mt={20} mb={20}>
                    <Text t3 bold autoAlign>
                      Cooldown Elapsing...
                    </Text>
                  </Box>
                )}
                <Box info>
                  <BoxItem>
                    <BoxItemTitle t4 textAlignCenter>
                      Min Cooldown
                    </BoxItemTitle>
                    <Text t4 textAlignCenter>
                      {getTimeFromMillis(cooldownMin)}
                    </Text>
                  </BoxItem>
                  {cooldownStarted && (
                    <BoxItem>
                      <BoxItemTitle t4 textAlignCenter>
                        Time waited
                      </BoxItemTitle>
                      <Text t4 textAlignCenter success={canWithdrawEth}>
                        {timeToDate(timeWaited)}
                      </Text>
                    </BoxItem>
                  )}
                  <BoxItem>
                    <BoxItemTitle t4 textAlignCenter>
                      Max Cooldown
                    </BoxItemTitle>
                    <Text t4 textAlignCenter>
                      {getTimeFromMillis(cooldownMax)}
                    </Text>
                  </BoxItem>
                </Box>
                {!canWithdrawEth && (
                  <ButtonWrapper>
                    <Button
                      widthP={100}
                      hidden={modalLoading}
                      disabled={errors.length > 0}
                      onClick={handleCallbackFunc}
                    >
                      {!cooldownStarted
                        ? 'Start cooldown'
                        : timeWaited < cooldownMin
                        ? 'Stop cooldown'
                        : cooldownMax < timeWaited
                        ? 'Restart cooldown'
                        : 'Unknown error'}
                    </Button>
                  </ButtonWrapper>
                )}
                {canWithdrawEth && (
                  <ButtonWrapper>
                    <Button
                      widthP={100}
                      hidden={modalLoading}
                      disabled={(isAppropriateAmount() ? false : true) || errors.length > 0}
                      onClick={handleCallbackFunc}
                    >
                      Withdraw
                    </Button>
                  </ButtonWrapper>
                )}
              </>
            ) : (
              <ButtonWrapper>
                <Button
                  widthP={100}
                  hidden={modalLoading}
                  disabled={(isAppropriateAmount() ? false : true) || errors.length > 0}
                  onClick={handleCallbackFunc}
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
