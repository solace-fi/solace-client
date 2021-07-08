/*************************************************************************************

    Table of Contents:

    import react
    import packages
    import constants
    import managers
    import components
    import hooks
    import utils

    Invest function
      useRef variables
      Hook variables
      Contract functions
      Local helper functions
      useEffect hooks
      Render

  *************************************************************************************/

/* import react */
import React, { useEffect, useRef, useState, Fragment } from 'react'

/* import packages */
import { Contract } from '@ethersproject/contracts'
import { formatEther, parseEther } from '@ethersproject/units'
import { BigNumberish, BigNumber as BN } from 'ethers'

/* import constants */
import { ZERO, DEADLINE, CP_ROI, LP_ROI, GAS_LIMIT, CHAIN_ID, POW_NINE } from '../../constants'
import { TransactionCondition, FunctionName, Unit } from '../../constants/enums'

/* import managers */
import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'
import { useToasts } from '../../context/NotificationsManager'
import { useUserData } from '../../context/UserDataManager'

/* import components */
import { Loader } from '../../components/Loader'
import { Input } from '../../components/Input'
import { Modal, ModalHeader, ModalContent, ModalRow, ModalCell, ModalCloseButton } from '../../components/Modal'
import { RadioElement, RadioInput, RadioGroup, RadioLabel } from '../../components/Radio'
import { Table, TableHead, TableHeader, TableRow, TableBody, TableData, TableDataGroup } from '../../components/Table'
import { Button, ButtonWrapper } from '../../components/Button'
import { Heading1, Heading2 } from '../../components/Text'
import { Content } from '../../components/Layout'
import { HyperLink } from '../../components/Link'
import { RadioCircle, RadioCircleFigure, RadioCircleInput } from '../../components/Radio/RadioCircle'

/* import hooks */
import { GasFeeOption } from '../../hooks/useFetchGasPrice'
import { useCapitalPoolSize } from '../../hooks/useCapitalPoolSize'
import { useEthBalance } from '../../hooks/useEthBalance'
import { usePoolStakedValue } from '../../hooks/usePoolStakedValue'
import { useRewardsPerDay, useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'
import { useScpBalance } from '../../hooks/useScpBalance'
import { useUserStakedValue } from '../../hooks/useUserStakedValue'
import { useFetchTxHistoryByAddress } from '../../hooks/useFetchTxHistoryByAddress'
import { useTransactionDetails } from '../../hooks/useTransactionDetails'
import { useTokenAllowance } from '../../hooks/useTokenAllowance'

/* import utils */
import { getEtherscanTxUrl } from '../../utils/etherscan'
import getPermitNFTSignature from '../../utils/signature'
import { FeeAmount, TICK_SPACINGS, getMaxTick, getMinTick } from '../../utils/uniswap'
import {
  fixed,
  getGasValue,
  filteredAmount,
  shortenAddress,
  getUnit,
  floatEther,
  truncateBalance,
} from '../../utils/formatting'
import { getProviderOrSigner, hasApproval } from '../../utils'
import { timeAgo } from '../../utils/timeAgo'
import { decodeInput } from '../../utils/decoder'

function Invest(): any {
  /************************************************************************************* 

    useRef variables 

  *************************************************************************************/

  const masterContract = useRef<Contract | null>()
  const vaultContract = useRef<Contract | null>()
  const cpFarmContract = useRef<Contract | null>()
  const lpFarmContract = useRef<Contract | null>()
  const lpTokenContract = useRef<Contract | null>()
  const wethContract = useRef<Contract | null>()
  const solaceContract = useRef<Contract | null>()
  const registryContract = useRef<Contract | null>()

  /*************************************************************************************

  Hook variables

  *************************************************************************************/

  const [amount, setAmount] = useState<string>('')
  const [func, setFunc] = useState<FunctionName>()
  const [isStaking, setIsStaking] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [maxLoss, setMaxLoss] = useState<number>(5)
  const [maxSelected, setMaxSelected] = useState<boolean>(false)
  const [modalTitle, setModalTitle] = useState<string>('')
  const [nft, setNft] = useState<BN>()
  const [showModal, setShowModal] = useState<boolean>(false)
  const [unit, setUnit] = useState<Unit>(Unit.ETH)
  const [userVaultAssets, setUserVaultAssets] = useState<string>('0.00')
  const [userVaultShare, setUserVaultShare] = useState<number>(0)
  const [contractForAllowance, setContractForAllowance] = useState<Contract | null>(null)
  const [cpRewardsPerDay] = useRewardsPerDay(1)
  const [cpUserRewardsPerDay] = useUserRewardsPerDay(1, cpFarmContract.current)
  const [cpUserRewards] = useUserPendingRewards(cpFarmContract.current)
  const [lpRewardsPerDay] = useRewardsPerDay(2)
  const [lpUserRewardsPerDay] = useUserRewardsPerDay(2, lpFarmContract.current)
  const [lpUserRewards] = useUserPendingRewards(lpFarmContract.current)
  const capitalPoolSize = useCapitalPoolSize()
  const cpPoolValue = usePoolStakedValue(cpFarmContract.current)
  const cpUserStakeValue = useUserStakedValue(cpFarmContract.current)
  const ethBalance = useEthBalance()
  const lpPoolValue = usePoolStakedValue(lpFarmContract.current)
  const lpUserStakeValue = useUserStakedValue(lpFarmContract.current)
  const scpBalance = useScpBalance()
  const txHistory = useFetchTxHistoryByAddress()
  const transactionDetails = useTransactionDetails(txHistory)
  const wallet = useWallet()
  const { errors, makeTxToast } = useToasts()
  const { localTransactions, addLocalTransactions } = useUserData()
  const { master, vault, solace, cpFarm, lpFarm, lpToken, weth, registry } = useContracts()
  const tokenAllowance = useTokenAllowance(contractForAllowance, cpFarmContract.current?.address)
  const [selectedGasOption, setSelectedGasOption] = useState<GasFeeOption>(wallet.gasPrices.selected)

  /*************************************************************************************

  Contract functions

  *************************************************************************************/

  const getUserVaultDetails = async () => {
    if (!cpFarmContract.current?.provider || !vaultContract.current?.provider || !wallet.account) return
    try {
      const totalSupply = await vaultContract.current.totalSupply()
      const userInfo = await cpFarmContract.current.userInfo(wallet.account)
      const value = userInfo.value
      const cpBalance = parseEther(scpBalance)
      const userAssets = cpBalance.add(value)
      const userShare = totalSupply.gt(ZERO) ? floatEther(userAssets.mul(100)) / floatEther(totalSupply) : 0
      const formattedAssets = formatEther(userAssets)
      setUserVaultAssets(formattedAssets)
      setUserVaultShare(userShare)
    } catch (err) {
      console.log('error getUserVaultShare ', err)
    }
  }

  const callDeposit = async () => {
    setLoading(true)
    if (!vaultContract.current) return
    const txType = FunctionName.DEPOSIT
    try {
      const tx = await vaultContract.current.deposit({
        value: parseEther(amount),
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: amount, status: TransactionCondition.PENDING, unit: unit }
      closeModal()
      addLocalTransactions(localTx)
      wallet.reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setLoading(false)
      wallet.reload()
    }
  }

  const callDepositEth = async () => {
    setLoading(true)
    if (!cpFarmContract.current || !vaultContract.current) return
    const txType = FunctionName.DEPOSIT_ETH
    try {
      const tx = await cpFarmContract.current.depositEth({
        value: parseEther(amount),
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: amount, status: TransactionCondition.PENDING, unit: unit }
      closeModal()
      addLocalTransactions(localTx)
      wallet.reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setLoading(false)
      wallet.reload()
    }
  }

  const approve = async () => {
    setLoading(true)
    if (!cpFarmContract.current || !vaultContract.current) return
    const txType = FunctionName.APPROVE
    try {
      const approval = await vaultContract.current.approve(cpFarmContract.current.address, parseEther(amount))
      const approvalHash = approval.hash
      makeTxToast(FunctionName.APPROVE, TransactionCondition.PENDING, approvalHash)
      await approval.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(FunctionName.APPROVE, status, approvalHash)
        wallet.reload()
      })
      setLoading(false)
    } catch (err) {
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setLoading(false)
      wallet.reload()
    }
  }

  const callDepositCp = async () => {
    setLoading(true)
    if (!cpFarmContract.current || !vaultContract.current) return
    const txType = FunctionName.DEPOSIT_CP
    try {
      const tx = await cpFarmContract.current.depositCp(parseEther(amount), {
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: amount, status: TransactionCondition.PENDING, unit: unit }
      closeModal()
      addLocalTransactions(localTx)
      wallet.reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setLoading(false)
      wallet.reload()
    }
  }

  const callWithdraw = async () => {
    setLoading(true)
    if (!vaultContract.current) return
    const txType = FunctionName.WITHDRAW
    try {
      const tx = await vaultContract.current.withdraw(parseEther(amount), maxLoss, {
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: amount, status: TransactionCondition.PENDING, unit: unit }
      closeModal()
      addLocalTransactions(localTx)
      wallet.reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setLoading(false)
      wallet.reload()
    }
  }

  const callWithdrawEth = async () => {
    setLoading(true)
    if (!cpFarmContract.current) return
    const txType = FunctionName.WITHDRAW_ETH
    try {
      const tx = await cpFarmContract.current.withdrawEth(parseEther(amount), maxLoss, {
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: amount, status: TransactionCondition.PENDING, unit: unit }
      closeModal()
      addLocalTransactions(localTx)
      wallet.reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setLoading(false)
      wallet.reload()
    }
  }

  const callDepositLp = async () => {
    setLoading(true)
    if (!lpTokenContract.current || !lpFarmContract.current || !nft) return
    const txType = FunctionName.DEPOSIT_LP
    try {
      const { v, r, s } = await getPermitNFTSignature(
        wallet,
        lpTokenContract.current,
        lpFarmContract.current.address,
        nft,
        DEADLINE
      )
      const tx = await lpFarmContract.current.depositSigned(wallet.account, nft, DEADLINE, v, r, s)
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: amount, status: TransactionCondition.PENDING, unit: unit }
      closeModal()
      addLocalTransactions(localTx)
      wallet.reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setLoading(false)
      wallet.reload()
    }
  }

  const callWithdrawLp = async () => {
    setLoading(true)
    if (!lpFarmContract.current) return
    const txType = FunctionName.WITHDRAW_LP
    try {
      const tx = await lpFarmContract.current.withdraw(nft)
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: amount, status: TransactionCondition.PENDING, unit: unit }
      closeModal()
      addLocalTransactions(localTx)
      wallet.reload()
      makeTxToast(txType, TransactionCondition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? TransactionCondition.SUCCESS : TransactionCondition.FAILURE
        makeTxToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeTxToast(txType, TransactionCondition.CANCELLED)
      setLoading(false)
      wallet.reload()
    }
  }

  const callMintLpToken = async (amount: number) => {
    if (!wethContract.current || !solaceContract.current || !lpTokenContract.current) return
    setLoading(true)
    const signer = getProviderOrSigner(wallet.library, wallet.account)
    const lpTokenAddress = lpTokenContract.current.address
    try {
      await solaceContract.current.connect(signer).addMinter(wallet.account)
      await solaceContract.current.connect(signer).mint(wallet.account, amount)
      await wethContract.current.connect(signer).deposit({ value: amount })

      const wethAllowance1 = await wethContract.current.connect(signer).allowance(wallet.account, lpTokenAddress)
      const solaceAllowance1 = await solaceContract.current.connect(signer).allowance(wallet.account, lpTokenAddress)
      console.log('weth allowance before approval', wethAllowance1.toString())
      console.log('solace allowance before approval', solaceAllowance1.toString())

      await solaceContract.current.connect(signer).approve(lpTokenAddress, amount)
      await wethContract.current.connect(signer).approve(lpTokenAddress, amount)

      const wethAllowance2 = await wethContract.current.connect(signer).allowance(wallet.account, lpTokenAddress)
      const solaceAllowance2 = await solaceContract.current.connect(signer).allowance(wallet.account, lpTokenAddress)
      console.log('weth allowance after approval', wethAllowance2.toString())
      console.log('solace allowance after approval', solaceAllowance2.toString())

      const nft = await mintLpToken(wethContract.current, solaceContract.current, FeeAmount.MEDIUM, BN.from(amount))
      console.log('Total Supply of LP Tokens', nft.toNumber())
      setNft(nft)

      closeModal()
    } catch (err) {
      console.log(err)

      closeModal()
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
    if (!lpTokenContract.current?.provider || !wallet.account || !wallet.library) return
    const [token0, token1] = sortTokens(tokenA.address, tokenB.address)
    await lpTokenContract.current.connect(getProviderOrSigner(wallet.library, wallet.account)).mint({
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
    const tokenId = await lpTokenContract.current.totalSupply()
    return tokenId
  }

  const sortTokens = (tokenA: string, tokenB: string) => {
    return BN.from(tokenA).lt(BN.from(tokenB)) ? [tokenA, tokenB] : [tokenB, tokenA]
  }

  /*************************************************************************************

  Local helper functions

  *************************************************************************************/

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

  const isAppropriateAmount = () => {
    if (!amount || amount == '.' || parseEther(amount).lte(ZERO)) return false
    return getAssetBalanceByFunc().gte(parseEther(amount))
  }

  const getAssetBalanceByFunc = (): BN => {
    switch (func) {
      // if depositing into vault or eth into farm, check eth
      case FunctionName.DEPOSIT:
        return parseEther(ethBalance)
      // if depositing cp into farm or withdrawing from vault, check scp
      case FunctionName.DEPOSIT_CP:
      case FunctionName.WITHDRAW:
        return parseEther(scpBalance)
      // if withdrawing cp from the farm, check user stake
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

  const openModal = (func: FunctionName, modalTitle: string, unit: Unit) => {
    setShowModal((prev) => !prev)
    document.body.style.overflowY = 'hidden'
    setContractForAllowance(vaultContract.current || null)
    setUnit(unit)
    setModalTitle(modalTitle)
    setFunc(func)
  }

  const closeModal = () => {
    setShowModal(false)
    document.body.style.overflowY = 'scroll'
    setLoading(false)
    setAmount('')
    setMaxSelected(false)
    setSelectedGasOption(wallet.gasPrices.options[1])
  }

  /*************************************************************************************

  useEffect hooks

  *************************************************************************************/

  useEffect(() => {
    cpFarmContract.current = cpFarm
    lpFarmContract.current = lpFarm
    lpTokenContract.current = lpToken
    masterContract.current = master
    registryContract.current = registry
    solaceContract.current = solace
    vaultContract.current = vault
    wethContract.current = weth
  }, [vault, cpFarm, lpFarm, master, lpToken, weth, registry, solace])

  useEffect(() => {
    getUserVaultDetails()
  }, [wallet.library, wallet.version, wallet.account, scpBalance, txHistory])

  // selects default gas option
  useEffect(() => {
    if (!wallet.gasPrices.selected) return
    setSelectedGasOption(wallet.gasPrices.selected)
  }, [wallet.gasPrices])

  // when user clicks MAX on modal, return the max amount of ETH the user can send without gas
  useEffect(() => {
    const maxEth = calculateMaxEth()
    if (showModal && maxSelected) {
      setAmount(maxEth.toString())
    }
  }, [handleSelectChange])

  /*************************************************************************************

  Render

  *************************************************************************************/

  return (
    <Fragment>
      <Modal isOpen={showModal}>
        <ModalHeader>
          <Heading2>{modalTitle}</Heading2>
          <ModalCloseButton hidden={loading} onClick={() => closeModal()} />
        </ModalHeader>
        <ModalContent>
          <ModalRow>
            <ModalCell t2>{unit}</ModalCell>
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
                Available: {func ? floatEther(getAssetBalanceByFunc()) : 0}
              </div>
            </ModalCell>
            <ModalCell t3>
              <Button
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
            {!wallet.gasPrices.loading ? (
              wallet.gasPrices.options.map((option: any) => (
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
            {!loading ? (
              <ButtonWrapper>
                {func == FunctionName.DEPOSIT_CP ? (
                  <Fragment>
                    {!hasApproval(tokenAllowance, amount ? parseEther(amount).toString() : '0') &&
                      tokenAllowance != '' && (
                        <Button disabled={isAppropriateAmount() ? false : true} onClick={() => approve()}>
                          Approve
                        </Button>
                      )}
                    <Button
                      hidden={loading}
                      disabled={
                        (isAppropriateAmount() ? false : true) ||
                        !hasApproval(tokenAllowance, amount ? parseEther(amount).toString() : '0')
                      }
                      onClick={handleCallbackFunc}
                    >
                      Confirm
                    </Button>
                  </Fragment>
                ) : (
                  <Button hidden={loading} disabled={isAppropriateAmount() ? false : true} onClick={handleCallbackFunc}>
                    Confirm
                  </Button>
                )}
              </ButtonWrapper>
            ) : (
              <Loader />
            )}
          </ButtonWrapper>
        </ModalContent>
      </Modal>
      <Content>
        <Heading1>ETH Risk backing Capital Pool</Heading1>
        <Table isHighlight textAlignCenter>
          <TableHead>
            <TableRow>
              {wallet.account ? <TableHeader width={100}>Your Assets</TableHeader> : null}
              <TableHeader width={100}>Total Assets</TableHeader>
              <TableHeader width={100}>ROI (1Y)</TableHeader>
              {wallet.account ? <TableHeader width={130}>Your Vault Share</TableHeader> : null}
              {wallet.account && (
                <Fragment>
                  <TableHeader width={100}></TableHeader>
                  <TableHeader width={150}></TableHeader>
                </Fragment>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {wallet.account ? (
                <TableData width={100}>{truncateBalance(parseFloat(userVaultAssets), 2)}</TableData>
              ) : null}
              <TableData width={100}>{truncateBalance(floatEther(parseEther(capitalPoolSize)), 2)}</TableData>
              <TableData width={100}>{CP_ROI}</TableData>
              {wallet.account ? <TableData width={130}>{`${truncateBalance(userVaultShare, 2)}%`}</TableData> : null}
              {wallet.account && (
                <Fragment>
                  <TableData width={100}></TableData>
                  <TableData width={150}></TableData>
                </Fragment>
              )}
              {wallet.account && !loading ? (
                <TableData textAlignRight>
                  <TableDataGroup width={200}>
                    <Button
                      disabled={errors.length > 0}
                      onClick={() => openModal(FunctionName.DEPOSIT, 'Deposit', getUnit(FunctionName.DEPOSIT))}
                    >
                      Deposit
                    </Button>
                    <Button
                      disabled={errors.length > 0}
                      onClick={() => openModal(FunctionName.WITHDRAW, 'Withdraw', getUnit(FunctionName.WITHDRAW))}
                    >
                      Withdraw
                    </Button>
                  </TableDataGroup>
                </TableData>
              ) : null}
            </TableRow>
          </TableBody>
        </Table>
      </Content>
      <Content>
        <Heading1>Solace Capital Provider Farm</Heading1>
        <Table isHighlight textAlignCenter>
          <TableHead>
            <TableRow>
              {wallet.account ? <TableHeader width={100}>Your Stake</TableHeader> : null}
              <TableHeader>Total Assets</TableHeader>
              <TableHeader width={100}>ROI (1Y)</TableHeader>
              {wallet.account ? <TableHeader>My Rewards</TableHeader> : null}
              {wallet.account ? <TableHeader>My Daily Rewards</TableHeader> : null}
              <TableHeader>Daily Rewards</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {wallet.account ? (
                <TableData width={100}>{truncateBalance(parseFloat(cpUserStakeValue), 2)}</TableData>
              ) : null}
              <TableData>{truncateBalance(parseFloat(cpPoolValue), 2)}</TableData>
              <TableData width={100}>{LP_ROI}</TableData>
              {wallet.account ? <TableData>{truncateBalance(parseFloat(cpUserRewards), 2)}</TableData> : null}
              {wallet.account ? <TableData>{truncateBalance(parseFloat(cpUserRewardsPerDay), 2)}</TableData> : null}
              <TableData>{truncateBalance(parseFloat(cpRewardsPerDay), 2)}</TableData>
              {wallet.account && !loading ? (
                <TableData textAlignRight>
                  <TableDataGroup width={200}>
                    <Button
                      disabled={errors.length > 0}
                      onClick={() => openModal(FunctionName.DEPOSIT_CP, 'Deposit', getUnit(FunctionName.DEPOSIT_CP))}
                    >
                      Deposit
                    </Button>
                    <Button
                      disabled={errors.length > 0}
                      onClick={() =>
                        openModal(FunctionName.WITHDRAW_ETH, 'Withdraw', getUnit(FunctionName.WITHDRAW_ETH))
                      }
                    >
                      Withdraw
                    </Button>
                  </TableDataGroup>
                </TableData>
              ) : null}
            </TableRow>
          </TableBody>
        </Table>
      </Content>
      <Content>
        <Heading1>SOLACE/ETH Liquidity Pool</Heading1>
        <Table isHighlight textAlignCenter>
          <TableHead>
            <TableRow>
              {wallet.account ? <TableHeader width={100}>Your Stake</TableHeader> : null}
              <TableHeader>Total Assets</TableHeader>
              <TableHeader width={100}>ROI (1Y)</TableHeader>
              {wallet.account ? <TableHeader>My Rewards</TableHeader> : null}
              {wallet.account ? <TableHeader>My Daily Rewards</TableHeader> : null}
              <TableHeader>Daily Rewards</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {wallet.account ? (
                <TableData width={100}>{truncateBalance(parseFloat(lpUserStakeValue), 2)}</TableData>
              ) : null}
              <TableData>{truncateBalance(parseFloat(lpPoolValue), 2)}</TableData>
              <TableData width={100}>150.00%</TableData>
              {wallet.account ? <TableData>{truncateBalance(parseFloat(lpUserRewards), 2)}</TableData> : null}
              {wallet.account ? <TableData>{truncateBalance(parseFloat(lpUserRewardsPerDay), 2)}</TableData> : null}
              <TableData>{truncateBalance(parseFloat(lpRewardsPerDay), 2)}</TableData>
              {wallet.account && !loading ? (
                <TableData textAlignRight>
                  <TableDataGroup width={200}>
                    <Button
                      disabled={errors.length > 0}
                      onClick={() => openModal(FunctionName.DEPOSIT_LP, 'Deposit', getUnit(FunctionName.DEPOSIT_LP))}
                    >
                      Deposit
                    </Button>
                    <Button
                      disabled={errors.length > 0}
                      onClick={() => openModal(FunctionName.WITHDRAW_LP, 'Withdraw', getUnit(FunctionName.WITHDRAW_LP))}
                    >
                      Withdraw
                    </Button>
                  </TableDataGroup>
                </TableData>
              ) : null}
            </TableRow>
          </TableBody>
        </Table>
      </Content>
      <Content>
        <Heading1>Your transactions</Heading1>
        <Table textAlignCenter>
          <TableHead>
            <TableRow>
              <TableHeader>Type</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Time</TableHeader>
              <TableHeader>Hash</TableHeader>
              <TableHeader>Status</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {localTransactions &&
              localTransactions.map((pendingtx: any, i: number) => (
                <TableRow key={i}>
                  <TableData>{pendingtx.type}</TableData>
                  <TableData>{`${pendingtx.value} ${pendingtx.unit}`}</TableData>
                  <TableData>{timeAgo(Number(Date.now()) * 1000)}</TableData>
                  <TableData>
                    <HyperLink
                      href={getEtherscanTxUrl(wallet.chainId || Number(CHAIN_ID), pendingtx.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button>{shortenAddress(pendingtx.hash)} </Button>
                    </HyperLink>
                  </TableData>
                  <TableData>{pendingtx.status}</TableData>
                </TableRow>
              ))}

            {txHistory &&
              txHistory.map((tx: any, i: number) => (
                <TableRow key={tx.hash}>
                  <TableData>
                    {transactionDetails.length > 0 ? decodeInput(tx).function_name : <Loader width={10} height={10} />}
                  </TableData>
                  <TableData>{transactionDetails.length > 0 && transactionDetails[i]}</TableData>
                  <TableData>{transactionDetails.length > 0 && timeAgo(Number(tx.timeStamp) * 1000)}</TableData>
                  <TableData>
                    {transactionDetails.length > 0 && (
                      <HyperLink
                        href={getEtherscanTxUrl(wallet.chainId || Number(CHAIN_ID), tx.hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button>{shortenAddress(tx.hash)} </Button>
                      </HyperLink>
                    )}
                  </TableData>
                  <TableData>
                    {transactionDetails.length > 0 && (tx.txreceipt_status == '1' ? 'Complete' : 'Failed')}
                  </TableData>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Content>
    </Fragment>
  )
}

export default Invest
