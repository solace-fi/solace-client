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
import { ethers, constants, BigNumberish, BigNumber as BN, Wallet } from 'ethers'
import { formatEther } from '@ethersproject/units'
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

  const [cpUserRewardsPerDay, setCpUserRewardsPerDay] = useState<number>(0)
  const [lpUserRewardsPerDay, setLpUserRewardsPerDay] = useState<number>(0)

  const [cpRewardsPerDay, setCpRewardsPerDay] = useState<number>(0)
  const [lpRewardsPerDay, setLpRewardsPerDay] = useState<number>(0)

  const [cpUserRewards, setCpUserRewards] = useState<number>(0)
  const [lpUserRewards, setLpUserRewards] = useState<number>(0)

  const [userVaultShare, setUserVaultShare] = useState<number>(0)
  const [cpPoolValue, setCpPoolValue] = useState<number>(0)
  const [lpPoolValue, setLpPoolValue] = useState<number>(0)
  const [scp, setScp] = useState<number>(0)

  const [loading, setLoading] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [func, setFunc] = useState<any>()
  const [modalTitle, setModalTitle] = useState<string>('')

  const [amount, setAmount] = useState<string>('')
  const [maxLoss, setMaxLoss] = useState<number>(5)

  const [unit, setUnit] = useState<string>('ETH')

  const [nft, setNft] = useState<BN>()

  const refresh = async () => {
    getTotalAssets()
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
    if (!cpFarmContract.current) return
    setLoading(true)
    await cpFarmContract.current.withdrawRewards().then((ans: any) => {
      setLoading(false)
    })
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
      const ans = await masterContract.current.numFarms().then((ans: any) => {
        return ans
      })
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
      const blockReward = await cpFarmContract.current.accRewardPerShare()
      // console.log('cp block reward', formatEther(blockReward))
      if (cpUserRewards !== pendingReward) setCpUserRewards(parseFloat(pendingReward))
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
      const blockReward = await lpFarmContract.current.accRewardPerShare()
      // console.log('lp block reward', formatEther(blockReward))
      if (lpUserRewards !== pendingReward) setLpUserRewards(parseFloat(pendingReward))
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

      const rewards = solacePerBlock * NUM_BLOCKS_PER_DAY * (cpAllocPoints / totalAllocPoints)
      if (cpRewardsPerDay !== rewards) setCpRewardsPerDay(rewards)
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

      const rewards = solacePerBlock * NUM_BLOCKS_PER_DAY * (lpAllocPoints / totalAllocPoints)
      if (lpRewardsPerDay !== rewards) setLpRewardsPerDay(rewards)
    } catch (err) {
      console.log('error getLpRewardsPerDay', err)
    }
  }

  const getCpUserRewardsPerDay = async () => {
    if (!masterContract.current || !cpFarmContract.current || !wallet.account) return
    try {
      const cpPoolValue = await getCpPoolValue()
      if (!cpPoolValue) return
      const cpUser = await cpFarmContract.current.userInfo(wallet.account)
      const cpUserValue = cpUser.value
      const cpAllocPoints = await masterContract.current.allocPoints(1)
      const totalAllocPoints = await masterContract.current.totalAllocPoints()
      const solacePerBlock = await masterContract.current.solacePerBlock()

      const cpUserRewards =
        cpPoolValue > 0
          ? ((solacePerBlock * NUM_BLOCKS_PER_DAY * parseFloat(formatEther(cpUserValue))) /
              parseFloat(formatEther(cpPoolValue))) *
            (cpAllocPoints / totalAllocPoints)
          : 0
      if (cpUserRewardsPerDay !== cpUserRewards) setCpUserRewardsPerDay(cpUserRewards)
    } catch (err) {
      console.log('error getCpUserRewardsPerDay', err)
    }
  }

  const getLpUserRewardsPerDay = async () => {
    if (!masterContract.current || !lpFarmContract.current || !wallet.account) return
    try {
      const lpPoolValue = await getLpPoolValue()
      if (!lpPoolValue) return
      const lpUser = await lpFarmContract.current.userInfo(wallet.account)
      const lpUserValue = lpUser.value
      const lpAllocPoints = await masterContract.current.allocPoints(2)
      const totalAllocPoints = await masterContract.current.totalAllocPoints()
      const solacePerBlock = await masterContract.current.solacePerBlock()

      const lpUserRewards =
        lpPoolValue > 0
          ? ((solacePerBlock * NUM_BLOCKS_PER_DAY * parseFloat(formatEther(lpUserValue))) /
              parseFloat(formatEther(lpPoolValue))) *
            (lpAllocPoints / totalAllocPoints)
          : 0
      if (lpUserRewardsPerDay !== lpUserRewards) setLpUserRewardsPerDay(lpUserRewards)
    } catch (err) {
      console.log('error getLpUserRewardsPerDay', err)
    }
  }

  const getCpPoolValue = async () => {
    if (!cpFarmContract.current) return
    try {
      const cpFarmPoolValue = await cpFarmContract.current.valueStaked()
      if (cpPoolValue !== cpFarmPoolValue) setCpPoolValue(cpFarmPoolValue)
      return cpFarmPoolValue
    } catch (err) {
      console.log('error getCpPoolValue', err)
    }
  }

  const getLpPoolValue = async () => {
    if (!lpFarmContract.current) return
    try {
      const lpFarmPoolValue = await lpFarmContract.current.valueStaked()
      if (lpPoolValue !== lpFarmPoolValue) setLpPoolValue(lpFarmPoolValue)
      return lpFarmPoolValue
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
      const share = totalSupply > 0 ? (parseFloat(cpBalance) + parseFloat(value)) / parseFloat(totalSupply) : 0
      setUserVaultShare(share)
      return value
    } catch (err) {
      console.log('error getUserVaultShare ', err)
    }
  }

  const getTotalAssets = async () => {
    if (!vaultContract.current || !registryContract.current) return
    try {
      const addr = await registryContract.current.governance()
      console.log('GOVERNANCE ', addr)
      const ans = await vaultContract.current.totalAssets().then((ans: any) => {
        return ans
      })
      setAssets(ans)
    } catch (err) {
      console.log('error getTotalAssets ', err)
    }
  }

  const getScp = async () => {
    if (!vaultContract.current?.provider || !wallet.account) return

    try {
      const balance = await vaultContract.current.balanceOf(wallet.account)
      const formattedBalance = parseFloat(formatEther(balance))
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
      const tx = await vaultContract.current.deposit({ value: ethers.utils.parseEther(amount.toString()) })
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
      const deposit = await cpFarmContract.current.depositEth({ value: ethers.utils.parseEther(amount.toString()) })
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
        ethers.utils.parseEther(amount.toString())
      )
      await approval.wait()
      await vaultContract.current.on('Approval', (owner, spender, value, tx) => {
        console.log('approval event: ', tx)
      })
      const deposit = await cpFarmContract.current.depositCp(ethers.utils.parseEther(amount.toString()))
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
      const tx = await vaultContract.current.withdraw(ethers.utils.parseEther(amount.toString()), maxLoss)
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
      const withdraw = await cpFarmContract.current.withdrawEth(ethers.utils.parseEther(amount.toString()), maxLoss)
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
    if (!lpTokenContract.current) return
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
              <Button hidden={loading} disabled={amount === '' || parseFloat(amount) <= 0} onClick={handleCallbackFunc}>
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
              {wallet.isActive ? <TableData>{`${(userVaultShare * 100).toFixed(2)}%`}</TableData> : null}
              <TableData>HC6.5%</TableData>
              <TableData>{formatEther(assets).toString()}</TableData>
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
              {wallet.account ? <TableHeader>My Rewards</TableHeader> : null}
              <TableHeader>ROI(1Y)</TableHeader>
              <TableHeader>Total Assets</TableHeader>
              {wallet.account ? <TableHeader>My Daily Rewards</TableHeader> : null}
              <TableHeader>Daily Rewards</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {wallet.account ? <TableData>{cpUserRewards.toFixed(2)}</TableData> : null}
              <TableData>HC150%</TableData>
              <TableData>{formatEther(cpPoolValue).toString()}</TableData>
              {wallet.account ? <TableData>{cpUserRewardsPerDay.toFixed(2)}</TableData> : null}
              <TableData>{cpRewardsPerDay.toFixed(2)}</TableData>
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
              {wallet.account ? <TableData>{lpUserRewards.toFixed(2)}</TableData> : null}
              <TableData>HC150%</TableData>
              <TableData>{formatEther(lpPoolValue).toString()}</TableData>
              {wallet.account ? <TableData>{lpUserRewardsPerDay.toFixed(2)}</TableData> : null}
              <TableData>{lpRewardsPerDay.toFixed(2)}</TableData>
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
              <TableHeader>Tx Type</TableHeader>
              <TableHeader>Address</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Date</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableData></TableData>
              <TableData></TableData>
              <TableData></TableData>
              <TableData></TableData>
            </TableRow>
            <TableRow>
              <TableData></TableData>
              <TableData></TableData>
              <TableData></TableData>
              <TableData></TableData>
            </TableRow>
            <TableRow>
              <TableData></TableData>
              <TableData></TableData>
              <TableData></TableData>
              <TableData></TableData>
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
