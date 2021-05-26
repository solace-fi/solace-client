import React, { useEffect, useRef, useState, Fragment } from 'react'

import { Contract } from '@ethersproject/contracts'
import { formatEther, parseEther } from '@ethersproject/units'
import { BigNumberish, BigNumber as BN } from 'ethers'

import { ZERO, DEADLINE, CP_ROI, LP_ROI, GAS_LIMIT, CHAIN_ID } from '../../constants'

import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/WalletManager'

import { Loader } from '../../components/Loader'
import { Input } from '../../components/Input'
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalRow,
  ModalCell,
  ModalCloseButton,
  ModalButton,
} from '../../components/Modal/InvestModal'
import { RadioElement, RadioInput, RadioGroup, RadioLabel } from '../../components/Radio'
import { Table, TableHead, TableHeader, TableRow, TableBody, TableData, TableDataGroup } from '../../components/Table'
import { Button } from '../../components/Button'
import { Heading1, Heading2 } from '../../components/Text'
import { Content } from '../../components/Layout'

import getPermitNFTSignature from '../../utils/signature'
import { FeeAmount, TICK_SPACINGS, getMaxTick, getMinTick } from '../../utils/uniswap'
import { fixed, getGasValue, filteredAmount, shortenAddress } from '../../utils/formatting'
import { getProviderOrSigner } from '../../utils/index'
import { timeAgo } from '../../utils/timeAgo'
import { decodeInput } from '../../utils/decoder'

import { GasFeeOption } from '../../hooks/useFetchGasPrice'
import { useCapitalPoolSize } from '../../hooks/useCapitalPoolSize'
import { useEthBalance } from '../../hooks/useEthBalance'
import { usePoolStakedValue } from '../../hooks/usePoolStakedValue'
import { useRewardsPerDay, useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'
import { useScpBalance } from '../../hooks/useScpBalance'
import { useUserStakedValue } from '../../hooks/useUserStakedValue'
import { useToasts, Condition } from '../../context/NotificationsManager'
import { useFetchTxHistoryByAddress } from '../../hooks/useFetchTxHistoryByAddress'
import { getEtherscanTxUrl } from '../../utils/etherscan'
import { useUserData } from '../../context/UserDataManager'

enum Action {
  DEPOSIT_VAULT_OR_ETH = 'depositVaultOrEth',
  DEPOSIT_CP = 'depositCp',
  WITHDRAW_VAULT = 'withdrawVault',
  WITHDRAW_CP = 'withdrawCp',
  DEPOSIT_LP = 'depositLp',
  WITHDRAW_LP = 'withdrawLp',
}

enum Unit {
  ETH = 'ETH',
  SCP = 'Solace CP Token',
  LP = 'LP',
}

function Invest(): any {
  const { errors, makeToast } = useToasts()
  const wallet = useWallet()
  const { localTransactions, addLocalTransactions } = useUserData()
  const { master, vault, solace, cpFarm, lpFarm, lpToken, weth, registry } = useContracts()

  const masterContract = useRef<Contract | null>()
  const vaultContract = useRef<Contract | null>()
  const cpFarmContract = useRef<Contract | null>()
  const lpFarmContract = useRef<Contract | null>()
  const lpTokenContract = useRef<Contract | null>()
  const wethContract = useRef<Contract | null>()
  const solaceContract = useRef<Contract | null>()
  const registryContract = useRef<Contract | null>()

  const ethBalance = useEthBalance()
  const txHistory = useFetchTxHistoryByAddress()
  const [cpUserRewardsPerDay] = useUserRewardsPerDay(1, cpFarmContract.current)
  const [lpUserRewardsPerDay] = useUserRewardsPerDay(2, lpFarmContract.current)
  const [cpRewardsPerDay] = useRewardsPerDay(1)
  const [lpRewardsPerDay] = useRewardsPerDay(2)
  const [cpUserRewards] = useUserPendingRewards(cpFarmContract.current)
  const [lpUserRewards] = useUserPendingRewards(lpFarmContract.current)
  const cpPoolValue = usePoolStakedValue(cpFarmContract.current)
  const lpPoolValue = usePoolStakedValue(lpFarmContract.current)
  const cpUserStakeValue = useUserStakedValue(cpFarmContract.current)
  const lpUserStakeValue = useUserStakedValue(lpFarmContract.current)
  const capitalPoolSize = useCapitalPoolSize()
  const scpBalance = useScpBalance()

  const [action, setAction] = useState<Action>()
  const [amount, setAmount] = useState<string>('')
  const [isStaking, setIsStaking] = useState<boolean>(false)
  const [maxSelected, setMaxSelected] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [maxLoss, setMaxLoss] = useState<number>(5)
  const [modalTitle, setModalTitle] = useState<string>('')
  const [nft, setNft] = useState<BN>()
  const [selectedGasOption, setSelectedGasOption] = useState<GasFeeOption>(wallet.gasPrices.selected)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [unit, setUnit] = useState<string>(Unit.ETH)
  const [userVaultAssets, setUserVaultAssets] = useState<string>('0.00')
  const [userVaultShare, setUserVaultShare] = useState<number>(0)

  const openModal = async (action: Action, modalTitle: string, unit: string) => {
    setShowModal((prev) => !prev)
    document.body.style.overflowY = 'hidden'
    setUnit(unit)
    setModalTitle(modalTitle)
    setAction(action)
  }

  const closeModal = async () => {
    setShowModal(false)
    document.body.style.overflowY = 'scroll'
    setLoading(false)
    setAmount('')
    setMaxSelected(false)
    setSelectedGasOption(wallet.gasPrices.options[1])
  }

  const getUserVaultDetails = async () => {
    if (!cpFarmContract.current?.provider || !vaultContract.current?.provider || !wallet.account) return
    try {
      const totalSupply = await vaultContract.current.totalSupply()
      const userInfo = await cpFarmContract.current.userInfo(wallet.account)
      const value = userInfo.value
      const cpBalance = parseEther(scpBalance)
      const userAssets = cpBalance.add(value)
      const userShare = totalSupply.gt(ZERO)
        ? parseFloat(formatEther(userAssets.mul(100))) / parseFloat(formatEther(totalSupply))
        : 0
      const formattedAssets = formatEther(userAssets)
      setUserVaultAssets(formattedAssets)
      setUserVaultShare(userShare)
    } catch (err) {
      console.log('error getUserVaultShare ', err)
    }
  }

  const callDepositVault = async () => {
    setLoading(true)
    if (!vaultContract.current) return
    const txType = 'Deposit'
    try {
      const tx = await vaultContract.current.deposit({
        value: parseEther(amount),
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: amount, status: Condition.PENDING }
      closeModal()
      addLocalTransactions(localTx)
      wallet.reload()
      makeToast(txType, Condition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? Condition.SUCCESS : Condition.FAILURE
        makeToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeToast(txType, Condition.CANCELLED)
      setLoading(false)
      wallet.reload()
    }
  }

  const callDepositEth = async () => {
    setLoading(true)
    if (!cpFarmContract.current || !vaultContract.current) return
    const txType = 'DepositEth'
    try {
      const tx = await cpFarmContract.current.depositEth({
        value: parseEther(amount),
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: amount, status: Condition.PENDING }
      closeModal()
      addLocalTransactions(localTx)
      wallet.reload()
      makeToast(txType, Condition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? Condition.SUCCESS : Condition.FAILURE
        makeToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeToast(txType, Condition.CANCELLED)
      setLoading(false)
      wallet.reload()
    }
  }

  const callDepositCp = async () => {
    setLoading(true)
    if (!cpFarmContract.current || !vaultContract.current) return
    const txType = 'DepositCp'
    try {
      const approval = await vaultContract.current.approve(cpFarmContract.current.address, parseEther(amount))
      const approvalHash = approval.hash
      const approvalPendingTx = { hash: approvalHash, type: 'Approval', value: '0', status: Condition.PENDING }
      makeToast('Approval', Condition.PENDING, approvalHash)
      addLocalTransactions(approvalPendingTx)
      await approval.wait().then((receipt: any) => {
        const status = receipt.status ? Condition.SUCCESS : Condition.FAILURE
        makeToast('Approval', status, approvalHash)
        wallet.reload()
      })
      const tx = await cpFarmContract.current.depositCp(parseEther(amount), {
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: amount, status: Condition.PENDING }
      closeModal()
      addLocalTransactions(localTx)
      wallet.reload()
      makeToast(txType, Condition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? Condition.SUCCESS : Condition.FAILURE
        makeToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeToast(txType, Condition.CANCELLED)
      setLoading(false)
      wallet.reload()
    }
  }

  const callWithdrawVault = async () => {
    setLoading(true)
    if (!vaultContract.current) return
    const txType = 'Withdraw'
    try {
      const tx = await vaultContract.current.withdraw(parseEther(amount), maxLoss, {
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: amount, status: Condition.PENDING }
      closeModal()
      addLocalTransactions(localTx)
      wallet.reload()
      makeToast(txType, Condition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? Condition.SUCCESS : Condition.FAILURE
        makeToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeToast(txType, Condition.CANCELLED)
      setLoading(false)
      wallet.reload()
    }
  }

  const callWithdrawCp = async () => {
    setLoading(true)
    if (!cpFarmContract.current) return
    const txType = 'WithdrawCp'
    try {
      const tx = await cpFarmContract.current.withdrawEth(parseEther(amount), maxLoss, {
        gasPrice: getGasValue(selectedGasOption.value),
        gasLimit: GAS_LIMIT,
      })
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: amount, status: Condition.PENDING }
      closeModal()
      addLocalTransactions(localTx)
      wallet.reload()
      makeToast(txType, Condition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? Condition.SUCCESS : Condition.FAILURE
        makeToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeToast(txType, Condition.CANCELLED)
      setLoading(false)
      wallet.reload()
    }
  }

  const callDepositLp = async () => {
    setLoading(true)
    if (!lpTokenContract.current || !lpFarmContract.current || !nft) return
    const txType = 'DepositLp'
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
      const localTx = { hash: txHash, type: txType, value: amount, status: Condition.PENDING }
      closeModal()
      addLocalTransactions(localTx)
      wallet.reload()
      makeToast(txType, Condition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? Condition.SUCCESS : Condition.FAILURE
        makeToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeToast(txType, Condition.CANCELLED)
      setLoading(false)
      wallet.reload()
    }
  }

  const callWithdrawLp = async () => {
    setLoading(true)
    if (!lpFarmContract.current) return
    const txType = 'WithdrawLp'
    try {
      const tx = await lpFarmContract.current.withdraw(nft)
      const txHash = tx.hash
      const localTx = { hash: txHash, type: txType, value: amount, status: Condition.PENDING }
      closeModal()
      addLocalTransactions(localTx)
      wallet.reload()
      makeToast(txType, Condition.PENDING, txHash)
      await tx.wait().then((receipt: any) => {
        const status = receipt.status ? Condition.SUCCESS : Condition.FAILURE
        makeToast(txType, status, txHash)
        wallet.reload()
      })
    } catch (err) {
      makeToast(txType, Condition.CANCELLED)
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

  const handleSelectChange = (option: GasFeeOption) => {
    setSelectedGasOption(option)
  }

  const handleCallbackFunc = async () => {
    if (!action) return
    switch (action) {
      case Action.DEPOSIT_VAULT_OR_ETH:
        isStaking ? await callDepositEth() : await callDepositVault()
        break
      case Action.WITHDRAW_VAULT:
        await callWithdrawVault()
        break
      case Action.DEPOSIT_CP:
        await callDepositCp()
        break
      case Action.WITHDRAW_CP:
        await callWithdrawCp()
        break
      case Action.DEPOSIT_LP:
        await callDepositLp()
        break
      case Action.WITHDRAW_LP:
        await callWithdrawLp()
        break
    }
  }

  const isAppropriateAmount = () => {
    if (!amount || amount == '.' || parseEther(amount).lte(ZERO)) return false
    return getAssetBalanceByFunc().gte(parseEther(amount))
  }

  const getAssetBalanceByFunc = (): BN => {
    switch (action) {
      // if depositing into vault or eth into farm, check eth
      case Action.DEPOSIT_VAULT_OR_ETH:
        return parseEther(ethBalance)
      // if depositing cp into farm or withdrawing from vault, check scp
      case Action.DEPOSIT_CP:
      case Action.WITHDRAW_VAULT:
        return parseEther(scpBalance)
      // if withdrawing cp from the farm, check user stake
      case Action.WITHDRAW_CP:
        return parseEther(cpUserStakeValue)
      default:
        // any amount
        return BN.from('999999999999999999999999999999999999')
    }
  }

  const calculateMaxEth = () => {
    const bal = formatEther(getAssetBalanceByFunc())
    if (action !== 'depositVaultOrEth') return bal
    const gasInEth = (GAS_LIMIT / 1000000000) * selectedGasOption.value
    return fixed(fixed(parseFloat(bal), 6) - fixed(gasInEth, 6), 6)
  }

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

  useEffect(() => {
    if (!wallet.gasPrices.selected) return
    setSelectedGasOption(wallet.gasPrices.selected)
  }, [wallet.gasPrices])

  useEffect(() => {
    const maxEth = calculateMaxEth()
    if (showModal && maxSelected) {
      setAmount(maxEth.toString())
    }
  }, [handleSelectChange])

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
                Available: {action ? parseFloat(formatEther(getAssetBalanceByFunc())) : 0}
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
          {action == Action.DEPOSIT_VAULT_OR_ETH ? (
            <ModalRow>
              <ModalCell t2>
                <Input type="checkbox" checked={isStaking} onChange={(e) => setIsStaking(e.target.checked)} />
                <div>Automatically stake</div>
              </ModalCell>
            </ModalRow>
          ) : null}
          <ModalButton>
            {!loading ? (
              <Button hidden={loading} disabled={isAppropriateAmount() ? false : true} onClick={handleCallbackFunc}>
                Confirm
              </Button>
            ) : (
              <Loader />
            )}
          </ModalButton>
        </ModalContent>
      </Modal>
      <Content>
        <Heading1>ETH Risk backing Capital Pool</Heading1>
        <Table isHighlight>
          <TableHead>
            <TableRow>
              {wallet.account ? <TableHeader width={109}>Your Assets</TableHeader> : null}
              <TableHeader width={100}>Total Assets</TableHeader>
              <TableHeader width={100}>ROI (1Y)</TableHeader>
              {wallet.account ? <TableHeader width={130}>Your Vault Share</TableHeader> : null}
              {wallet.account && (
                <Fragment>
                  <TableHeader width={100}></TableHeader>
                  <TableHeader width={170}></TableHeader>
                </Fragment>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {wallet.account ? <TableData width={109}>{fixed(parseFloat(userVaultAssets), 2)}</TableData> : null}
              <TableData width={100}>{fixed(parseFloat(formatEther(capitalPoolSize).toString()), 2)}</TableData>
              <TableData width={100}>{CP_ROI}</TableData>
              {wallet.account ? <TableData width={130}>{`${fixed(userVaultShare, 2)}%`}</TableData> : null}
              {wallet.account && (
                <Fragment>
                  <TableData width={100}></TableData>
                  <TableData width={170}></TableData>
                </Fragment>
              )}
              {wallet.account && !loading ? (
                <TableData cellAlignRight>
                  <TableDataGroup width={200}>
                    <Button
                      disabled={errors.length > 0}
                      onClick={() => openModal(Action.DEPOSIT_VAULT_OR_ETH, 'Deposit', Unit.ETH)}
                    >
                      Deposit
                    </Button>
                    <Button
                      disabled={errors.length > 0}
                      onClick={() => openModal(Action.WITHDRAW_VAULT, 'Withdraw', Unit.SCP)}
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
        <Table isHighlight>
          <TableHead>
            <TableRow>
              {wallet.account ? <TableHeader>Your Stake</TableHeader> : null}
              <TableHeader>Total Assets</TableHeader>
              <TableHeader>ROI (1Y)</TableHeader>
              {wallet.account ? <TableHeader>My Rewards</TableHeader> : null}
              {wallet.account ? <TableHeader>My Daily Rewards</TableHeader> : null}
              <TableHeader>Daily Rewards</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {wallet.account ? <TableData>{fixed(parseFloat(cpUserStakeValue), 2)}</TableData> : null}
              <TableData>{fixed(parseFloat(cpPoolValue), 2)}</TableData>
              <TableData>{LP_ROI}</TableData>
              {wallet.account ? <TableData>{fixed(parseFloat(cpUserRewards), 2)}</TableData> : null}
              {wallet.account ? <TableData>{fixed(parseFloat(cpUserRewardsPerDay), 2)}</TableData> : null}
              <TableData>{fixed(parseFloat(cpRewardsPerDay), 2)}</TableData>
              {wallet.account && !loading ? (
                <TableData cellAlignRight>
                  <TableDataGroup width={200}>
                    <Button
                      disabled={errors.length > 0}
                      onClick={() => openModal(Action.DEPOSIT_CP, 'Deposit', Unit.SCP)}
                    >
                      Deposit
                    </Button>
                    <Button
                      disabled={errors.length > 0}
                      onClick={() => openModal(Action.WITHDRAW_CP, 'Withdraw', Unit.SCP)}
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
        <Table isHighlight>
          <TableHead>
            <TableRow>
              {wallet.account ? <TableHeader>Your Stake</TableHeader> : null}
              <TableHeader>Total Assets</TableHeader>
              <TableHeader>ROI (1Y)</TableHeader>
              {wallet.account ? <TableHeader>My Rewards</TableHeader> : null}
              {wallet.account ? <TableHeader>My Daily Rewards</TableHeader> : null}
              <TableHeader>Daily Rewards</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {wallet.account ? <TableData>{fixed(parseFloat(lpUserStakeValue), 2)}</TableData> : null}
              <TableData>{fixed(parseFloat(lpPoolValue), 2)}</TableData>
              <TableData>150.00%</TableData>
              {wallet.account ? <TableData>{fixed(parseFloat(lpUserRewards), 2)}</TableData> : null}
              {wallet.account ? <TableData>{fixed(parseFloat(lpUserRewardsPerDay), 2)}</TableData> : null}
              <TableData>{fixed(parseFloat(lpRewardsPerDay), 2)}</TableData>
              {wallet.account && !loading ? (
                <TableData cellAlignRight>
                  <TableDataGroup width={200}>
                    <Button
                      disabled={errors.length > 0}
                      onClick={() => openModal(Action.DEPOSIT_LP, 'Deposit', Unit.LP)}
                    >
                      Deposit
                    </Button>
                    <Button
                      disabled={errors.length > 0}
                      onClick={() => openModal(Action.WITHDRAW_LP, 'Withdraw', Unit.LP)}
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
        <Table>
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
                  <TableData>{pendingtx.value}</TableData>
                  <TableData>{timeAgo(Number(Date.now()) * 1000)}</TableData>
                  <TableData>
                    <a
                      href={getEtherscanTxUrl(wallet.chainId || Number(CHAIN_ID), pendingtx.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {shortenAddress(pendingtx.hash)}
                    </a>
                  </TableData>
                  <TableData>{pendingtx.status}</TableData>
                </TableRow>
              ))}
            {txHistory.txList &&
              txHistory.txList.map((tx: any) => (
                <TableRow key={tx.hash}>
                  <TableData>{decodeInput(tx).function_name}</TableData>
                  <TableData>{`${formatEther(tx.value)}`}</TableData>
                  <TableData>{timeAgo(Number(tx.timeStamp) * 1000)}</TableData>
                  <TableData>
                    <a
                      href={getEtherscanTxUrl(wallet.chainId || Number(CHAIN_ID), tx.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {shortenAddress(tx.hash)}
                    </a>
                  </TableData>
                  <TableData>{tx.txreceipt_status ? 'Complete' : 'Failed'}</TableData>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Content>
    </Fragment>
  )
}

export default Invest
