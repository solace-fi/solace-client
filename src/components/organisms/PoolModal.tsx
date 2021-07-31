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
import { formatEther, parseEther } from '@ethersproject/units'
import { BigNumber as BN } from 'ethers'
import { Contract } from '@ethersproject/contracts'

/* import managers */
import { useToasts } from '../../context/NotificationsManager'
import { useCachedData } from '../../context/CachedDataManager'
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'

/* import constants */
import { ZERO, GAS_LIMIT, POW_NINE, DEADLINE, DEFAULT_CHAIN_ID } from '../../constants'
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

/* import hooks */
import { useUserStakedValue } from '../../hooks/useFarm'
import { useNativeTokenBalance, useUserWalletLpBalance, useDepositedLpBalance } from '../../hooks/useBalance'
import { useScpBalance } from '../../hooks/useBalance'
import { useTokenAllowance } from '../../hooks/useTokenAllowance'

/* import utils */
import getPermitNFTSignature from '../../utils/signature'
import { hasApproval } from '../../utils'
import { fixed, getGasValue, filteredAmount, getUnit, truncateBalance } from '../../utils/formatting'

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
  const { account, chainId, errors, library } = useWallet()
  const [amount, setAmount] = useState<string>('')
  const [isStaking, setIsStaking] = useState<boolean>(false)
  const cpUserStakeValue = useUserStakedValue(cpFarm, account)
  // const lpUserStakeValue = useUserStakedValue(lpFarm, account)
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
  const maxLoss = 5
  const [nft, setNft] = useState<BN>(ZERO)
  const [nftSelection, setNftSelection] = useState<string>('')

  /*************************************************************************************

  contract functions

  *************************************************************************************/

  const callDeposit = async () => {
    setModalLoading(true)
    if (!vault) return
    const txType = FunctionName.DEPOSIT
    try {
      const tx = await vault.deposit({
        value: parseEther(amount),
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: truncateBalance(amount),
        status: TransactionCondition.PENDING,
        unit: getUnit(func, chainId ?? DEFAULT_CHAIN_ID),
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
        value: parseEther(amount),
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: truncateBalance(amount),
        status: TransactionCondition.PENDING,
        unit: getUnit(func, chainId ?? DEFAULT_CHAIN_ID),
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
      const approval = await vault.approve(cpFarm.address, parseEther(amount))
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
      const tx = await cpFarm.depositCp(parseEther(amount), {
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: truncateBalance(amount),
        status: TransactionCondition.PENDING,
        unit: getUnit(func, chainId ?? DEFAULT_CHAIN_ID),
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

  const callWithdraw = async () => {
    setModalLoading(true)
    if (!vault) return
    const txType = FunctionName.WITHDRAW
    try {
      const tx = await vault.withdraw(parseEther(amount), maxLoss, {
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: truncateBalance(amount),
        status: TransactionCondition.PENDING,
        unit: getUnit(func, chainId ?? DEFAULT_CHAIN_ID),
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
      console.log('callWithdraw', err)
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  const callWithdrawEth = async () => {
    setModalLoading(true)
    if (!cpFarm) return
    const txType = FunctionName.WITHDRAW_ETH
    try {
      const tx = await cpFarm.withdrawEth(parseEther(amount), maxLoss, {
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: truncateBalance(amount),
        status: TransactionCondition.PENDING,
        unit: getUnit(func, chainId ?? DEFAULT_CHAIN_ID),
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

  const callDepositLp = async () => {
    setModalLoading(true)
    if (!lpToken || !lpFarm || !nft || !chainId || !account || !library) return
    const txType = FunctionName.DEPOSIT_SIGNED
    try {
      const { v, r, s } = await getPermitNFTSignature(account, chainId, library, lpToken, lpFarm.address, nft, DEADLINE)
      const tx = await lpFarm.depositSigned(account, nft, DEADLINE, v, r, s)
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: `#${nft.toString()}`,
        status: TransactionCondition.PENDING,
        unit: getUnit(func, chainId ?? DEFAULT_CHAIN_ID),
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
      const tx = await lpFarm.withdraw(nft)
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: `#${nft.toString()}`,
        status: TransactionCondition.PENDING,
        unit: getUnit(func, chainId ?? DEFAULT_CHAIN_ID),
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
    if (!amount || amount == '.' || parseEther(amount).lte(ZERO)) return false
    return getAssetBalanceByFunc().gte(parseEther(amount))
  }

  const getAssetBalanceByFunc = (): BN => {
    switch (func) {
      case FunctionName.DEPOSIT:
        return parseEther(nativeTokenBalance)
      case FunctionName.DEPOSIT_CP:
      case FunctionName.WITHDRAW:
        return parseEther(scpBalance)
      case FunctionName.WITHDRAW_ETH:
        return parseEther(cpUserStakeValue)
      case FunctionName.DEPOSIT_SIGNED:
        return userLpTokenInfo.reduce((a, b) => a.add(b.value), ZERO)
      case FunctionName.WITHDRAW_LP:
        return depositedLpTokenInfo.reduce((a, b) => a.add(b.value), ZERO)
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
    const bal = formatEther(getAssetBalanceByFunc())
    if (func !== FunctionName.DEPOSIT && func !== FunctionName.DEPOSIT_ETH) return bal
    const gasInEth = (GAS_LIMIT / POW_NINE) * selectedGasOption.value
    return fixed(fixed(parseFloat(bal), 6) - fixed(gasInEth, 6), 6)
  }

  const handleSelectChange = (option: GasFeeOption) => {
    setSelectedGasOption(option)
  }

  const handleCallbackFunc = async () => {
    if (!func) return
    switch (func) {
      case FunctionName.DEPOSIT:
        isStaking ? await callDepositEth() : await callDeposit()
        break
      case FunctionName.WITHDRAW:
        await callWithdraw()
        break
      case FunctionName.DEPOSIT_CP:
        await callDepositCp()
        break
      case FunctionName.WITHDRAW_ETH:
        await callWithdrawEth()
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
  }, [handleSelectChange])

  useEffect(() => {
    if (isOpen && vault && cpFarm?.address) {
      setContractForAllowance(vault)
      setSpenderAddress(cpFarm?.address)
      if (func == FunctionName.DEPOSIT_SIGNED) {
        if (userLpTokenInfo.length > 0) {
          setNft(userLpTokenInfo[0].id)
          setAmount(formatEther(userLpTokenInfo[0].value))
          setNftSelection(`${userLpTokenInfo[0].id.toString()}-${userLpTokenInfo[0].value}`)
        }
      }
      if (func == FunctionName.WITHDRAW_LP) {
        if (depositedLpTokenInfo.length > 0) {
          setNft(depositedLpTokenInfo[0].id)
          setAmount(formatEther(depositedLpTokenInfo[0].value))
          setNftSelection(`${depositedLpTokenInfo[0].id.toString()}-${depositedLpTokenInfo[0].value}`)
        }
      }
    }
  }, [isOpen, cpFarm?.address, vault])

  /*************************************************************************************

    functional components

  *************************************************************************************/

  const GasRadioGroup: React.FC = () => (
    <RadioGroup>
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
  )

  const AutoStakeOption: React.FC = () => (
    <ModalRow>
      <ModalCell>
        <RadioCircle>
          <RadioCircleInput type="checkbox" checked={isStaking} onChange={(e) => setIsStaking(e.target.checked)} />
          <RadioCircleFigure />
          <div>Automatically stake</div>
        </RadioCircle>
      </ModalCell>
    </ModalRow>
  )

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={modalTitle} disableCloseButton={modalLoading}>
      <Fragment>
        <ModalRow>
          <ModalCell t2>{getUnit(func, chainId ?? DEFAULT_CHAIN_ID)}</ModalCell>
          {func == FunctionName.DEPOSIT_SIGNED || func == FunctionName.WITHDRAW_LP ? (
            <ModalCell>
              <FormSelect value={nftSelection} onChange={(e) => handleNft(e.target)}>
                {getAssetTokensByFunc().map((token) => (
                  <FormOption key={token.id.toString()} value={`${token.id.toString()}-${formatEther(token.value)}`}>
                    #{token.id.toString()} - {truncateBalance(formatEther(token.value))}
                  </FormOption>
                ))}
              </FormSelect>
              <div style={{ position: 'absolute', top: '70%' }}>
                Available: {func ? truncateBalance(formatEther(getAssetBalanceByFunc()), 6) : 0}
              </div>
            </ModalCell>
          ) : (
            <Fragment>
              <ModalCell>
                <Input
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
                  Available: {func ? truncateBalance(formatEther(getAssetBalanceByFunc()), 6) : 0}
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
        <GasRadioGroup />
        {(func == FunctionName.DEPOSIT || func == FunctionName.DEPOSIT_ETH) && <AutoStakeOption />}
        <ButtonWrapper>
          {!modalLoading ? (
            <Fragment>
              {func == FunctionName.DEPOSIT_CP ? (
                <Fragment>
                  {!hasApproval(tokenAllowance, amount && amount != '.' ? parseEther(amount).toString() : '0') &&
                    tokenAllowance != '' && (
                      <Button
                        disabled={(isAppropriateAmount() ? false : true) || errors.length > 0}
                        onClick={() => approve()}
                      >
                        Approve
                      </Button>
                    )}
                  <Button
                    hidden={modalLoading}
                    disabled={
                      (isAppropriateAmount() ? false : true) ||
                      !hasApproval(tokenAllowance, amount && amount != '.' ? parseEther(amount).toString() : '0') ||
                      errors.length > 0
                    }
                    onClick={handleCallbackFunc}
                  >
                    Confirm
                  </Button>
                </Fragment>
              ) : (
                <Button
                  hidden={modalLoading}
                  disabled={(isAppropriateAmount() ? false : true) || errors.length > 0}
                  onClick={handleCallbackFunc}
                >
                  Confirm
                </Button>
              )}
            </Fragment>
          ) : (
            <Loader />
          )}
        </ButtonWrapper>
      </Fragment>
    </Modal>
  )
}
