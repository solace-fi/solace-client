import React, { useEffect, useRef, useState, Fragment } from 'react'
import { Contract } from '@ethersproject/contracts'

import { Heading1 } from '../../components/ui/Text'
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
import getPermitNFTSignature from '../../utils/signature'

import { ethers, constants, BigNumberish, BigNumber as BN } from 'ethers'
import { formatEther } from '@ethersproject/units'
import { Button } from '../../components/ui/Button'
import { AmountModal } from '../../components/ui/Modal/AmountModal'

import { NUM_BLOCKS_PER_DAY, NUM_DAYS_PER_MONTH, DAYS_PER_YEAR, TOKEN_NAME } from '../../constants'
import { encodePriceSqrt, FeeAmount, TICK_SPACINGS, getMaxTick, getMinTick } from '../../utils/uniswap'

function Invest(): any {
  const wallet = useWallet()
  const { master, vault, solace, cpFarm, lpFarm, lpToken, weth } = useContracts()

  const masterContract = useRef<Contract | null>()
  const vaultContract = useRef<Contract | null>()
  const cpFarmContract = useRef<Contract | null>()
  const lpFarmContract = useRef<Contract | null>()
  const lpTokenContract = useRef<Contract | null>()
  const wethContract = useRef<Contract | null>()
  const solaceContract = useRef<Contract | null>()

  const [assets, setAssets] = useState<number>(0)

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
  const [func, setFunc] = useState<() => void | (() => Promise<void>)>()
  const [modalTitle, setModalTitle] = useState<string>('')
  const [disabled, setDisabled] = useState(false)

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

  const openModal = async (func: any, modalTitle: string) => {
    setShowModal((prev) => !prev)
    setModalTitle(modalTitle)
    setFunc(() => func)
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
      let rewards = 0
      for (let i = 0; i < farms; i++) {
        const pendingReward = await cpFarmContract.current.pendingRewards(wallet.account)
        rewards += parseFloat(pendingReward)
      }
      if (cpUserRewards !== rewards) setCpUserRewards(rewards)
      return rewards
    } catch (err) {
      console.log('error getUserRewards ', err)
    }
  }

  const getLpUserRewards = async () => {
    const farms = await getNumFarms()
    if (!lpFarmContract.current || farms === 0 || !wallet.account) return
    try {
      let rewards = 0
      for (let i = 0; i < farms; i++) {
        const pendingReward = await lpFarmContract.current.pendingRewards(wallet.account)
        rewards += parseFloat(pendingReward)
      }
      if (lpUserRewards !== rewards) setLpUserRewards(rewards)
      return rewards
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
    if (!vaultContract.current) return
    try {
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
        setShowModal(false)
        setDisabled(false)
        setLoading(false)
      })
    } catch (err) {
      console.log('callDepositVault ', err)
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
        setShowModal(false)
        setDisabled(false)
        setLoading(false)
      })
    } catch (err) {
      console.log('error callDepositEth ', err)
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
        setShowModal(false)
        setDisabled(false)
        setLoading(false)
      })
    } catch (err) {
      console.log('error callDepositCp ', err)
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
        setShowModal(false)
        setDisabled(false)
        setLoading(false)
      })
    } catch (err) {
      console.log('callWithdrawVault ', err)
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
        setShowModal(false)
        setDisabled(false)
        setLoading(false)
      })
    } catch (err) {
      console.log('error callWithdrawCp ', err)
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
        constants.MaxUint256
      )
      const depositSigned = await lpFarmContract.current.depositSigned(
        wallet.account,
        nft,
        constants.MaxUint256,
        v,
        r,
        s
      )
      await depositSigned.wait()
      await lpFarmContract.current.on('Deposit', (sender, token, tx) => {
        console.log('DepositSigned event: ', tx)
        refresh()
        setShowModal(false)
        setDisabled(false)
        setLoading(false)
      })
    } catch (err) {
      console.log('callDepositLp ', err)
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
        setShowModal(false)
        setDisabled(false)
        setLoading(false)
      })
    } catch (err) {
      console.log('callWithdrawLp ', err)
    }
  }

  const callMintLpToken = async (amount: number) => {
    if (!wethContract.current || !solaceContract.current || !lpTokenContract.current) return
    setLoading(true)
    try {
      await solaceContract.current.addMinter(wallet.account)
      await solaceContract.current.mint(wallet.account, amount)
      await wethContract.current.deposit({ value: ethers.utils.parseEther(amount.toString()) })
      await solaceContract.current.approve(lpTokenContract.current.address, ethers.utils.parseEther(amount.toString()))
      await wethContract.current.approve(lpTokenContract.current.address, ethers.utils.parseEther(amount.toString()))
      const nft = await mintLpToken(wethContract.current, solaceContract.current, FeeAmount.MEDIUM, amount)
      console.log('Total Supply of LP Tokens', nft.toNumber())
      setNft(nft)
      refresh()
      setShowModal(false)
      setDisabled(false)
      setLoading(false)
    } catch (err) {
      console.log(err)
    }
  }

  const mintLpToken = async (
    tokenA: Contract,
    tokenB: Contract,
    fee: FeeAmount,
    amount: number,
    tickLower: BigNumberish = getMinTick(TICK_SPACINGS[fee]),
    tickUpper: BigNumberish = getMaxTick(TICK_SPACINGS[fee])
  ) => {
    if (!lpTokenContract.current) return
    const [token0, token1] = sortTokens(tokenA.address, tokenB.address)
    await lpTokenContract.current.mint({
      token0: token0,
      token1: token1,
      tickLower: tickLower,
      tickUpper: tickUpper,
      fee: fee,
      recipient: wallet.account,
      amount0Desired: BN.from(amount),
      amount1Desired: BN.from(amount),
      amount0Min: 0,
      amount1Min: 0,
      deadline: constants.MaxUint256,
    })
    const tokenId = await lpTokenContract.current.totalSupply()
    return tokenId
  }

  function sortTokens(tokenA: string, tokenB: string) {
    return BN.from(tokenA).lt(BN.from(tokenB)) ? [tokenA, tokenB] : [tokenB, tokenA]
  }

  useEffect(() => {
    vaultContract.current = vault
    cpFarmContract.current = cpFarm
    lpFarmContract.current = lpFarm
    masterContract.current = master
    lpTokenContract.current = lpToken
    wethContract.current = weth
    solaceContract.current = solace

    refresh()
  }, [vault, cpFarm, lpFarm, master, lpToken, weth])

  return (
    <Fragment>
      <AmountModal
        showModal={showModal}
        setShowModal={setShowModal}
        callbackFunc={func}
        disabled={disabled}
        setDisabled={setDisabled}
      >
        {modalTitle}
      </AmountModal>
      <Statistics />
      <Heading1>Risk Back ETH - Capital Pool</Heading1>
      <Table isHighlight>
        <TableHead>
          <TableRow>
            <TableHeader>Vault Share</TableHeader>
            <TableHeader>ROI(1Y)</TableHeader>
            <TableHeader>Total Assets</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableData>{wallet.isActive ? `${(userVaultShare * 100).toFixed(2)}%` : null}</TableData>
            <TableData>HC6.5%</TableData>
            <TableData>{formatEther(assets).toString()}</TableData>
            <TableData cellAlignRight>
              {wallet.account && !loading ? (
                <TableDataGroup>
                  <Button
                    onClick={() =>
                      openModal(callDepositVault, 'How much ETH would you like to deposit into the vault?')
                    }
                  >
                    deposit into vault
                  </Button>
                  <Button
                    onClick={() =>
                      openModal(callWithdrawVault, 'How much ETH would you like to withdraw from the vault?')
                    }
                  >
                    withdraw from vault
                  </Button>
                  <Button
                    onClick={() => openModal(callDepositEth, 'How much ETH would you like to deposit and stake?')}
                  >
                    deposit CP and stake
                  </Button>
                </TableDataGroup>
              ) : null}
            </TableData>
          </TableRow>
        </TableBody>
      </Table>
      <Heading1>Solace Capital Provider Farm</Heading1>
      <Table isHighlight>
        <TableHead>
          <TableRow>
            <TableHeader>My Accumulated Rewards</TableHeader>
            <TableHeader>ROI(1Y)</TableHeader>
            <TableHeader>Total Assets</TableHeader>
            <TableHeader>My Rewards per Day</TableHeader>
            <TableHeader>Global Rewards per Day</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableData>{wallet.isActive ? cpUserRewards.toFixed(2) : null}</TableData>
            <TableData>HC150%</TableData>
            <TableData>{formatEther(cpPoolValue).toString()}</TableData>
            <TableData>{cpUserRewardsPerDay.toFixed(2)}</TableData>
            <TableData>{cpRewardsPerDay.toFixed(2)}</TableData>
            <TableData cellAlignRight>
              {wallet.account && !loading ? (
                <TableDataGroup>
                  <Button
                    onClick={() => openModal(callDepositCp, 'Enter the amount of CP tokens you want to deposit.')}
                  >
                    deposit CP
                  </Button>
                  <Button
                    onClick={() => openModal(callWithdrawCp, 'Enter the amount of CP tokens you want to withdraw.')}
                  >
                    withdraw CP
                  </Button>
                </TableDataGroup>
              ) : null}
            </TableData>
          </TableRow>
        </TableBody>
      </Table>
      <Heading1>SOLACE/ETH Liquidity Pool</Heading1>
      <Table isHighlight>
        <TableHead>
          <TableRow>
            <TableHeader>My Accumulated Rewards</TableHeader>
            <TableHeader>ROI(1Y)</TableHeader>
            <TableHeader>Total Assets</TableHeader>
            <TableHeader>My Rewards per Day</TableHeader>
            <TableHeader>Global Rewards per Day</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableData>{wallet.isActive ? lpUserRewards.toFixed(2) : null}</TableData>
            <TableData>HC150%</TableData>
            <TableData>{formatEther(lpPoolValue).toString()}</TableData>
            <TableData>{lpUserRewardsPerDay.toFixed(2)}</TableData>
            <TableData>{lpRewardsPerDay.toFixed(2)}</TableData>
            <TableData cellAlignRight>
              {wallet.account && !loading ? (
                <TableDataGroup>
                  <Button
                    onClick={() => openModal(callDepositLp, 'Enter the amount of LP tokens you want to deposit.')}
                  >
                    deposit LP
                  </Button>
                  <Button
                    onClick={() => openModal(callWithdrawLp, 'Enter the amount of LP tokens you want to withdraw.')}
                  >
                    withdraw LP
                  </Button>
                </TableDataGroup>
              ) : null}
            </TableData>
          </TableRow>
        </TableBody>
      </Table>
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
    </Fragment>
  )
}

export default Invest
