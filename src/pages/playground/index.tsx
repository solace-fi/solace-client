import React, { useEffect, useState, useRef } from 'react'
import { Contract } from '@ethersproject/contracts'

import { useWallet } from '../../context/WalletManager'
import { useContracts } from '../../context/ContractsManager'
import { ethers, constants, BigNumberish, BigNumber as BN } from 'ethers'
import { formatEther } from '@ethersproject/units'

import InvestTabPoolView from '../../components/InvestTabPoolView'
import { Button } from '../../components/Button'
import { AmountModal } from '../../components/Modal/AmountModal'

import { NUM_BLOCKS_PER_DAY, NUM_DAYS_PER_MONTH, DAYS_PER_YEAR, TOKEN_NAME, DEADLINE } from '../../constants'

import getPermitNFTSignature from '../../utils/signature'
import { encodePriceSqrt, FeeAmount, TICK_SPACINGS, getMaxTick, getMinTick } from '../../utils/uniswap'

function Playground(): any {
  const wallet = useWallet()
  const status = wallet.isActive ? <div>Playground, connected</div> : <div>Playground, disconnected</div>

  const [func, setFunc] = useState<() => void | (() => Promise<void>)>()
  const [disabled, setDisabled] = useState(false)
  const [modalTitle, setModalTitle] = useState<string>('')

  const [assets, setAssets] = useState<number>(0)
  const [farms, setFarms] = useState<string>('0')
  const [solaceBalance, setSolaceBalance] = useState<number>(0)

  const [cpRewardsPerDay, setCpRewardsPerDay] = useState<number>(0)
  const [lpRewardsPerDay, setLpRewardsPerDay] = useState<number>(0)
  const [cpUserRewardsPerDay, setCpUserRewardsPerDay] = useState<number>(0)
  const [lpUserRewardsPerDay, setLpUserRewardsPerDay] = useState<number>(0)

  const [rewardsPerMonth, setRewardsPerMonth] = useState<number>(0)
  const [userRewards, setUserRewards] = useState<number>(0)

  const [scp, setScp] = useState<number>(0)

  const [nft, setNft] = useState<BN>()

  const [cpValueStaked, setCpValueStaked] = useState<number>(0)
  const [lpValueStaked, setLpValueStaked] = useState<number>(0)

  // const [userCpValueStaked, setUserCpValueStaked] = useState<number>(0)
  // const [userLpValueStaked, setUserLpValueStaked] = useState<number>(0)

  const [userVaultShare, setUserVaultShare] = useState<number>(0)

  const [totalValueLocked, setTotalValueLocked] = useState<number>(0)

  const [loading, setLoading] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)

  const masterContract = useRef<Contract | null>()
  const vaultContract = useRef<Contract | null>()
  const solaceContract = useRef<Contract | null>()
  const cpFarmContract = useRef<Contract | null>()
  const lpFarmContract = useRef<Contract | null>()
  const registryContract = useRef<Contract | null>()
  const lpTokenContract = useRef<Contract | null>()
  const wethContract = useRef<Contract | null>()

  const { master, vault, solace, cpFarm, lpFarm, registry, lpToken, weth } = useContracts()

  const refresh = async () => {
    getTotalValueLocked()
    getSolacePerMonth()
    getSolaceBalance()
    getTotalAssets()
    getNumFarms()
    getUserRewards()
    getUserRewardsPerDay()
    getRewardsPerDay()
    getUserVaultShare()
  }

  const openModal = async (func: any, modalTitle: string) => {
    setShowModal((prev) => !prev)
    setModalTitle(modalTitle)
    setFunc(() => func)
  }

  const getSolacePerMonth = async () => {
    if (!masterContract.current) return

    try {
      const solacePerBlock = await masterContract.current.solacePerBlock()
      const rewards = solacePerBlock * NUM_BLOCKS_PER_DAY * NUM_DAYS_PER_MONTH
      setRewardsPerMonth(rewards)
    } catch (err) {
      console.log('error getRewardsPerDay ', err)
    }
  }

  const getTotalValueLocked = async () => {
    if (!cpFarmContract.current?.provider || !lpFarmContract.current?.provider) return
    try {
      const cpFarmValue = await cpFarmContract.current.valueStaked()
      const lpFarmValue = await lpFarmContract.current.valueStaked()
      setTotalValueLocked(parseFloat(formatEther(cpFarmValue)) + parseFloat(formatEther(lpFarmValue)))
    } catch (err) {
      console.log('error getTotalValueLocked ', err)
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

  const getRewardsPerDay = async () => {
    if (!masterContract.current) return

    try {
      const cpAllocPoints = await masterContract.current.allocPoints(1)
      const lpAllocPoints = await masterContract.current.allocPoints(2)
      const totalAllocPoints = await masterContract.current.totalAllocPoints()
      const solacePerBlock = await masterContract.current.solacePerBlock()
      const cpRewards = solacePerBlock * NUM_BLOCKS_PER_DAY * (cpAllocPoints / totalAllocPoints)
      const lpRewards = solacePerBlock * NUM_BLOCKS_PER_DAY * (lpAllocPoints / totalAllocPoints)
      if (cpRewardsPerDay !== cpRewards) setCpRewardsPerDay(cpRewards)
      if (lpRewardsPerDay !== lpRewards) setLpRewardsPerDay(lpRewards)
    } catch (err) {
      console.log('error getRewardsPerDay ', err)
    }
  }

  const getUserRewards = async () => {
    if (!cpFarmContract.current || farms === '' || !wallet.account) return
    try {
      let rewards = 0
      for (let i = 0; i < parseInt(farms); i++) {
        const pendingReward = await cpFarmContract.current.pendingRewards(wallet.account)
        rewards += parseFloat(pendingReward)
      }
      if (userRewards !== rewards) setUserRewards(rewards)
    } catch (err) {
      console.log('error getUserRewards ', err)
    }
  }

  const getUserRewardsPerDay = async () => {
    if (!masterContract.current || !cpFarmContract.current || !lpFarmContract.current || !wallet.account) return
    try {
      const farmValue = await getFarmValueStaked()
      if (!farmValue) return
      const cpFarmValue = farmValue[0]
      const lpFarmValue = farmValue[1]

      const cpUser = await cpFarmContract.current.userInfo(wallet.account)
      const lpUser = await lpFarmContract.current.userInfo(wallet.account)

      const cpUserValue = cpUser.value
      const lpUserValue = lpUser.value

      // setUserCpValueStaked(parseFloat(formatEther(cpUserValue)))
      // setUserLpValueStaked(parseFloat(formatEther(lpUserValue)))

      const cpAllocPoints = await masterContract.current.allocPoints(1)
      const lpAllocPoints = await masterContract.current.allocPoints(2)
      const totalAllocPoints = await masterContract.current.totalAllocPoints()
      const solacePerBlock = await masterContract.current.solacePerBlock()

      const cpUserRewards =
        cpFarmValue > 0
          ? ((solacePerBlock * NUM_BLOCKS_PER_DAY * parseFloat(formatEther(cpUserValue))) /
              parseFloat(formatEther(cpFarmValue))) *
            (cpAllocPoints / totalAllocPoints)
          : 0

      const lpUserRewards =
        lpFarmValue > 0
          ? ((solacePerBlock * NUM_BLOCKS_PER_DAY * parseFloat(formatEther(lpUserValue))) /
              parseFloat(formatEther(lpFarmValue))) *
            (lpAllocPoints / totalAllocPoints)
          : 0
      if (cpUserRewardsPerDay !== cpUserRewards) setCpUserRewardsPerDay(cpUserRewards)
      if (lpUserRewardsPerDay !== lpUserRewards) setLpUserRewardsPerDay(lpUserRewards)
    } catch (err) {
      console.log('error getUserRewardsPerDay ', err)
    }
  }

  const getFarmValueStaked = async () => {
    if (!cpFarmContract.current || !lpFarmContract.current || farms === '') return
    try {
      const cpFarmValueStaked = await cpFarmContract.current.valueStaked()
      const lpFarmValueStaked = await lpFarmContract.current.valueStaked()
      if (cpValueStaked !== cpFarmValueStaked) setCpValueStaked(cpFarmValueStaked)
      if (lpValueStaked !== lpFarmValueStaked) setLpValueStaked(lpFarmValueStaked)
      return [cpFarmValueStaked, lpFarmValueStaked]
    } catch (err) {
      console.log('error getFarmValueStaked ', err)
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

  const getSolaceBalance = async () => {
    if (!solaceContract.current?.provider || !wallet.account) return

    try {
      const balance = await solaceContract.current.balanceOf(wallet.account)
      if (solaceBalance !== balance) setSolaceBalance(balance.toNumber())
    } catch (err) {
      console.log('error getSolaceBalance ', err)
    }
  }

  const getNumFarms = async () => {
    if (!masterContract.current) return
    try {
      const ans = await masterContract.current.numFarms()
      setFarms(ans.toString())
    } catch (err) {
      console.log('error getNumFarms ', err)
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

  const setSolacePerBlock = async () => {
    if (!masterContract.current || !wallet.account) return
    setLoading(true)
    try {
      const setSolacePerBlock = await masterContract.current.setSolacePerBlock(100)
      await setSolacePerBlock.wait()
      setLoading(false)
    } catch (err) {
      console.log('error setSolacePerBlock ', err)
    }
  }

  const callDepositVault = async (amount: number) => {
    setLoading(true)
    if (!vaultContract.current) return

    console.log('vault', amount)
    try {
      const tx = await vaultContract.current.deposit({ value: ethers.utils.parseEther(amount.toString()) })
      await tx.wait()
      const r = await vaultContract.current.on('DepositMade', (sender, amount, shares, tx) => {
        console.log('DepositVault event: ', tx)
        // wallet.updateBalance(wallet.balance.sub(amount))
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
        // wallet.updateBalance(wallet.balance.sub(amount))
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
        // wallet.updateBalance(wallet.balance.sub(amount))
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
        // wallet.updateBalance(wallet.balance.add(amount))
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
        // wallet.updateBalance(wallet.balance.add(amount))
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
        DEADLINE
      )
      const depositSigned = await lpFarmContract.current.depositSigned(wallet.account, nft, DEADLINE, v, r, s)
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
      deadline: DEADLINE,
    })
    const tokenId = await lpTokenContract.current.totalSupply()
    return tokenId
  }

  function sortTokens(tokenA: string, tokenB: string) {
    return BN.from(tokenA).lt(BN.from(tokenB)) ? [tokenA, tokenB] : [tokenB, tokenA]
  }

  useEffect(() => {
    // console.log('mount: \n ', master, ' \n ', vault, ' \n ', solace, ' \n ', cpFarm)
    vaultContract.current = vault
    masterContract.current = master
    solaceContract.current = solace
    cpFarmContract.current = cpFarm
    lpFarmContract.current = lpFarm
    registryContract.current = registry
    lpTokenContract.current = lpToken
    wethContract.current = weth

    refresh()
  }, [master, vault, solace, cpFarm, lpFarm, registry, weth, lpToken])

  return (
    <>
      {status}
      <AmountModal
        showModal={showModal}
        setShowModal={setShowModal}
        callbackFunc={func}
        disabled={disabled}
        setDisabled={setDisabled}
      >
        {modalTitle}
      </AmountModal>
      <Button onClick={setSolacePerBlock}>Set Solace</Button>
      <Button onClick={() => openModal(callMintLpToken, 'Enter the amount')}>Mint LP Token</Button>
      {wallet.isActive ? (
        !loading ? (
          <>
            <div>Account: {wallet.account}</div>
            <div>Chain Id: {wallet.chainId}</div>
          </>
        ) : (
          <div>Loading</div>
        )
      ) : null}
      <h2 style={{ textAlign: 'center' }}>INVEST</h2>
      <InvestTabPoolView
        names={['Capital Pool Size', 'Total Value Locked', 'SR/M', 'SOLACE', 'SCP']}
        content={[
          formatEther(assets).toString(),
          totalValueLocked,
          rewardsPerMonth.toFixed(2),
          wallet.isActive ? solaceBalance : null,
          wallet.isActive ? scp : null,
        ]}
      />
      <h2 style={{ textAlign: 'center' }}>RISK-BACKING ETH CAPITAL POOL</h2>
      <InvestTabPoolView
        names={['ROI', 'Total Assets', 'Deposit ETH', 'Withdraw ETH', 'Vault Share', 'Dep & stake']}
        content={[
          '6.5%',
          formatEther(assets).toString(),
          wallet.isActive && !loading ? (
            <Button
              key={2}
              onClick={() => openModal(callDepositVault, 'How much ETH would you like to deposit into the vault?')}
            >
              deposit into vault
            </Button>
          ) : null,
          wallet.isActive && !loading ? (
            <Button
              key={3}
              onClick={() => openModal(callWithdrawVault, 'How much ETH would you like to withdraw from the vault?')}
            >
              withdraw from vault
            </Button>
          ) : null,
          wallet.isActive ? `${(userVaultShare * 100).toFixed(2)}%` : null,
          wallet.isActive && !loading ? (
            <Button
              key={5}
              onClick={() => openModal(callDepositEth, 'How much ETH would you like to deposit and stake?')}
            >
              deposit CP and stake
            </Button>
          ) : null,
        ]}
      />
      <h2 style={{ textAlign: 'center' }}>SOLACE CAPITAL PROVIDER FARM</h2>
      <InvestTabPoolView
        names={['R / Day', 'Total Liquidity', 'My R', 'My R / Day', 'Stake CP', 'Withdraw CP']}
        content={[
          cpRewardsPerDay.toFixed(2),
          formatEther(cpValueStaked).toString(),
          wallet.isActive ? userRewards.toFixed(2) : null,
          wallet.isActive ? cpUserRewardsPerDay.toFixed(2) : null,
          wallet.isActive && !loading ? (
            <Button
              key={4}
              onClick={() => openModal(callDepositCp, 'Enter the amount of CP tokens you want to deposit.')}
            >
              deposit CP
            </Button>
          ) : null,
          wallet.isActive && !loading ? (
            <Button
              key={5}
              onClick={() => openModal(callWithdrawCp, 'Enter the amount of CP tokens you want to withdraw.')}
            >
              withdraw CP
            </Button>
          ) : null,
        ]}
      />
      <h2 style={{ textAlign: 'center' }}>SOLACE-ETH LIQUIDITY FARM</h2>
      <InvestTabPoolView
        names={['R / Day', 'Total Liquidity', 'My R', 'My R / Day', 'Stake LP', 'Withdraw LP']}
        content={[
          lpRewardsPerDay.toFixed(2),
          formatEther(lpValueStaked).toString(),
          wallet.isActive ? userRewards.toFixed(2) : null,
          wallet.isActive ? lpUserRewardsPerDay.toFixed(2) : null,
          wallet.isActive && !loading ? (
            <Button
              key={4}
              onClick={() => openModal(callDepositLp, 'Enter the amount of LP tokens you want to deposit.')}
            >
              deposit LP
            </Button>
          ) : null,
          wallet.isActive && !loading ? (
            <Button
              key={5}
              onClick={() => openModal(callWithdrawLp, 'Enter the amount of LP tokens you want to withdraw.')}
            >
              withdraw LP
            </Button>
          ) : null,
        ]}
      />
    </>
  )
}

export default Playground
