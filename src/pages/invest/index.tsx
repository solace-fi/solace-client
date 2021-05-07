import React, { useEffect, useRef, useState, Fragment } from 'react'
import { Contract } from '@ethersproject/contracts'
import { Loader } from '../../components/ui/Loader'
import { Input } from '../../components/ui/Input'
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalRow,
  ModalCell,
  ModalCloseButton,
  ModalButton,
} from '../../components/ui/Modal/InvestModal'
import { RadioElement, RadioInput, RadioGroup, RadioLabel } from '../../components/ui/Radio'
import { Content } from '../App'
import { Heading1, Heading2 } from '../../components/ui/Text'
import { Statistics } from '../../components/ui/Box/Statistics'
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableData,
  TableDataGroup,
} from '../../components/ui/Table'
import { useWallet } from '../../context/Web3Manager'
import { useContracts } from '../../context/ContractsManager'
import getPermitNFTSignature, { getPermitDigest, sign, getDomainSeparator } from '../../utils/signature'
import { getProviderOrSigner } from '../../utils/index'
import { BigNumberish, BigNumber as BN } from 'ethers'
import { formatEther, parseEther } from '@ethersproject/units'
import { Button } from '../../components/ui/Button'
import { AmountModal } from '../../components/ui/Modal/AmountModal'

import { NUM_BLOCKS_PER_DAY, NUM_DAYS_PER_MONTH, DAYS_PER_YEAR, TOKEN_NAME, DEADLINE } from '../../constants'
import { encodePriceSqrt, FeeAmount, TICK_SPACINGS, getMaxTick, getMinTick } from '../../utils/uniswap'

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

  const [assets, setAssets] = useState<number>(0)
  const [select, setSelect] = useState<string>('1')
  const [userVaultShare, setUserVaultShare] = useState<number>(0)

  const [cpUserRewardsPerDay, setCpUserRewardsPerDay] = useState<string>('0.00')
  const [lpUserRewardsPerDay, setLpUserRewardsPerDay] = useState<string>('0.00')

  const [cpRewardsPerDay, setCpRewardsPerDay] = useState<string>('0.00')
  const [lpRewardsPerDay, setLpRewardsPerDay] = useState<string>('0.00')

  const [cpUserRewards, setCpUserRewards] = useState<string>('0.00')
  const [lpUserRewards, setLpUserRewards] = useState<string>('0.00')

  const [cpPoolValue, setCpPoolValue] = useState<string>('0.00')
  const [lpPoolValue, setLpPoolValue] = useState<string>('0.00')

  const [cpUserValue, setCpUserValue] = useState<string>('0.00')
  const [lpUserValue, setLpUserValue] = useState<string>('0.00')

  const [scp, setScp] = useState<string>('0.00')

  const [loading, setLoading] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [func, setFunc] = useState<any>()
  const [modalTitle, setModalTitle] = useState<string>('')

  const [amount, setAmount] = useState<string>('')
  const [maxLoss, setMaxLoss] = useState<number>(5)

  const [unit, setUnit] = useState<string>('ETH')

  const [nft, setNft] = useState<BN>()

  const refresh = async () => {
    getCapitalPoolSize()
    getUserVaultShare()
    getCpUserRewardsPerDay()
    getLpUserRewardsPerDay()
    getCpRewardsPerDay()
    getLpRewardsPerDay()
    getCpUserRewards()
    getLpUserRewards()
  }

  const openModal = async (func: any, modalTitle: string, unit: string) => {
    setShowModal((prev) => !prev)
    document.body.style.overflowY = 'hidden'
    setUnit(unit)
    setModalTitle(modalTitle)
    setFunc(() => func)
  }

  const closeModal = async () => {
    setShowModal(false)
    document.body.style.overflowY = 'scroll'
    setLoading(false)
    setAmount('')
  }

  const claimCpRewards = async () => {
    if (!cpFarmContract.current || !vaultContract.current) return
    await cpFarmContract.current.withdrawRewards()
    const vaultBalance = await vaultContract.current.balanceOf(wallet.account)
    console.log(formatEther(vaultBalance))
  }

  const claimLpRewards = async () => {
    if (!lpFarmContract.current) return
    setLoading(true)
    await lpFarmContract.current.withdrawRewards().then((ans: any) => {
      setLoading(false)
    })
  }

  const getNumFarms = async () => {
    if (!masterContract.current) return
    try {
      const ans = await masterContract.current.numFarms()
      return ans
    } catch (err) {
      console.log('error getNumFarms ', err)
    }
  }

  const getCpUserRewards = async () => {
    const farms = await getNumFarms()
    if (!cpFarmContract.current || farms === 0 || !wallet.account) return
    try {
      const pendingReward = await cpFarmContract.current.pendingRewards(wallet.account)
      const formattedPendingReward = formatEther(pendingReward)
      console.log(formattedPendingReward)
      setCpUserRewards(formattedPendingReward)
      return pendingReward
    } catch (err) {
      console.log('error getUserRewards ', err)
    }
  }

  const getLpUserRewards = async () => {
    const farms = await getNumFarms()
    if (!lpFarmContract.current || farms === 0 || !wallet.account) return
    try {
      const pendingReward = await lpFarmContract.current.pendingRewards(wallet.account)
      const formattedPendingReward = formatEther(pendingReward)
      setLpUserRewards(formattedPendingReward)
      return pendingReward
    } catch (err) {
      console.log('error getUserRewards ', err)
    }
  }

  const getCpRewardsPerDay = async () => {
    if (!masterContract.current || !cpFarmContract.current || !wallet.account) return
    try {
      const cpAllocPoints = await masterContract.current.allocPoints(1)
      const totalAllocPoints = await masterContract.current.totalAllocPoints()
      const solacePerBlock = await masterContract.current.solacePerBlock()
      const rewards: BN = solacePerBlock.mul(NUM_BLOCKS_PER_DAY).mul(cpAllocPoints).div(totalAllocPoints)
      const formattedRewards = formatEther(rewards)
      if (cpRewardsPerDay !== formattedRewards) setCpRewardsPerDay(formattedRewards)
    } catch (err) {
      console.log('error getCpRewardsPerDay', err)
    }
  }

  const getLpRewardsPerDay = async () => {
    if (!masterContract.current || !lpFarmContract.current || !wallet.account) return
    try {
      const lpAllocPoints = await masterContract.current.allocPoints(2)
      const totalAllocPoints = await masterContract.current.totalAllocPoints()
      const solacePerBlock = await masterContract.current.solacePerBlock()

      const rewards: BN = solacePerBlock.mul(NUM_BLOCKS_PER_DAY).mul(lpAllocPoints).div(totalAllocPoints)
      const formattedRewards = formatEther(rewards)
      if (lpRewardsPerDay !== formattedRewards) setLpRewardsPerDay(formattedRewards)
    } catch (err) {
      console.log('error getLpRewardsPerDay', err)
    }
  }

  const getCpUserRewardsPerDay = async () => {
    if (!masterContract.current || !cpFarmContract.current || !wallet.account) return
    try {
      const poolValue = await getCpPoolValue()
      if (!poolValue) return
      const cpUser = await cpFarmContract.current.userInfo(wallet.account)
      const cpUserValue = cpUser.value
      const cpAllocPoints = await masterContract.current.allocPoints(1)
      const totalAllocPoints = await masterContract.current.totalAllocPoints()
      const solacePerBlock = await masterContract.current.solacePerBlock()

      let rewards: BN = BN.from('0')

      if (poolValue > 0) {
        const allocPercentage: BN = cpAllocPoints.div(totalAllocPoints)
        const poolPercentage: BN = cpUserValue.div(poolValue)
        rewards = solacePerBlock.mul(NUM_BLOCKS_PER_DAY).mul(allocPercentage).mul(poolPercentage)
      }

      const formattedRewards = formatEther(rewards)
      const formattedCpUserValue = formatEther(cpUserValue)

      setCpUserValue(formattedCpUserValue)
      if (cpUserRewardsPerDay !== formattedRewards) setCpUserRewardsPerDay(formattedRewards)
    } catch (err) {
      console.log('error getCpUserRewardsPerDay', err)
    }
  }

  const getLpUserRewardsPerDay = async () => {
    if (!masterContract.current || !lpFarmContract.current || !wallet.account) return
    try {
      const poolValue = await getLpPoolValue()
      if (!poolValue) return
      const lpUser = await lpFarmContract.current.userInfo(wallet.account)
      const lpUserValue = lpUser.value
      const lpAllocPoints = await masterContract.current.allocPoints(2)
      const totalAllocPoints = await masterContract.current.totalAllocPoints()
      const solacePerBlock = await masterContract.current.solacePerBlock()

      let rewards: BN = BN.from('0')

      if (poolValue > 0) {
        const allocPercentage: BN = lpAllocPoints.div(totalAllocPoints)
        const poolPercentage: BN = lpUserValue.div(poolValue)
        rewards = solacePerBlock.mul(NUM_BLOCKS_PER_DAY).mul(allocPercentage).mul(poolPercentage)
      }

      const formattedRewards = formatEther(rewards)
      const formattedLpUserValue = formatEther(lpUserValue)

      setLpUserValue(formattedLpUserValue)
      if (lpUserRewardsPerDay !== formattedRewards) setLpUserRewardsPerDay(formattedRewards)
    } catch (err) {
      console.log('error getLpUserRewardsPerDay', err)
    }
  }

  const getCpPoolValue = async () => {
    if (!cpFarmContract.current) return
    try {
      const poolValue = await cpFarmContract.current.valueStaked()
      const formattedPoolValue = formatEther(poolValue)
      if (cpPoolValue !== poolValue) setCpPoolValue(formattedPoolValue)
      return poolValue
    } catch (err) {
      console.log('error getCpPoolValue', err)
    }
  }

  const getLpPoolValue = async () => {
    if (!lpFarmContract.current) return
    try {
      const poolValue = await lpFarmContract.current.valueStaked()
      const formattedPoolValue = formatEther(poolValue)
      if (lpPoolValue !== poolValue) setLpPoolValue(formattedPoolValue)
      return poolValue
    } catch (err) {
      console.log('error getLpPoolValue', err)
    }
  }

  const getUserVaultShare = async () => {
    if (!cpFarmContract.current?.provider || !vaultContract.current?.provider || !wallet.account) return
    try {
      const totalSupply = await vaultContract.current.totalSupply()
      const userInfo = await cpFarmContract.current.userInfo(wallet.account)
      const value = userInfo.value
      const cpBalance = await getScp()
      const sharePercentage = totalSupply > 0 ? parseFloat(cpBalance.add(value).mul(100)) / totalSupply : 0
      setUserVaultShare(sharePercentage)
    } catch (err) {
      console.log('error getUserVaultShare ', err)
    }
  }

  const getCapitalPoolSize = async () => {
    if (!vaultContract.current || !registryContract.current) return
    try {
      const addr = await registryContract.current.governance()
      console.log('GOVERNANCE ', addr)
      const ans = await vaultContract.current.totalAssets().then((ans: any) => {
        return ans
      })
      setAssets(ans)
    } catch (err) {
      console.log('error getCapitalPoolSize ', err)
    }
  }

  const getScp = async () => {
    if (!vaultContract.current?.provider || !wallet.account) return

    try {
      const balance = await vaultContract.current.balanceOf(wallet.account)
      const formattedBalance = formatEther(balance)
      if (scp !== balance) setScp(formattedBalance)
      return balance
    } catch (err) {
      console.log('error getScp ', err)
    }
  }

  const callDepositVault = async (amount: number) => {
    setLoading(true)
    if (!vaultContract.current) return

    try {
      const tx = await vaultContract.current.deposit({ value: parseEther(amount.toString()) })
      await tx.wait()
      const r = await vaultContract.current.on('DepositMade', (sender, amount, shares, tx) => {
        console.log('DepositVault event: ', tx)
        wallet.updateBalance(wallet.balance.sub(amount))
        refresh()
        closeModal()
      })
    } catch (err) {
      console.log('callDepositVault ', err)
      refresh()
      closeModal()
    }
  }

  const callDepositEth = async (amount: number) => {
    setLoading(true)
    if (!cpFarmContract.current || !vaultContract.current) return
    try {
      const deposit = await cpFarmContract.current.depositEth({ value: parseEther(amount.toString()) })
      await deposit.wait()
      await cpFarmContract.current.on('DepositEth', (sender, amount, tx) => {
        console.log('DepositEth event: ', tx)
        wallet.updateBalance(wallet.balance.sub(amount))
        refresh()
        closeModal()
      })
    } catch (err) {
      console.log('error callDepositEth ', err)
      refresh()
      closeModal()
    }
  }

  const callDepositCp = async (amount: number) => {
    setLoading(true)
    if (!cpFarmContract.current || !vaultContract.current) return
    try {
      const approval = await vaultContract.current.approve(
        cpFarmContract.current.address,
        parseEther(amount.toString())
      )
      await approval.wait()
      await vaultContract.current.on('Approval', (owner, spender, value, tx) => {
        console.log('approval event: ', tx)
      })
      const deposit = await cpFarmContract.current.depositCp(parseEther(amount.toString()))
      await deposit.wait()
      await cpFarmContract.current.on('DepositCp', (sender, amount, tx) => {
        console.log('DepositCp event: ', tx)
        wallet.updateBalance(wallet.balance.sub(amount))
        refresh()
        closeModal()
      })
    } catch (err) {
      console.log('error callDepositCp ', err)
      refresh()
      closeModal()
    }
  }

  const callWithdrawVault = async (amount: number, maxLoss: number) => {
    setLoading(true)
    if (!vaultContract.current) return

    try {
      const tx = await vaultContract.current.withdraw(parseEther(amount.toString()), maxLoss)
      await tx.wait()
      await vaultContract.current.on('WithdrawalMade', (sender, amount, tx) => {
        console.log('withdrawal event: ', tx)
        wallet.updateBalance(wallet.balance.add(amount))
        refresh()
        closeModal()
      })
    } catch (err) {
      console.log('callWithdrawVault ', err)
      refresh()
      closeModal()
    }
  }

  const callWithdrawCp = async (amount: number, maxLoss: number) => {
    setLoading(true)
    if (!cpFarmContract.current) return
    try {
      const withdraw = await cpFarmContract.current.withdrawEth(parseEther(amount.toString()), maxLoss)
      await withdraw.wait()
      await cpFarmContract.current.on('WithdrawEth', (sender, amount, tx) => {
        console.log('WithdrawEth event: ', tx)
        wallet.updateBalance(wallet.balance.add(amount))
        refresh()
        closeModal()
      })
    } catch (err) {
      console.log('error callWithdrawCp ', err)
      refresh()
      closeModal()
    }
  }

  const callDepositLp = async () => {
    setLoading(true)
    console.log(lpTokenContract.current, lpFarmContract.current, nft)
    if (!lpTokenContract.current || !lpFarmContract.current || !nft) return
    console.log('depositLP')
    try {
      const { v, r, s } = await getPermitNFTSignature(
        wallet,
        lpTokenContract.current,
        lpFarmContract.current.address,
        nft,
        DEADLINE
      )
      const depositSigned = await lpFarmContract.current.depositSigned(wallet.account, nft, DEADLINE, v, r, s)
      await depositSigned.wait()
      await lpFarmContract.current.on('Deposit', (sender, token, tx) => {
        console.log('DepositSigned event: ', tx)
        refresh()
        closeModal()
      })
    } catch (err) {
      console.log('callDepositLp ', err)
      refresh()
      closeModal()
    }
  }

  const callWithdrawLp = async () => {
    setLoading(true)
    if (!lpFarmContract.current) return

    try {
      const tx = await lpFarmContract.current.withdraw(nft)
      await tx.wait()
      await lpFarmContract.current.on('Withdraw', (sender, token, tx) => {
        console.log('withdrawLp event: ', tx)
        refresh()
        closeModal()
      })
    } catch (err) {
      console.log('callWithdrawLp ', err)
      refresh()
      closeModal()
    }
  }

  const callMintLpToken = async (amount: number) => {
    if (!wethContract.current || !solaceContract.current || !lpTokenContract.current) return
    setLoading(true)
    try {
      await solaceContract.current
        .connect(getProviderOrSigner(wallet.library, wallet.account))
        .addMinter(wallet.account)
      await solaceContract.current
        .connect(getProviderOrSigner(wallet.library, wallet.account))
        .mint(wallet.account, amount)
      await wethContract.current.connect(getProviderOrSigner(wallet.library, wallet.account)).deposit({ value: amount })
      const wethAllowance1 = await wethContract.current
        .connect(getProviderOrSigner(wallet.library, wallet.account))
        .allowance(wallet.account, lpTokenContract.current.address)
      const solaceAllowance1 = await solaceContract.current
        .connect(getProviderOrSigner(wallet.library, wallet.account))
        .allowance(wallet.account, lpTokenContract.current.address)
      console.log(wethAllowance1.toString())
      console.log(solaceAllowance1.toString())
      await solaceContract.current
        .connect(getProviderOrSigner(wallet.library, wallet.account))
        .approve(lpTokenContract.current.address, amount)
      await wethContract.current
        .connect(getProviderOrSigner(wallet.library, wallet.account))
        .approve(lpTokenContract.current.address, amount)
      const wethAllowance2 = await wethContract.current
        .connect(getProviderOrSigner(wallet.library, wallet.account))
        .allowance(wallet.account, lpTokenContract.current.address)
      const solaceAllowance2 = await solaceContract.current
        .connect(getProviderOrSigner(wallet.library, wallet.account))
        .allowance(wallet.account, lpTokenContract.current.address)
      console.log(wethAllowance2.toString())
      console.log(solaceAllowance2.toString())
      const nft = await mintLpToken(wethContract.current, solaceContract.current, FeeAmount.MEDIUM, BN.from(amount))
      console.log('Total Supply of LP Tokens', nft.toNumber())
      setNft(nft)
      refresh()
      closeModal()
    } catch (err) {
      console.log(err)
      refresh()
      closeModal()
    }
  }

  // const mintAndDeposit = async () => {
  //   if (
  //     !lpTokenContract.current ||
  //     !lpFarmContract.current ||
  //     !solaceContract.current ||
  //     !wallet.networkId ||
  //     !wallet.account ||
  //     !wallet.library
  //   )
  //     return
  //   const approve = { owner: wallet.account, spender: lpFarmContract.current.address, value: excessiveDepositAmount }
  //   const digest = getPermitDigest(
  //     TOKEN_NAME,
  //     solaceContract.current.address,
  //     wallet.networkId,
  //     approve,
  //     nonce,
  //     DEADLINE
  //   )
  //   const { v, r, s } = wallet.library.send('eth_signTypedData_v4', [wallet.account])
  //   await lpTokenContract.current.mintAndDeposit({
  //     depositor: wallet.account,
  //     amountSolace: excessiveDepositAmount,
  //     amount0Desired: amount,
  //     amount1Desired: amount,
  //     amount0Min: 0,
  //     amount1Min: 0,
  //     deadline: DEADLINE,
  //     tickLower: getMinTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
  //     tickUpper: getMaxTick(TICK_SPACINGS[FeeAmount.MEDIUM]),
  //     v: v,
  //     r: r,
  //     s: s,
  //   })
  // }

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

  function sortTokens(tokenA: string, tokenB: string) {
    return BN.from(tokenA).lt(BN.from(tokenB)) ? [tokenA, tokenB] : [tokenB, tokenA]
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSelect(value)
  }

  const handleCallbackFunc = async () => {
    if (!func) return
    await func(amount, maxLoss)
  }

  const handleAmount = (amount: string) => {
    const filteredAmount = amount.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
    setAmount(filteredAmount)
  }

  const isAppropriateAmount = () => {
    if (amount == '' || parseEther(amount) <= BN.from('0')) return false
    switch (func.toString()) {
      // if depositing into vault or eth into farm, check eth
      case callDepositVault.toString():
      case callDepositEth.toString():
        return wallet.balance.gte(parseEther(amount))
      // if depositing cp into farm or withdrawing from vault, check scp
      case callDepositCp.toString():
      case callWithdrawVault.toString():
        return parseEther(scp).gte(parseEther(amount))
      // if withdrawing cp from the farm, check user stake
      case callWithdrawCp.toString():
        return parseEther(cpUserValue).gte(parseEther(amount))
      default:
        return true
    }
  }

  useEffect(() => {
    vaultContract.current = vault
    cpFarmContract.current = cpFarm
    lpFarmContract.current = lpFarm
    masterContract.current = master
    lpTokenContract.current = lpToken
    wethContract.current = weth
    solaceContract.current = solace
    registryContract.current = registry

    refresh()
  }, [vault, cpFarm, lpFarm, master, lpToken, weth, registry])

  return wallet.initialized ? (
    <Fragment>
      {/* <Statistics /> */}
      <Modal isOpen={showModal}>
        <ModalHeader>
          <Heading2>{modalTitle}</Heading2>
          <ModalCloseButton hidden={loading} onClick={() => closeModal()} />
        </ModalHeader>
        <ModalContent>
          <ModalRow>
            <ModalCell t2>{unit}</ModalCell>
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
                onChange={(e) => handleAmount(e.target.value)}
                value={amount}
              />
            </ModalCell>
          </ModalRow>
          <RadioGroup>
            <RadioLabel>
              <RadioInput type="radio" value="1" checked={select === '1'} onChange={(e) => handleSelectChange(e)} />
              <RadioElement>radio1</RadioElement>
            </RadioLabel>
            <RadioLabel>
              <RadioInput type="radio" value="2" checked={select === '2'} onChange={(e) => handleSelectChange(e)} />
              <RadioElement>radio2</RadioElement>
            </RadioLabel>
            <RadioLabel>
              <RadioInput type="radio" value="3" checked={select === '3'} onChange={(e) => handleSelectChange(e)} />
              <RadioElement>radio3</RadioElement>
            </RadioLabel>
          </RadioGroup>
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
        <Heading1>Risk Back ETH - Capital Pool</Heading1>
        <Table isHighlight>
          <TableHead>
            <TableRow>
              {wallet.isActive ? <TableHeader>Vault Share</TableHeader> : null}
              <TableHeader>ROI(1Y)</TableHeader>
              <TableHeader>Total Assets</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {wallet.isActive ? <TableData>{`${userVaultShare.toFixed(2)}%`}</TableData> : null}
              <TableData>6.50%</TableData>
              <TableData>{parseFloat(formatEther(assets).toString()).toFixed(2)}</TableData>
              {wallet.account && !loading ? (
                <TableData cellAlignRight>
                  <TableDataGroup>
                    <Button onClick={() => openModal(callDepositVault, 'Deposit into Vault', 'ETH')}>
                      Deposit into Vault
                    </Button>
                    <Button onClick={() => openModal(callWithdrawVault, 'Withdraw from Vault', 'Solace CP Token')}>
                      Withdraw from Vault
                    </Button>
                    <Button onClick={() => openModal(callDepositEth, 'Deposit Eth and Stake', 'ETH')}>
                      Deposit Eth and Stake
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
              {wallet.account ? <TableHeader>My Rewards</TableHeader> : null}
              <TableHeader>ROI(1Y)</TableHeader>
              <TableHeader>Total Assets</TableHeader>
              {wallet.account ? <TableHeader>My Daily Rewards</TableHeader> : null}
              <TableHeader>Daily Rewards</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {wallet.account ? <TableData>{parseFloat(cpUserValue).toFixed(2)}</TableData> : null}
              {wallet.account ? <TableData>{parseFloat(cpUserRewards).toFixed(2)}</TableData> : null}
              <TableData>150.00%</TableData>
              <TableData>{parseFloat(cpPoolValue).toFixed(2)}</TableData>
              {wallet.account ? <TableData>{parseFloat(cpUserRewardsPerDay).toFixed(2)}</TableData> : null}
              <TableData>{parseFloat(cpRewardsPerDay).toFixed(2)}</TableData>
              {wallet.account && !loading ? (
                <TableData cellAlignRight>
                  <TableDataGroup>
                    <Button onClick={() => openModal(callDepositCp, 'Deposit CP', 'Solace CP Token')}>
                      Deposit CP
                    </Button>
                    <Button onClick={() => openModal(callWithdrawCp, 'Withdraw CP', 'Solace CP Token')}>
                      Withdraw CP
                    </Button>
                    <Button onClick={claimCpRewards}>Claim</Button>
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
              {wallet.account ? <TableHeader>My Rewards</TableHeader> : null}
              <TableHeader>ROI(1Y)</TableHeader>
              <TableHeader>Total Assets</TableHeader>
              {wallet.account ? <TableHeader>My Daily Rewards</TableHeader> : null}
              <TableHeader>Daily Rewards</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {wallet.account ? <TableData>{parseFloat(lpUserRewards).toFixed(2)}</TableData> : null}
              <TableData>150.00%</TableData>
              <TableData>{parseFloat(lpPoolValue).toFixed(2)}</TableData>
              {wallet.account ? <TableData>{parseFloat(lpUserRewardsPerDay).toFixed(2)}</TableData> : null}
              <TableData>{parseFloat(lpRewardsPerDay).toFixed(2)}</TableData>
              {wallet.account && !loading ? (
                <TableData cellAlignRight>
                  <TableDataGroup>
                    <Button onClick={() => openModal(callMintLpToken, 'Mint LP', 'LP')}>Mint LP</Button>
                    <Button onClick={() => openModal(callDepositLp, 'Deposit LP', 'LP')}>Deposit LP</Button>
                    <Button onClick={() => openModal(callWithdrawLp, 'Withdraw LP', 'LP')}>Withdraw LP</Button>
                    <Button onClick={claimLpRewards}>Claim</Button>
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
              <TableHeader>Transaction Type</TableHeader>
              <TableHeader>Address</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Hash</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Details</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableData>SOLACE/ETH LIQ PROVIDER</TableData>
              <TableData>3.2 SOLACE-LP TOKENS</TableData>
              <TableData>0xS0lac3</TableData>
              <TableData>22:14 - May 29, 2030</TableData>
              <TableData>0xfb33...</TableData>
              <TableData>Complete</TableData>
              <TableData cellAlignCenter>OK</TableData>
            </TableRow>
            <TableRow>
              <TableData>Reward claim</TableData>
              <TableData>333 SOLACE</TableData>
              <TableData>0xS0887a</TableData>
              <TableData>20:14 - May 29, 2030</TableData>
              <TableData>0xff33...</TableData>
              <TableData>In Progress</TableData>
              <TableData cellAlignCenter>NO</TableData>
            </TableRow>
            <TableRow>
              <TableData>RISK BACK LIQ PROVIDER</TableData>
              <TableData>3 ETH</TableData>
              <TableData>0xS0ladd</TableData>
              <TableData>19:14 - May 29, 2030</TableData>
              <TableData>0xfb30...</TableData>
              <TableData>Complete</TableData>
              <TableData cellAlignCenter>OK</TableData>
            </TableRow>
          </TableBody>
        </Table>
      </Content>
    </Fragment>
  ) : (
    <Loader />
  )
}

export default Invest
