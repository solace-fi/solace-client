import React, { useEffect, useRef, useState, Fragment } from 'react'

import { Contract } from '@ethersproject/contracts'
import { formatEther, parseEther } from '@ethersproject/units'
import { BigNumberish, BigNumber as BN } from 'ethers'

import { NUM_BLOCKS_PER_DAY, ZERO, DEADLINE, CP_ROI, LP_ROI } from '../../constants'

import { useContracts } from '../../context/ContractsManager'
import { useWallet } from '../../context/Web3Manager'

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
import { Content } from '../App'
import { Heading1, Heading2, Heading3 } from '../../components/Text'
import { Table, TableHead, TableHeader, TableRow, TableBody, TableData, TableDataGroup } from '../../components/Table'
import { Button } from '../../components/Button'
import { Heading1, Heading2 } from '../../components/Text'
import { Content, makeNotification } from '../App'

import getPermitNFTSignature from '../../utils/signature'
import { encodePriceSqrt, FeeAmount, TICK_SPACINGS, getMaxTick, getMinTick } from '../../utils/uniswap'
import { fixed, getGasValue } from '../../utils/fixedValue'
import { getProviderOrSigner } from '../../utils/index'

import { GasFeeOption } from '../../hooks/useFetchGasPrice'
import { useCapitalPoolSize } from '../../hooks/useCapitalPoolSize'
import { useEthBalance } from '../../hooks/useEthBalance'
import { useFetchGasPrice } from '../../hooks/useFetchGasPrice'
import { usePoolStakedValue } from '../../hooks/usePoolStakedValue'
import { useRewardsPerDay, useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'
import { useScpBalance } from '../../hooks/useScpBalance'
import { useUserStakedValue } from '../../hooks/useUserStakedValue'
import { useTransactions } from '../../hooks/useTransactions'

function Invest(): any {
  const wallet = useWallet()
  const { master, vault, solace, cpFarm, lpFarm, lpToken, weth, registry } = useContracts()

  const masterContract = useRef<Contract | null>()
  const vaultContract = useRef<Contract | null>()
  const cpFarmContract = useRef<Contract | null>()
  const lpFarmContract = useRef<Contract | null>()
  const lpTokenContract = useRef<Contract | null>()
  const wethContract = useRef<Contract | null>()
  const solaceContract = useRef<Contract | null>()
  const registryContract = useRef<Contract | null>()
  const { transactions, addTransaction, updateTransactions } = useTransactions()

  const ethBalance = useEthBalance()
  const gasPrices = useFetchGasPrice()
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

  const [action, setAction] = useState<string>()
  const [modalTitle, setModalTitle] = useState<string>('')

  const [amount, setAmount] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [maxLoss, setMaxLoss] = useState<number>(5)

  const [unit, setUnit] = useState<string>('ETH')
  const [isStaking, setIsStaking] = useState<boolean>(false)
  const [nft, setNft] = useState<BN>()
  const [selectedGasOption, setSelectedGasOption] = useState<GasFeeOption>({ key: '', name: '', value: 0 })
  const [showModal, setShowModal] = useState<boolean>(false)
  const [userVaultAssets, setUserVaultAssets] = useState<string>('0.00')
  const [userVaultShare, setUserVaultShare] = useState<number>(0)

  const openModal = async (action: string, modalTitle: string, unit: string) => {
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
    setSelectedGasOption(gasPrices.options[1])
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
    const txType = 'Eth Risk backing Capital Pool Deposit'
    try {
      const tx = await vaultContract.current.deposit({
        value: parseEther(amount),
        gasPrice: getGasValue(selectedGasOption.value),
      })
      closeModal()
      makeNotification(txType, 'pending')
      addTransaction(txType, tx, amount, unit)
      await tx.wait()
      await vaultContract.current.once('DepositMade', (sender, amount, shares, tx) => {
        console.log('DepositVault event: ', tx)
        makeNotification(txType, 'success')
        updateTransactions(tx, 'Complete')
        wallet.reload()
      })
    } catch (err) {
      console.log('callDepositVault ', err)
      makeNotification(txType, 'failure')
      closeModal()
      wallet.reload()
    }
  }

  const callDepositEth = async () => {
    setLoading(true)
    if (!cpFarmContract.current || !vaultContract.current) return
    const txType = 'Eth Risk backing Capital Pool Stake'
    try {
      const tx = await cpFarmContract.current.depositEth({
        value: parseEther(amount),
        gasPrice: getGasValue(selectedGasOption.value),
      })
      closeModal()
      makeNotification(txType, 'pending')
      addTransaction(txType, tx, amount, unit)
      await tx.wait()
      await cpFarmContract.current.once('EthDeposited', (sender, amount, tx) => {
        console.log('EthDeposited event: ', tx)
        makeNotification(txType, 'success')
        updateTransactions(tx, 'Complete')
        wallet.reload()
      })
    } catch (err) {
      console.log('error callDepositEth ', err)
      makeNotification(txType, 'failure')
      closeModal()
      wallet.reload()
    }
  }

  const callDepositCp = async () => {
    setLoading(true)
    if (!cpFarmContract.current || !vaultContract.current) return
    const txType = 'Solace Capital Provider Farm Deposit'
    try {
      const approval = await vaultContract.current.approve(cpFarmContract.current.address, parseEther(amount))
      await approval.wait()
      await vaultContract.current.once('Approval', (owner, spender, value, tx) => {
        console.log('approval event: ', tx)
      })
      const tx = await cpFarmContract.current.depositCp(parseEther(amount), {
        gasPrice: getGasValue(selectedGasOption.value),
      })
      closeModal()
      makeNotification(txType, 'pending')
      addTransaction(txType, tx, amount, unit)
      await tx.wait()
      await cpFarmContract.current.on('CpDeposited', (sender, amount, tx) => {
        console.log('CpDeposited event: ', tx)
        makeNotification(txType, 'success')
        updateTransactions(tx, 'Complete')
        wallet.reload()
      })
    } catch (err) {
      console.log('error callDepositCp ', err)
      makeNotification(txType, 'failure')
      closeModal()
      wallet.reload()
    }
  }

  const callWithdrawVault = async () => {
    setLoading(true)
    if (!vaultContract.current) return
    const txType = 'Eth Risk backing Capital Pool Withdrawal'
    try {
      const tx = await vaultContract.current.withdraw(parseEther(amount), maxLoss, {
        gasPrice: getGasValue(selectedGasOption.value),
      })
      closeModal()
      makeNotification(txType, 'pending')
      addTransaction(txType, tx, amount, unit)
      await tx.wait()
      await vaultContract.current.once('WithdrawalMade', (sender, amount, tx) => {
        console.log('withdrawal event: ', tx)
        makeNotification(txType, 'success')
        updateTransactions(tx, 'Complete')
        wallet.reload()
      })
    } catch (err) {
      console.log('callWithdrawVault ', err)
      makeNotification(txType, 'failure')
      closeModal()
      wallet.reload()
    }
  }

  const callWithdrawCp = async () => {
    setLoading(true)
    if (!cpFarmContract.current) return
    const txType = 'Solace Capital Provider Farm Withdrawal'
    try {
      const tx = await cpFarmContract.current.withdrawEth(parseEther(amount), maxLoss, {
        gasPrice: getGasValue(selectedGasOption.value),
      })
      closeModal()
      makeNotification(txType, 'pending')
      addTransaction(txType, tx, amount, unit)
      await tx.wait()
      await cpFarmContract.current.once('EthWithdrawn', (sender, amount, tx) => {
        console.log('EthWithdrawn event: ', tx)
        makeNotification(txType, 'success')
        updateTransactions(tx, 'Complete')
        wallet.reload()
      })
    } catch (err) {
      console.log('error callWithdrawCp ', err)
      makeNotification(txType, 'failure')
      closeModal()
      wallet.reload()
    }
  }

  const callDepositLp = async () => {
    setLoading(true)
    if (!lpTokenContract.current || !lpFarmContract.current || !nft) return
    const txType = 'SOLACE/ETH Liquidity Pool Deposit'
    try {
      const { v, r, s } = await getPermitNFTSignature(
        wallet,
        lpTokenContract.current,
        lpFarmContract.current.address,
        nft,
        DEADLINE
      )
      const tx = await lpFarmContract.current.depositSigned(wallet.account, nft, DEADLINE, v, r, s)
      closeModal()
      makeNotification(txType, 'pending')
      addTransaction(txType, tx, amount, unit)
      await tx.wait()
      await lpFarmContract.current.once('TokenDeposited', (sender, token, tx) => {
        console.log('TokenDeposited event: ', tx)
        makeNotification(txType, 'success')
        updateTransactions(tx, 'Complete')
        wallet.reload()
      })
    } catch (err) {
      console.log('callDepositLp ', err)
      makeNotification(txType, 'failure')
      closeModal()
      wallet.reload()
    }
  }

  const callWithdrawLp = async () => {
    setLoading(true)
    if (!lpFarmContract.current) return
    const txType = 'SOLACE/ETH Liquidity Pool Withdrawal'
    try {
      const tx = await lpFarmContract.current.withdraw(nft)
      closeModal()
      makeNotification(txType, 'pending')
      addTransaction(txType, tx, amount, unit)
      await tx.wait()
      await lpFarmContract.current.once('TokenWithdrawn', (sender, token, tx) => {
        console.log('TokenWithdrawnLp event: ', tx)
        makeNotification(txType, 'success')
        updateTransactions(tx, 'Complete')
        wallet.reload()
      })
    } catch (err) {
      console.log('callWithdrawLp ', err)
      makeNotification(txType, 'failure')
      closeModal()
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
      wallet.reload()
      closeModal()
    } catch (err) {
      console.log(err)
      wallet.reload()
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
      case 'depositVaultOrEth':
        isStaking ? await callDepositEth() : await callDepositVault()
        break
      case 'withdrawVault':
        await callWithdrawVault()
        break
      case 'depositCp':
        await callDepositCp()
        break
      case 'withdrawCp':
        await callWithdrawCp()
        break
      case 'depositLp':
        await callDepositLp()
        break
      case 'withdrawLp':
        await callWithdrawLp()
        break
    }
  }

  const handleAmount = (input: string) => {
    if (!amount && input == '.') input = '0.'
    const filteredAmount = input.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
    setAmount(filteredAmount)
  }

  const isAppropriateAmount = () => {
    if (!amount || parseEther(amount).lte(ZERO)) return false
    return getAssetBalanceByFunc().gte(parseEther(amount))
  }

  const getAssetBalanceByFunc = (): BN => {
    switch (action) {
      // if depositing into vault or eth into farm, check eth
      case 'depositVaultOrEth':
        return parseEther(ethBalance)
      // if depositing cp into farm or withdrawing from vault, check scp
      case 'depositCp':
      case 'withdrawVault':
        return parseEther(scpBalance)
      // if withdrawing cp from the farm, check user stake
      case 'withdrawCp':
        return parseEther(cpUserStakeValue)
      default:
        // any amount
        return BN.from('999999999999999999999999999999999999')
    }
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
  }, [wallet, scpBalance])

  useEffect(() => {
    if (!gasPrices.selected) return
    setSelectedGasOption(gasPrices.selected)
  }, [gasPrices])

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
                onChange={(e) => handleAmount(e.target.value)}
                value={amount}
              />
              <div style={{ position: 'absolute', top: '70%' }}>
                Available: {action ? parseFloat(formatEther(getAssetBalanceByFunc())) : 0}
              </div>
            </ModalCell>
            <ModalCell t3>
              <Button onClick={() => setAmount(formatEther(getAssetBalanceByFunc()))}>MAX</Button>
            </ModalCell>
          </ModalRow>
          <RadioGroup>
            {!gasPrices.loading ? (
              gasPrices.options.map((option) => (
                <RadioLabel key={option.key}>
                  <RadioInput
                    type="radio"
                    value={option.value}
                    checked={selectedGasOption == option}
                    onChange={() => handleSelectChange(option)}
                  />
                  <RadioElement>
                    <div>{option.name}</div>
                    <div>{option.value ? option.value : 0}</div>
                  </RadioElement>
                </RadioLabel>
              ))
            ) : (
              <Loader />
            )}
          </RadioGroup>
          {action == 'depositVaultOrEth' ? (
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
              {wallet.account ? <TableHeader>Your Assets</TableHeader> : null}
              <TableHeader>Total Assets</TableHeader>
              {wallet.account ? <TableHeader>Your Vault Share</TableHeader> : null}
              <TableHeader>ROI (1Y)</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {wallet.account ? <TableData>{fixed(parseFloat(userVaultAssets))}</TableData> : null}
              <TableData>{fixed(parseFloat(formatEther(capitalPoolSize).toString()))}</TableData>
              {wallet.account ? <TableData>{`${fixed(userVaultShare)}%`}</TableData> : null}
              <TableData>{CP_ROI}</TableData>
              {wallet.account && !loading ? (
                <TableData cellAlignRight>
                  <TableDataGroup>
                    <Button onClick={() => openModal('depositVaultOrEth', 'Deposit', 'ETH')}>Deposit</Button>
                    <Button onClick={() => openModal('withdrawVault', 'Withdraw', 'Solace CP Token')}>Withdraw</Button>
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
              {wallet.account ? <TableData>{fixed(parseFloat(cpUserStakeValue))}</TableData> : null}
              <TableData>{fixed(parseFloat(cpPoolValue))}</TableData>
              <TableData>{LP_ROI}</TableData>
              {wallet.account ? <TableData>{fixed(parseFloat(cpUserRewards))}</TableData> : null}
              {wallet.account ? <TableData>{fixed(parseFloat(cpUserRewardsPerDay))}</TableData> : null}
              <TableData>{fixed(parseFloat(cpRewardsPerDay))}</TableData>
              {wallet.account && !loading ? (
                <TableData cellAlignRight>
                  <TableDataGroup>
                    <Button onClick={() => openModal('depositCp', 'Deposit', 'Solace CP Token')}>Deposit</Button>
                    <Button onClick={() => openModal('withdrawCp', 'Withdraw', 'Solace CP Token')}>Withdraw</Button>
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
              <TableHeader>Total Assets</TableHeader>
              <TableHeader>ROI (1Y)</TableHeader>
              {wallet.account ? <TableHeader>My Rewards</TableHeader> : null}
              {wallet.account ? <TableHeader>My Daily Rewards</TableHeader> : null}
              <TableHeader>Daily Rewards</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableData>{fixed(parseFloat(lpPoolValue))}</TableData>
              <TableData>150.00%</TableData>
              {wallet.account ? <TableData>{fixed(parseFloat(lpUserRewards))}</TableData> : null}
              {wallet.account ? <TableData>{fixed(parseFloat(lpUserRewardsPerDay))}</TableData> : null}
              <TableData>{fixed(parseFloat(lpRewardsPerDay))}</TableData>
              {wallet.account && !loading ? (
                <TableData cellAlignRight>
                  <TableDataGroup>
                    <Button onClick={() => openModal('depositLp', 'Deposit', 'LP')}>Deposit</Button>
                    <Button onClick={() => openModal('withdrawLp', 'Withdraw', 'LP')}>Withdraw</Button>
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
              <TableHeader>Block Hash</TableHeader>
              <TableHeader>Status</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx: any) => (
              <TableRow key={tx.hash}>
                <TableData>{tx.type}</TableData>
                <TableData>{`${tx.amount} ${tx.unit}`}</TableData>
                <TableData>{tx.time}</TableData>
                <TableData>{`${tx.hash.substring(0, 8)}...`}</TableData>
                <TableData>{`${tx.blockHash.substring(0, 8)}...`}</TableData>
                <TableData>{tx.stat}</TableData>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Content>
    </Fragment>
  )
}

export default Invest
