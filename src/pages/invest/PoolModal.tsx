import React, { useState, Fragment, useEffect } from 'react'
import { Input } from '../../components/Input'
import { ModalRow, ModalCell } from '../../components/Modal'
import { Modal } from '../../components/Modal/Modal'
import { RadioElement, RadioInput, RadioGroup, RadioLabel } from '../../components/Radio'
import { RadioCircle, RadioCircleFigure, RadioCircleInput } from '../../components/Radio/RadioCircle'
import { Button, ButtonWrapper } from '../../components/Button'
import { formatEther, parseEther } from '@ethersproject/units'
import { BigNumberish, BigNumber as BN } from 'ethers'
import { ZERO, GAS_LIMIT, POW_NINE, DEADLINE } from '../../constants'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { useContracts } from '../../context/ContractsManager'
import { useUserStakedValue } from '../../hooks/useFarm'
import { useNativeTokenBalance } from '../../hooks/useNativeTokenBalance'
import { useScpBalance } from '../../hooks/useVault'
import { fixed, getGasValue, filteredAmount, getUnit, truncateBalance } from '../../utils/formatting'
import { GasFeeOption } from '../../constants/types'
import { useWallet } from '../../context/WalletManager'
import { useTokenAllowance } from '../../hooks/useTokenAllowance'
import { Contract } from '@ethersproject/contracts'
import { useToasts } from '../../context/NotificationsManager'
import { useCachedData } from '../../context/CachedDataManager'
import getPermitNFTSignature from '../../utils/signature'
import { FeeAmount, TICK_SPACINGS, getMaxTick, getMinTick } from '../../utils/uniswap'
import { getProviderOrSigner, hasApproval } from '../../utils'
import { Loader } from '../../components/Loader'

interface PoolModalProps {
  modalTitle: string
  func: FunctionName
  isOpen: boolean
  closeModal: () => void
}

export const PoolModal: React.FC<PoolModalProps> = ({ modalTitle, func, isOpen, closeModal }) => {
  const { vault, solace, cpFarm, lpFarm, lpToken, weth } = useContracts()

  const [amount, setAmount] = useState<string>('')
  const [isStaking, setIsStaking] = useState<boolean>(false)
  const cpUserStakeValue = useUserStakedValue(cpFarm)
  const nativeTokenBalance = useNativeTokenBalance()
  const scpBalance = useScpBalance()
  const wallet = useWallet()
  const { addLocalTransactions, reload, gasPrices } = useCachedData()
  const [selectedGasOption, setSelectedGasOption] = useState<GasFeeOption>(gasPrices.selected)
  const [maxSelected, setMaxSelected] = useState<boolean>(false)
  const [modalLoading, setModalLoading] = useState<boolean>(false)
  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [spenderAddress, setSpenderAddress] = useState<string | null>(null)
  const tokenAllowance = useTokenAllowance(contractForAllowance, spenderAddress)
  const { makeTxToast } = useToasts()
  const maxLoss = 5
  const [nft, setNft] = useState<BN>()

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
        value: amount,
        status: TransactionCondition.PENDING,
        unit: getUnit(func, wallet.chainId),
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
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  const callDepositEth = async () => {
    setModalLoading(true)
    if (!cpFarm || !vault) return
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
        value: amount,
        status: TransactionCondition.PENDING,
        unit: getUnit(func, wallet.chainId),
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
        value: amount,
        status: TransactionCondition.PENDING,
        unit: getUnit(func, wallet.chainId),
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
        value: amount,
        status: TransactionCondition.PENDING,
        unit: getUnit(func, wallet.chainId),
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
        value: amount,
        status: TransactionCondition.PENDING,
        unit: getUnit(func, wallet.chainId),
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
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  const callDepositLp = async () => {
    setModalLoading(true)
    if (!lpToken || !lpFarm || !nft) return
    const txType = FunctionName.DEPOSIT_LP
    try {
      const { v, r, s } = await getPermitNFTSignature(wallet, lpToken, lpFarm.address, nft, DEADLINE)
      const tx = await lpFarm.depositSigned(wallet.account, nft, DEADLINE, v, r, s)
      const txHash = tx.hash
      const localTx = {
        hash: txHash,
        type: txType,
        value: amount,
        status: TransactionCondition.PENDING,
        unit: getUnit(func, wallet.chainId),
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
        value: amount,
        status: TransactionCondition.PENDING,
        unit: getUnit(func, wallet.chainId),
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
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setModalLoading(false)
      reload()
    }
  }

  const callMintLpToken = async (amount: number) => {
    if (!weth || !solace || !lpToken) return
    setModalLoading(true)
    const signer = getProviderOrSigner(wallet.library, wallet.account)
    const lpTokenAddress = lpToken.address
    try {
      await solace.connect(signer).addMinter(wallet.account)
      await solace.connect(signer).mint(wallet.account, amount)
      await weth.connect(signer).deposit({ value: amount })

      const wethAllowance1 = await weth.connect(signer).allowance(wallet.account, lpTokenAddress)
      const solaceAllowance1 = await solace.connect(signer).allowance(wallet.account, lpTokenAddress)
      console.log('weth allowance before approval', wethAllowance1.toString())
      console.log('solace allowance before approval', solaceAllowance1.toString())

      await solace.connect(signer).approve(lpTokenAddress, amount)
      await weth.connect(signer).approve(lpTokenAddress, amount)

      const wethAllowance2 = await weth.connect(signer).allowance(wallet.account, lpTokenAddress)
      const solaceAllowance2 = await solace.connect(signer).allowance(wallet.account, lpTokenAddress)
      console.log('weth allowance after approval', wethAllowance2.toString())
      console.log('solace allowance after approval', solaceAllowance2.toString())

      const nft = await mintLpToken(weth, solace, FeeAmount.MEDIUM, BN.from(amount))
      console.log('Total Supply of LP Tokens', nft.toNumber())
      setNft(nft)

      handleClose()
    } catch (err) {
      console.log(err)

      handleClose()
    }
  }

  const mintLpToken = async (
    tokenA: Contract,
    tokenB: Contract,
    fee: FeeAmount,
    amount: BigNumberish,
    tickLower: BigNumberish = getMinTick(TICK_SPACINGS[fee]),
    tickUpper: BigNumberish = getMaxTick(TICK_SPACINGS[fee])
  ) => {
    if (!lpToken?.provider || !wallet.account || !wallet.library) return
    const [token0, token1] = sortTokens(tokenA.address, tokenB.address)
    await lpToken.connect(getProviderOrSigner(wallet.library, wallet.account)).mint({
      token0: token0,
      token1: token1,
      tickLower: tickLower,
      tickUpper: tickUpper,
      fee: fee,
      recipient: wallet.account,
      amount0Desired: amount,
      amount1Desired: amount,
      amount0Min: 0,
      amount1Min: 0,
      deadline: DEADLINE,
    })
    const tokenId = await lpToken.totalSupply()
    return tokenId
  }

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
      default:
        // any amount
        return BN.from('999999999999999999999999999999999999')
    }
  }

  const calculateMaxEth = () => {
    const bal = formatEther(getAssetBalanceByFunc())
    if (func !== FunctionName.DEPOSIT && func !== FunctionName.DEPOSIT_ETH) return bal
    const gasInEth = (GAS_LIMIT / POW_NINE) * selectedGasOption.value
    return fixed(fixed(parseFloat(bal), 6) - fixed(gasInEth, 6), 6)
  }

  const sortTokens = (tokenA: string, tokenB: string) => {
    return BN.from(tokenA).lt(BN.from(tokenB)) ? [tokenA, tokenB] : [tokenB, tokenA]
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
      case FunctionName.DEPOSIT_LP:
        await callDepositLp()
        break
      case FunctionName.WITHDRAW_LP:
        await callWithdrawLp()
        break
    }
  }

  const handleClose = () => {
    setAmount('')
    setSelectedGasOption(gasPrices.options[1])
    setMaxSelected(false)
    setModalLoading(false)
    closeModal()
  }

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
    if (isOpen) {
      setContractForAllowance(vault || null)
      setSpenderAddress(cpFarm?.address || null)
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} handleClose={handleClose} modalTitle={modalTitle} disableCloseButton={modalLoading}>
      <Fragment>
        <ModalRow>
          <ModalCell t2>{getUnit(func, wallet.chainId)}</ModalCell>
          <ModalCell style={{ position: 'relative' }}>
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
              disabled={wallet.errors.length > 0}
              onClick={() => {
                setAmount(calculateMaxEth().toString())
                setMaxSelected(true)
              }}
            >
              MAX
            </Button>
          </ModalCell>
        </ModalRow>
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
        {func == FunctionName.DEPOSIT || func == FunctionName.DEPOSIT_ETH ? (
          <ModalRow>
            <ModalCell>
              <RadioCircle>
                <RadioCircleInput
                  type="checkbox"
                  checked={isStaking}
                  onChange={(e) => setIsStaking(e.target.checked)}
                />
                <RadioCircleFigure></RadioCircleFigure>
                <div>Automatically stake</div>
              </RadioCircle>
            </ModalCell>
          </ModalRow>
        ) : null}
        <ButtonWrapper>
          {!modalLoading ? (
            <ButtonWrapper>
              {func == FunctionName.DEPOSIT_CP ? (
                <Fragment>
                  {!hasApproval(tokenAllowance, amount ? parseEther(amount).toString() : '0') && tokenAllowance != '' && (
                    <Button
                      disabled={(isAppropriateAmount() ? false : true) || wallet.errors.length > 0}
                      onClick={() => approve()}
                    >
                      Approve
                    </Button>
                  )}
                  <Button
                    hidden={modalLoading}
                    disabled={
                      (isAppropriateAmount() ? false : true) ||
                      !hasApproval(tokenAllowance, amount ? parseEther(amount).toString() : '0') ||
                      wallet.errors.length > 0
                    }
                    onClick={handleCallbackFunc}
                  >
                    Confirm
                  </Button>
                </Fragment>
              ) : (
                <Button
                  hidden={modalLoading}
                  disabled={(isAppropriateAmount() ? false : true) || wallet.errors.length > 0}
                  onClick={handleCallbackFunc}
                >
                  Confirm
                </Button>
              )}
            </ButtonWrapper>
          ) : (
            <Loader />
          )}
        </ButtonWrapper>
      </Fragment>
    </Modal>
  )
}
