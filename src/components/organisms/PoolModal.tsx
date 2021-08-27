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
import React, { useState, Fragment, useEffect, useCallback } from 'react'

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

/* import constants */
import { ZERO, GAS_LIMIT, POW_NINE, DEADLINE } from '../../constants'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { GasFeeOption, LpTokenInfo } from '../../constants/types'

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
import { FormOption, FormSelect } from '../atoms/Form'
import { Card } from '../atoms/Card'
import { Box, BoxItem, BoxItemTitle } from '../atoms/Box'
import { Heading2, Text3 } from '../atoms/Typography'
import { GeneralElementProps } from '../generalInterfaces'

/* import hooks */
import { useUserStakedValue } from '../../hooks/useFarm'
import { useNativeTokenBalance, useUserWalletLpBalance, useDepositedLpBalance } from '../../hooks/useBalance'
import { useScpBalance } from '../../hooks/useBalance'
import { useTokenAllowance } from '../../hooks/useTokenAllowance'
import { useCooldown } from '../../hooks/useVault'

/* import utils */
import getPermitNFTSignature from '../../utils/signature'
import { hasApproval } from '../../utils'
import { fixed, getGasValue, filteredAmount, getUnit, truncateBalance } from '../../utils/formatting'
import { getTimeFromMillis, timeToDate } from '../../utils/time'
import { NftPosition } from '../molecules/NftPosition'

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

  const { vault, cpFarm, lpFarm, lpToken } = useContracts()
  const { activeNetwork, currencyDecimals, chainId } = useNetwork()
  const { account, errors, library } = useWallet()
  const [amount, setAmount] = useState<string>('')
  const [isStaking, setIsStaking] = useState<boolean>(false)
  const cpUserStakeValue = useUserStakedValue(cpFarm, account)
  const lpUserStakeValue = useUserStakedValue(lpFarm, account)
  const nativeTokenBalance = useNativeTokenBalance()
  const scpBalance = useScpBalance()
  const userLpTokenInfo = useUserWalletLpBalance()
  const depositedLpTokenInfo = useDepositedLpBalance()
  const { addLocalTransactions, reload, gasPrices } = useCachedData()
  const [selectedGasOption, setSelectedGasOption] = useState<GasFeeOption>(gasPrices.selected)
  const [maxSelected, setMaxSelected] = useState<boolean>(false)
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const tokenAllowance = useTokenAllowance(contractForAllowance, spenderAddress)
  const { makeTxToast } = useToasts()
  const { cooldownStarted, timeWaited, cooldownMin, cooldownMax, canWithdrawEth } = useCooldown()
  const [nft, setNft] = useState<BN>(ZERO)
  const [nftSelection, setNftSelection] = useState<string>('')

  /*************************************************************************************

  contract functions

  *************************************************************************************/

  const callStartCooldown = async () => {
    setModalLoading(true)
    if (!vault) return
    const txType = FunctionName.START_COOLDOWN
    try {
      const tx = await vault.startCooldown()
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: truncateBalance(amount),
        status: TransactionCondition.PENDING,
        unit: getUnit(func, activeNetwork),
      }
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
      console.log('callStartCooldown', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  const callStopCooldown = async () => {
    setModalLoading(true)
    if (!vault) return
    const txType = FunctionName.STOP_COOLDOWN
    try {
      const tx = await vault.stopCooldown()
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: truncateBalance(amount),
        status: TransactionCondition.PENDING,
        unit: getUnit(func, activeNetwork),
      }
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
      console.log('callStopCooldown', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  const callDeposit = async () => {
    setModalLoading(true)
    if (!vault) return
    const txType = FunctionName.DEPOSIT_ETH
    try {
      const tx = await vault.depositEth({
        value: parseUnits(amount, currencyDecimals),
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: truncateBalance(amount),
        status: TransactionCondition.PENDING,
        unit: getUnit(func, activeNetwork),
      }
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
      console.log('callDeposit', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  const callDepositEth = async () => {
    setModalLoading(true)
    if (!cpFarm) return
    const txType = FunctionName.DEPOSIT_ETH
    try {
      const tx = await cpFarm.depositEth({
        value: parseUnits(amount, currencyDecimals),
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: truncateBalance(amount),
        status: TransactionCondition.PENDING,
        unit: getUnit(func, activeNetwork),
      }
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
      console.log('callDepositEth', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
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
      console.log('approve', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  const callDepositCp = async () => {
    setModalLoading(true)
    if (!cpFarm || !vault) return
    const txType = FunctionName.DEPOSIT_CP
    try {
      const tx = await cpFarm.depositCp(parseUnits(amount, currencyDecimals), {
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: truncateBalance(amount),
        status: TransactionCondition.PENDING,
        unit: getUnit(func, activeNetwork),
      }
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
      console.log('callDepositCp', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  const callWithdrawEth = async () => {
    setModalLoading(true)
    if (!vault || !canWithdrawEth) return
    const txType = FunctionName.WITHDRAW_ETH
    try {
      const tx = await vault.withdrawEth(parseUnits(amount, currencyDecimals), {
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: truncateBalance(amount),
        status: TransactionCondition.PENDING,
        unit: getUnit(func, activeNetwork),
      }
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
      console.log('callWithdrawEth', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  const callWithdrawCp = async () => {
    setModalLoading(true)
    if (!cpFarm) return
    const txType = FunctionName.WITHDRAW_CP
    try {
      const tx = await cpFarm.withdrawCp(parseUnits(amount, currencyDecimals), {
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: truncateBalance(amount),
        status: TransactionCondition.PENDING,
        unit: getUnit(func, activeNetwork),
      }
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
      console.log('callWithdrawCp', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  const callDepositLp = async () => {
    setModalLoading(true)
    if (!lpToken || !lpFarm || !nft || !chainId || !account || !library) return
    const txType = FunctionName.DEPOSIT_SIGNED
    try {
      const { v, r, s } = await getPermitNFTSignature(account, chainId, library, lpToken, lpFarm.address, nft, DEADLINE)
      const tx = await lpFarm.depositLpSigned(account, nft, DEADLINE, v, r, s)
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: `#${nft.toString()}`,
        status: TransactionCondition.PENDING,
        unit: getUnit(func, activeNetwork),
      }
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
      console.log('callDepositLp', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  const callWithdrawLp = async () => {
    setModalLoading(true)
    if (!lpFarm) return
    const txType = FunctionName.WITHDRAW_LP
    try {
      const tx = await lpFarm.withdrawLp(nft)
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: `#${nft.toString()}`,
        status: TransactionCondition.PENDING,
        unit: getUnit(func, activeNetwork),
      }
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
      console.log('callWithdrawLp', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  /*************************************************************************************

  local functions

  *************************************************************************************/

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

  const calculateMaxEth = () => {
    const bal = formatUnits(getAssetBalanceByFunc(), currencyDecimals)
    if (func !== FunctionName.DEPOSIT_ETH) return bal
    const gasInEth = (GAS_LIMIT / POW_NINE) * selectedGasOption.value
    return fixed(fixed(bal, 6) - fixed(gasInEth, 6), 6)
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
    setSelectedGasOption(gasPrices.options[1])
    setIsStaking(false)
    setMaxSelected(false)
    setModalLoading(false)
    setNft(ZERO)
    closeModal()
  }, [closeModal, gasPrices.options])

  const handleNft = (target: any) => {
    const info = target.value.split('-')
    setNft(BN.from(info[0]))
    setAmount(info[1])
    setNftSelection(target.value)
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
          setNft(userLpTokenInfo[0].id)
          setAmount(formatUnits(userLpTokenInfo[0].value, currencyDecimals))
          setNftSelection(`${userLpTokenInfo[0].id.toString()}-${userLpTokenInfo[0].value}`)
        }
      }
      if (func == FunctionName.WITHDRAW_LP) {
        if (depositedLpTokenInfo.length > 0) {
          setNft(depositedLpTokenInfo[0].id)
          setAmount(formatUnits(depositedLpTokenInfo[0].value, currencyDecimals))
          setNftSelection(`${depositedLpTokenInfo[0].id.toString()}-${depositedLpTokenInfo[0].value}`)
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
      <div>Automatically stake</div>
    </RadioCircle>
  )

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={modalTitle} disableCloseButton={modalLoading}>
      <Fragment>
        <ModalRow>
          <ModalCell t2>{getUnit(func, activeNetwork)}</ModalCell>
          {func == FunctionName.DEPOSIT_SIGNED || func == FunctionName.WITHDRAW_LP ? (
            <ModalCell>
              <FormSelect value={nftSelection} onChange={(e) => handleNft(e.target)}>
                {getAssetTokensByFunc().map((token) => (
                  <FormOption
                    key={token.id.toString()}
                    value={`${token.id.toString()}-${formatUnits(token.value, currencyDecimals)}`}
                  >
                    #{token.id.toString()} - {truncateBalance(formatUnits(token.value, currencyDecimals))}
                  </FormOption>
                ))}
              </FormSelect>
              <div style={{ position: 'absolute', top: '70%' }}>
                Available: {func ? truncateBalance(formatUnits(getAssetBalanceByFunc(), currencyDecimals), 6) : 0}
              </div>
            </ModalCell>
          ) : (
            <Fragment>
              <ModalCell>
                <Input
                  widthP={100}
                  t2
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
            </Fragment>
          )}
        </ModalRow>
        {(func == FunctionName.DEPOSIT_SIGNED || func == FunctionName.WITHDRAW_LP) && (
          <div style={{ marginBottom: '20px' }}>
            {getAssetTokensByFunc().length == 0 ? null : (
              <ModalCell style={{ justifyContent: 'center' }} p={0}>
                <NftPosition tokenId={nft} />
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
                  <Box green glow mt={20} mb={20}>
                    <Heading2 autoAlign>You can withdraw now!</Heading2>
                  </Box>
                )}
                {cooldownStarted && timeWaited < cooldownMin && (
                  <Box mt={20} mb={20}>
                    <Heading2 autoAlign>Cooldown Elapsing...</Heading2>
                  </Box>
                )}
                <Box navy>
                  <BoxItem>
                    <BoxItemTitle h3 textAlignCenter>
                      Min Cooldown
                    </BoxItemTitle>
                    <Text3 textAlignCenter>{getTimeFromMillis(cooldownMin)}</Text3>
                  </BoxItem>
                  {cooldownStarted && (
                    <BoxItem>
                      <BoxItemTitle h3 textAlignCenter>
                        Time waited
                      </BoxItemTitle>
                      <Text3 textAlignCenter green={canWithdrawEth}>
                        {timeToDate(timeWaited)}
                      </Text3>
                    </BoxItem>
                  )}
                  <BoxItem>
                    <BoxItemTitle h3 textAlignCenter>
                      Max Cooldown
                    </BoxItemTitle>
                    <Text3 textAlignCenter>{getTimeFromMillis(cooldownMax)}</Text3>
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
