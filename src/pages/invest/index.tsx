import React, { useEffect, useRef, useState, Fragment } from 'react'
import { Contract } from '@ethersproject/contracts'
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
import { Heading1, Heading2 } from '../../components/Text'
import { Table, TableHead, TableHeader, TableRow, TableBody, TableData, TableDataGroup } from '../../components/Table'
import { useWallet } from '../../context/Web3Manager'
import { useContracts } from '../../context/ContractsManager'
import getPermitNFTSignature from '../../utils/signature'
import { getProviderOrSigner } from '../../utils/index'
import { BigNumberish, BigNumber as BN } from 'ethers'
import { formatEther, parseEther } from '@ethersproject/units'
import { Button } from '../../components/Button'
import { fixed } from '../../utils/fixedValue'

import { NUM_BLOCKS_PER_DAY, ZERO, DEADLINE, CP_ROI, LP_ROI } from '../../constants'
import { encodePriceSqrt, FeeAmount, TICK_SPACINGS, getMaxTick, getMinTick } from '../../utils/uniswap'

import { useCapitalPoolSize } from '../../hooks/useCapitalPoolSize'
import { useRewardsPerDay, useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'
import { useScpBalance } from '../../hooks/useScpBalance'
import { usePoolStakedValue } from '../../hooks/usePoolStakedValue'
import { useUserStakedValue } from '../../hooks/useUserStakedValue'
import { useEthBalance } from '../../hooks/useEthBalance'

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

  // const [cpUserRewardsPerDay, setCpUserRewardsPerDay] = useState<string>('0.00')
  // const [lpUserRewardsPerDay, setLpUserRewardsPerDay] = useState<string>('0.00')
  // const [cpRewardsPerDay, setCpRewardsPerDay] = useState<string>('0.00')
  // const [lpRewardsPerDay, setLpRewardsPerDay] = useState<string>('0.00')
  // const [cpUserRewards, setCpUserRewards] = useState<string>('0.00')
  // const [lpUserRewards, setLpUserRewards] = useState<string>('0.00')
  // const [cpPoolValue, setCpPoolValue] = useState<string>('0.00')
  // const [lpPoolValue, setLpPoolValue] = useState<string>('0.00')
  // const [cpUserStakeValue, setCpUserValue] = useState<string>('0.00')
  // const [lpUserStakeValue, setLpUserValue] = useState<string>('0.00')
  // const [capitalPoolSize, setCapitalPoolSize] = useState<number>(0)
  // const [scpBalance, setScpBalance] = useState<string>('0.00')

  const ethBalance = useEthBalance()
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

  const [select, setSelect] = useState<string>('1')
  const [userVaultShare, setUserVaultShare] = useState<number>(0)
  const [userVaultAssets, setUserVaultAssets] = useState<string>('0.00')

  const [loading, setLoading] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [func, setFunc] = useState<any>()
  const [modalTitle, setModalTitle] = useState<string>('')

  const [amount, setAmount] = useState<string>('')
  const [maxLoss, setMaxLoss] = useState<number>(5)

  const [unit, setUnit] = useState<string>('ETH')

  const [nft, setNft] = useState<BN>()

  const refresh = async () => {
    getUserVaultDetails()
    // getCapitalPoolSize()
    // getCpUserRewardsPerDay()
    // getLpUserRewardsPerDay()
    // getCpRewardsPerDay()
    // getLpRewardsPerDay()
    // getCpUserRewards()
    // getLpUserRewards()
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
    setSelect('1')
  }

  const claimCpRewards = async () => {
    if (!cpFarmContract.current || !vaultContract.current) return

    const vaultBalance1 = await vaultContract.current.balanceOf(wallet.account)
    console.log('balance from vault before claiming cp rewards', formatEther(vaultBalance1))

    await cpFarmContract.current.withdrawRewards()

    const vaultBalance2 = await vaultContract.current.balanceOf(wallet.account)
    console.log('balance from vault after claiming cp rewards', formatEther(vaultBalance2))
  }

  const claimLpRewards = async () => {
    if (!lpFarmContract.current) return
    setLoading(true)
    await lpFarmContract.current.withdrawRewards().then((ans: any) => {
      setLoading(false)
    })
  }

  // const getCpUserRewards = async () => {
  //   if (!masterContract.current) return
  //   const farms = await masterContract.current.numFarms()
  //   if (!cpFarmContract.current || farms.isZero() || !wallet.account) return
  //   try {
  //     const pendingReward = await cpFarmContract.current.pendingRewards(wallet.account)
  //     const formattedPendingReward = formatEther(pendingReward)
  //     setCpUserRewards(formattedPendingReward)
  //   } catch (err) {
  //     console.log('error getUserRewards ', err)
  //   }
  // }

  // const getLpUserRewards = async () => {
  //   if (!masterContract.current) return
  //   const farms = await masterContract.current?.numFarms()
  //   if (!lpFarmContract.current || farms.isZero() || !wallet.account) return
  //   try {
  //     const pendingReward = await lpFarmContract.current.pendingRewards(wallet.account)
  //     const formattedPendingReward = formatEther(pendingReward)
  //     setLpUserRewards(formattedPendingReward)
  //   } catch (err) {
  //     console.log('error getUserRewards ', err)
  //   }
  // }

  // const getMasterValues = async (farmId: number) => {
  //   if (!masterContract.current) return [ZERO, ZERO, ZERO]
  //   const allocPoints = await masterContract.current.allocPoints(farmId)
  //   const totalAllocPoints = await masterContract.current.totalAllocPoints()
  //   const solacePerBlock = await masterContract.current.solacePerBlock()
  //   return [allocPoints, totalAllocPoints, solacePerBlock]
  // }

  // const getCpRewardsPerDay = async () => {
  //   if (!masterContract.current || !cpFarmContract.current || !wallet.account) return
  //   try {
  //     const [allocPoints, totalAllocPoints, solacePerBlock] = await getMasterValues(1)
  //     const rewards: BN = solacePerBlock.mul(NUM_BLOCKS_PER_DAY).mul(allocPoints).div(totalAllocPoints)
  //     const formattedRewards = formatEther(rewards)
  //     setCpRewardsPerDay(formattedRewards)
  //   } catch (err) {
  //     console.log('error getCpRewardsPerDay', err)
  //   }
  // }

  // const getLpRewardsPerDay = async () => {
  //   if (!masterContract.current || !lpFarmContract.current || !wallet.account) return
  //   try {
  //     const [allocPoints, totalAllocPoints, solacePerBlock] = await getMasterValues(2)
  //     const rewards: BN = solacePerBlock.mul(NUM_BLOCKS_PER_DAY).mul(allocPoints).div(totalAllocPoints)
  //     const formattedRewards = formatEther(rewards)
  //     setLpRewardsPerDay(formattedRewards)
  //   } catch (err) {
  //     console.log('error getLpRewardsPerDay', err)
  //   }
  // }

  // const getCpUserRewardsPerDay = async () => {
  //   if (!masterContract.current || !cpFarmContract.current || !wallet.account) return
  //   try {
  //     const poolValue = await cpFarmContract.current.valueStaked()
  //     if (!poolValue) return
  //     const cpUser = await cpFarmContract.current.userInfo(wallet.account)
  //     const cpUserValue = cpUser.value
  //     const [allocPoints, totalAllocPoints, solacePerBlock] = await getMasterValues(1)

  //     let rewards: BN = ZERO

  //     if (poolValue.gt(ZERO)) {
  //       const allocPercentage: BN = allocPoints.div(totalAllocPoints)
  //       const poolPercentage: BN = cpUserValue.div(poolValue)
  //       rewards = solacePerBlock.mul(NUM_BLOCKS_PER_DAY).mul(allocPercentage).mul(poolPercentage)
  //     }

  //     const formattedRewards = formatEther(rewards)
  //     const formattedCpUserValue = formatEther(cpUserValue)
  //     const formattedPoolValue = formatEther(poolValue)

  //     setCpPoolValue(formattedPoolValue)
  //     setCpUserValue(formattedCpUserValue)
  //     setCpUserRewardsPerDay(formattedRewards)
  //   } catch (err) {
  //     console.log('error getCpUserRewardsPerDay', err)
  //   }
  // }

  // const getLpUserRewardsPerDay = async () => {
  //   if (!masterContract.current || !lpFarmContract.current || !wallet.account) return
  //   try {
  //     const poolValue = await lpFarmContract.current.valueStaked()
  //     if (!poolValue) return
  //     const lpUser = await lpFarmContract.current.userInfo(wallet.account)
  //     const lpUserValue = lpUser.value
  //     const [allocPoints, totalAllocPoints, solacePerBlock] = await getMasterValues(2)

  //     let rewards: BN = ZERO

  //     if (poolValue.gt(ZERO)) {
  //       const allocPercentage: BN = allocPoints.div(totalAllocPoints)
  //       const poolPercentage: BN = lpUserValue.div(poolValue)
  //       rewards = solacePerBlock.mul(NUM_BLOCKS_PER_DAY).mul(allocPercentage).mul(poolPercentage)
  //     }

  //     const formattedRewards = formatEther(rewards)
  //     const formattedLpUserValue = formatEther(lpUserValue)
  //     const formattedPoolValue = formatEther(poolValue)

  //     setLpPoolValue(formattedPoolValue)
  //     setLpUserValue(formattedLpUserValue)
  //     setLpUserRewardsPerDay(formattedRewards)
  //   } catch (err) {
  //     console.log('error getLpUserRewardsPerDay', err)
  //   }
  // }

  // const getCapitalPoolSize = async () => {
  //   if (!vaultContract.current || !registryContract.current) return
  //   try {
  //     const addr = await registryContract.current.governance()
  //     console.log('GOVERNANCE ', addr)
  //     const ans = await vaultContract.current.totalAssets()
  //     setCapitalPoolSize(ans)
  //   } catch (err) {
  //     console.log('error getCapitalPoolSize ', err)
  //   }
  // }

  // const getScpBalance = async () => {
  //   if (!vaultContract.current?.provider || !wallet.account) return

  //   try {
  //     const balance = await vaultContract.current.balanceOf(wallet.account)
  //     const formattedBalance = formatEther(balance)
  //     setScpBalance(formattedBalance)
  //     return balance
  //   } catch (err) {
  //     console.log('error getScpBalance ', err)
  //   }
  // }

  const getUserVaultDetails = async () => {
    if (!cpFarmContract.current?.provider || !vaultContract.current?.provider || !wallet.account) return
    try {
      const totalSupply = await vaultContract.current.totalSupply()
      const userInfo = await cpFarmContract.current.userInfo(wallet.account)
      const value = userInfo.value
      // const cpBalance = await getScpBalance()
      // console.log('scp + cp user staked value', cpBalance, formatEther(value))
      const cpBalance = parseEther(scpBalance)
      // console.log('scp + cp user staked value', formatEther(cpBalance), formatEther(value))
      const userAssets = cpBalance.add(value)
      const userShare = totalSupply.gt(ZERO)
        ? parseFloat(formatEther(userAssets.mul(100))) / parseFloat(formatEther(totalSupply))
        : 0
      const formattedAssets = formatEther(userAssets)
      // console.log('vault total supply', formatEther(totalSupply))
      // console.log('userAssets', formattedAssets)
      // console.log('userShare', userShare)
      setUserVaultAssets(formattedAssets)
      setUserVaultShare(userShare)
    } catch (err) {
      console.log('error getUserVaultShare ', err)
    }
  }

  const callDepositVault = async (amount: number) => {
    setLoading(true)
    if (!vaultContract.current) return

    try {
      const tx = await vaultContract.current.deposit({ value: parseEther(amount.toString()) })
      await tx.wait()
      await vaultContract.current.on('DepositMade', (sender, amount, shares, tx) => {
        console.log('DepositVault event: ', tx)
        wallet.reload()
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
        wallet.reload()
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
        wallet.reload()
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
        wallet.reload()
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
        wallet.reload()
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

  const handleAmount = (input: string) => {
    if (!amount && input == '.') input = '0.'
    const filteredAmount = input.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
    setAmount(filteredAmount)
  }

  const isAppropriateAmount = () => {
    if (!amount || parseEther(amount).lte(ZERO)) return false
    return getAssetBalanceByFunc().gte(parseEther(amount))
  }

  const getMaxAmount = () => {
    setAmount(formatEther(getAssetBalanceByFunc()))
  }

  const getAssetBalanceByFunc = (): BN => {
    switch (func.toString()) {
      // if depositing into vault or eth into farm, check eth
      case callDepositVault.toString():
      case callDepositEth.toString():
        return parseEther(ethBalance)
      // if depositing cp into farm or withdrawing from vault, check scp
      case callDepositCp.toString():
      case callWithdrawVault.toString():
        return parseEther(scpBalance)
      // if withdrawing cp from the farm, check user stake
      case callWithdrawCp.toString():
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
    refresh()
  }, [wallet, scpBalance])

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
                Available: {func ? parseFloat(formatEther(getAssetBalanceByFunc())) : 0}
              </div>
            </ModalCell>
            <ModalCell t3>
              <Button onClick={getMaxAmount}>MAX</Button>
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
  )
}

export default Invest
