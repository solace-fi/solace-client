import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { Contract } from '@ethersproject/contracts'

import { useWallet } from '../../context/Web3Manager'
import { useContracts } from '../../context/ContractsManager'
import { ethers } from 'ethers'
import { formatEther } from '@ethersproject/units'

import Coins from '../../components/ui/Coins'
import InvestTabPoolView from '../../components/ui/InvestTabPoolView'

import { NUM_BLOCKS_PER_DAY, NUM_DAYS_PER_MONTH, DAYS_PER_YEAR, TOKEN_NAME } from '../../constants'

function Playground(): any {
  const wallet = useWallet()
  const status = wallet.isActive ? <div>Playground, connected</div> : <div>Playground, disconnected</div>

  const [assets, setAssets] = useState<number>(0)
  const [farms, setFarms] = useState<string>('0')
  const [solaceBalance, setSolaceBalance] = useState<number>(0)

  const [rewardsPerDay, setRewardsPerDay] = useState<number>(0)
  const [rewardsPerMonth, setRewardsPerMonth] = useState<number>(0)
  const [userRewardsPerDay, setUserRewardsPerDay] = useState<number>(0)
  const [userRewards, setUserRewards] = useState<number>(0)

  const [amount, setAmount] = useState<number>(5)
  const [maxLoss, setMaxLoss] = useState<number>(5)
  const [loading, setLoading] = useState<boolean>(false)
  const [scp, setScp] = useState<number>(0)
  const [valueStaked, setValueStaked] = useState<number>(0)
  const [userCpValueStaked, setUserCpValueStaked] = useState<number>(0)
  const [userVaultShare, setUserVaultShare] = useState<number>(0)
  const [totalValueLocked, setTotalValueLocked] = useState<number>(0)

  const masterContractRef = useRef<Contract | null>()
  const vaultContractRef = useRef<Contract | null>()
  const solaceContractRef = useRef<Contract | null>()
  const cpFarmContractRef = useRef<Contract | null>()
  const lpFarmContractRef = useRef<Contract | null>()
  const registryContractRef = useRef<Contract | null>()

  const { master, vault, solace, cpFarm, lpFarm, registry } = useContracts()

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

  const getSolacePerMonth = async () => {
    // console.log('calling getRewardsPerDay')

    if (!masterContractRef.current) return

    try {
      const solacePerBlock = await masterContractRef.current.solacePerBlock()
      const rewards = solacePerBlock * NUM_BLOCKS_PER_DAY * NUM_DAYS_PER_MONTH
      if (rewardsPerDay !== rewards) setRewardsPerMonth(rewards)
    } catch (err) {
      console.log('error getRewardsPerDay ', err)
    }
  }

  const getTotalValueLocked = async () => {
    if (!cpFarmContractRef.current?.provider || !lpFarmContractRef.current?.provider) return
    try {
      const cpFarmValue = await cpFarmContractRef.current.valueStaked()
      const lpFarmValue = await lpFarmContractRef.current.valueStaked()
      setTotalValueLocked(parseFloat(formatEther(cpFarmValue)) + parseFloat(formatEther(lpFarmValue)))
    } catch (err) {
      console.log('error getUserCpValueStaked ', err)
    }
  }

  const getUserVaultShare = async () => {
    // console.log('calling getUserVaultShare')
    if (!cpFarmContractRef.current?.provider || !vaultContractRef.current?.provider || !wallet.account) return
    try {
      const totalSupply = await vaultContractRef.current.totalSupply()
      const userInfo = await cpFarmContractRef.current.userInfo(wallet.account)
      const value = userInfo.value
      const cpBalance = await getScp()
      const share = totalSupply > 0 ? (parseFloat(cpBalance) + parseFloat(value)) / parseFloat(totalSupply) : 0
      setUserVaultShare(share)
      // console.log(`share ${(parseFloat(cpBalance) + parseFloat(value)) / parseFloat(totalSupply)}`)
      // console.log('success getUserVaultShare')
      return value
    } catch (err) {
      console.log('error getUserVaultShare ', err)
    }
  }

  const getUserCpValueStaked = async () => {
    // console.log('calling getUserCpValueStaked')
    if (!cpFarmContractRef.current?.provider || !wallet.account) return
    try {
      const userInfo = await cpFarmContractRef.current.userInfo(wallet.account)
      // console.log(`getUserCpValueStaked ${parseFloat(formatEther(userInfo.value))}`)
      setUserCpValueStaked(parseFloat(formatEther(userInfo.value)))
      // console.log('success getUserCpValueStaked')
      return userInfo.value
    } catch (err) {
      console.log('error getUserCpValueStaked ', err)
    }
  }

  const getRewardsPerDay = async () => {
    // console.log('calling getRewardsPerDay')

    if (!masterContractRef.current) return

    try {
      const allocPoints = await masterContractRef.current.allocPoints(1)
      const totalAllocPoints = await masterContractRef.current.totalAllocPoints()
      const solacePerBlock = await masterContractRef.current.solacePerBlock()
      const rewards = solacePerBlock * NUM_BLOCKS_PER_DAY * (allocPoints / totalAllocPoints)
      // console.log(`${solacePerBlock} * ${NUM_BLOCKS_PER_DAY} * (${allocPoints} / ${totalAllocPoints})`)
      if (rewardsPerDay !== rewards) setRewardsPerDay(rewards)
      // console.log('success getRewardsPerDay')
    } catch (err) {
      console.log('error getRewardsPerDay ', err)
    }
  }

  const setSolacePerBlock = async () => {
    if (!masterContractRef.current || !wallet.account) return

    try {
      const setSolacePerBlock = await masterContractRef.current.setSolacePerBlock(100)
      // console.log(`setSolacePerBlock ${setSolacePerBlock}`)
    } catch (err) {
      console.log('error setSolacePerBlock ', err)
    }
  }

  const getUserRewardsPerDay = async () => {
    // console.log('calling getUserRewardsPerDay')

    if (!masterContractRef.current || !wallet.account) return
    try {
      const farmValue = await getFarmValueStaked()
      if (farmValue <= 0) {
        setUserRewardsPerDay(0)
        return
      }
      const userValue = await getUserCpValueStaked()
      const allocPoints = await masterContractRef.current.allocPoints(1)
      const totalAllocPoints = await masterContractRef.current.totalAllocPoints()
      const solacePerBlock = await masterContractRef.current.solacePerBlock()
      // console.log(
      //   `${solacePerBlock} * ${NUM_BLOCKS_PER_DAY} * (${formatEther(userValue)} / ${formatEther(
      //     farmValue
      //   )}) * (${allocPoints} / ${totalAllocPoints})`
      // )
      const userRewards =
        ((solacePerBlock * NUM_BLOCKS_PER_DAY * parseFloat(formatEther(userValue))) /
          parseFloat(formatEther(farmValue))) *
        (allocPoints / totalAllocPoints)
      if (userRewardsPerDay !== userRewards) setUserRewardsPerDay(userRewards)
      // console.log('success getUserRewardsPerDay')
    } catch (err) {
      console.log('error getUserRewardsPerDay ', err)
    }
  }

  const getUserRewards = async () => {
    // console.log('calling getUserRewards')

    if (!cpFarmContractRef.current || farms === '' || !wallet.account) return
    try {
      let rewards = 0
      for (let i = 0; i < parseInt(farms); i++) {
        const pendingReward = await cpFarmContractRef.current.pendingRewards(wallet.account)
        // console.log(`pendingReward: ${pendingReward}`)
        rewards += parseFloat(pendingReward)
      }
      // console.log('rewards:', rewards)
      if (userRewards !== rewards) setUserRewards(rewards)
      // console.log('success getUserRewards')
    } catch (err) {
      console.log('error getUserRewards ', err)
    }
  }

  const getFarmValueStaked = async () => {
    // console.log('calling getFarmValueStaked')

    if (!cpFarmContractRef.current || farms === '') return
    try {
      const farmValueStaked = await cpFarmContractRef.current.valueStaked()
      if (valueStaked !== farmValueStaked) setValueStaked(farmValueStaked)
      // console.log('success getFarmValueStaked')
      return farmValueStaked
    } catch (err) {
      console.log('error getFarmValueStaked ', err)
    }
  }

  const getScp = async () => {
    // console.log('calling getScp')

    if (!vaultContractRef.current?.provider || !wallet.account) return

    try {
      const balance = await vaultContractRef.current.balanceOf(wallet.account)
      // console.log(`getScp: ${balance}`)
      const formattedBalance = parseFloat(formatEther(balance))
      if (scp !== balance) setScp(formattedBalance)
      // console.log('success getScp')
      return balance
    } catch (err) {
      console.log('error getScp ', err)
    }
  }

  const getSolaceBalance = async () => {
    // console.log('calling getSolaceBalance')

    if (!solaceContractRef.current?.provider || !wallet.account) return

    try {
      const balance = await solaceContractRef.current.balanceOf(wallet.account)
      // console.log(`getSolaceBalance: ${balance}`)
      if (solaceBalance !== balance) setSolaceBalance(balance.toNumber())
      // console.log('success getSolaceBalance')
    } catch (err) {
      console.log('error getSolaceBalance ', err)
    }
  }

  const getNumFarms = async () => {
    // console.log('calling getNumFarms')

    if (!masterContractRef.current) return
    try {
      const ans = await masterContractRef.current.numFarms()
      // console.log(`getNumFarms: ${ans}`)
      setFarms(ans.toString())
      // console.log('success getNumFarms')
    } catch (err) {
      console.log('error getNumFarms ', err)
    }
  }

  const getTotalAssets = async () => {
    // console.log('calling getTotalAssets')

    if (!vaultContractRef.current || !registryContractRef.current) return
    try {
      const addr = await registryContractRef.current.governance()
      console.log('GOVERNANCE ', addr)
      const ans = await vaultContractRef.current.totalAssets().then((ans: any) => {
        // console.log(`getTotalAssets: ${ans}`)
        return ans
      })
      setAssets(ans)
      // console.log('success getTotalAssets')
    } catch (err) {
      console.log('error getTotalAssets ', err)
    }
  }

  // user deposits ETH into Vault for SCP
  const callDepositVault = async () => {
    setLoading(true)
    if (!vaultContractRef.current) return

    try {
      const tx = await vaultContractRef.current.deposit({ value: ethers.utils.parseEther(amount.toString()) })
      await tx.wait()
      const r = await vaultContractRef.current.on('DepositMade', (sender, amount, shares, tx) => {
        console.log('DepositVault event: ', tx)
        wallet.updateBalance(wallet.balance.sub(amount))
        refresh()
        setLoading(false)
      })
    } catch (err) {
      console.log('callDepositVault ', err)
    }
  }

  // user deposits ETH into vault and stake in CP farm
  const callDepositEth = async () => {
    // console.log('calling callDepositEth')
    setLoading(true)
    if (!cpFarmContractRef.current || !vaultContractRef.current) return
    try {
      const deposit = await cpFarmContractRef.current.depositEth({ value: ethers.utils.parseEther(amount.toString()) })
      await deposit.wait()
      const depositEvent = await cpFarmContractRef.current.on('DepositEth', (sender, amount, tx) => {
        console.log('DepositEth event: ', tx)
        wallet.updateBalance(wallet.balance.sub(amount))
        refresh()
        setLoading(false)
      })
    } catch (err) {
      console.log('error callDepositEth ', err)
    }
  }

  // user deposits SCP into CP farm
  const callDepositCp = async () => {
    // console.log('calling callDepositCp')
    setLoading(true)
    if (!cpFarmContractRef.current || !vaultContractRef.current) return
    try {
      const approval = await vaultContractRef.current.approve(
        cpFarmContractRef.current.address,
        ethers.utils.parseEther(amount.toString())
      )
      await approval.wait()
      const approvalEvent = await vaultContractRef.current.on('Approval', (owner, spender, value, tx) => {
        console.log('approval event: ', tx)
      })
      const deposit = await cpFarmContractRef.current.depositCp(ethers.utils.parseEther(amount.toString()))
      await deposit.wait()
      const depositEvent = await cpFarmContractRef.current.on('DepositCp', (sender, amount, tx) => {
        console.log('DepositCp event: ', tx)
        wallet.updateBalance(wallet.balance.sub(amount))
        refresh()
        setLoading(false)
      })
    } catch (err) {
      console.log('error callDepositCp ', err)
    }
  }

  const callWithdrawVault = async () => {
    setLoading(true)
    if (!vaultContractRef.current) return

    try {
      const tx = await vaultContractRef.current.withdraw(ethers.utils.parseEther(amount.toString()), maxLoss)
      await tx.wait()
      const r = await vaultContractRef.current.on('WithdrawalMade', (sender, amount, tx) => {
        console.log('withdrawal event: ', tx)
        wallet.updateBalance(wallet.balance.add(amount))
        refresh()
        setLoading(false)
      })
    } catch (err) {
      console.log('callWithdrawVault ', err)
    }
  }

  const callWithdrawCp = async () => {
    // console.log('calling callWithdrawCp')

    setLoading(true)
    if (!cpFarmContractRef.current) return
    try {
      const withdraw = await cpFarmContractRef.current.withdrawEth(ethers.utils.parseEther(amount.toString()), maxLoss)
      await withdraw.wait()
      const withdrawEvent = await cpFarmContractRef.current.on('WithdrawEth', (sender, amount, tx) => {
        console.log('WithdrawEth event: ', tx)
        wallet.updateBalance(wallet.balance.add(amount))
        refresh()
        setLoading(false)
      })
    } catch (err) {
      console.log('error callWithdrawCp ', err)
    }
  }

  const callDepositErc721 = async () => {
    setLoading(true)
    if (!masterContractRef.current) return
    try {
      const ans = await masterContractRef.current.depositErc721(0, 0)
      return ans
    } catch (err) {
      console.log('callDepositErc721 ', err)
    }
    setLoading(false)
  }

  const callWithdrawErc721 = async () => {
    setLoading(true)
    if (!masterContractRef.current) return

    try {
      const tx = await masterContractRef.current.withdrawErc721(0, 0)
      await tx.wait()
      const r = await masterContractRef.current.on('WithdrawErc721', (sender, farmId, token, tx) => {
        console.log('withdrawVault event: ', tx)
        refresh()
        setLoading(false)
      })
    } catch (err) {
      console.log('callWithdrawErc721 ', err)
    }
  }

  useEffect(() => {
    // console.log('mount: \n ', master, ' \n ', vault, ' \n ', solace, ' \n ', cpFarm)
    vaultContractRef.current = vault
    masterContractRef.current = master
    solaceContractRef.current = solace
    cpFarmContractRef.current = cpFarm
    lpFarmContractRef.current = lpFarm
    registryContractRef.current = registry

    refresh()
  }, [master, vault, solace, cpFarm, lpFarm, registry])

  return (
    <>
      {/* {console.log('RENDER')} */}
      {status}
      {/* <div>Farms: {farms}</div>
      <div>Total value locked: {totalValueLocked}</div>
      <div>Farm value staked: {formatEther(valueStaked).toString()}</div>
      <div>Capital Pool Size (Total Assets): {formatEther(assets).toString()}</div>
      <div>Solace Rewards per Month: {rewardsPerMonth.toFixed(2)}</div>
      <div>Rewards per day: {rewardsPerDay.toFixed(2)}</div> */}
      {wallet.isActive ? (
        !loading ? (
          <>
            {/* <div>My rewards per day: {userRewardsPerDay.toFixed(2)}</div>
            <div>My rewards: {userRewards.toFixed(2)}</div> */}
            <div>Account: {wallet.account}</div>
            {/* <div>Chain Id: {wallet.networkId}</div>
            <div>SOLACE: {solaceBalance}</div>
            <div>SCP Tokens: {scp}</div>
            <div>Your CP stake: {userCpValueStaked}</div>
            <div>Your vault share: {`${(userVaultShare * 100).toFixed(2)}%`}</div> */}
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              value={`${amount}`}
              id="amount"
              onChange={(e) => setAmount(parseInt(e.target.value))}
            />
            <label htmlFor="maxLoss">Max Loss: {maxLoss}</label>
            <input
              type="range"
              name="maxLoss"
              id="maxLoss"
              min="1"
              max="10"
              value={maxLoss}
              step="1"
              onChange={(e) => setMaxLoss(parseInt(e.target.value))}
            />
          </>
        ) : (
          <div>Loading</div>
        )
      ) : null}
      <Coins />
      <h2>INVEST</h2>
      <InvestTabPoolView
        names={[
          'Capital Pool Size',
          'Total Value Locked',
          'Solace Rewards / Month',
          'SOLACE',
          'Current Rewards',
          'SCP',
        ]}
        content={[
          formatEther(assets).toString(),
          totalValueLocked,
          rewardsPerMonth.toFixed(2),
          wallet.isActive ? solaceBalance : null,
          rewardsPerDay.toFixed(2),
          wallet.isActive ? scp : null,
        ]}
      />
      <h2>RISK-BACKING ETH CAPITAL POOL</h2>
      <InvestTabPoolView
        names={['ROI', 'Total Assets', 'Deposit ETH', 'Withdraw ETH', 'Vault Share', 'Deposit and stake']}
        content={[
          1,
          formatEther(assets).toString(),
          wallet.isActive ? (
            <button key={2} onClick={callDepositVault}>
              deposit into vault
            </button>
          ) : null,
          wallet.isActive ? (
            <button key={3} onClick={callWithdrawVault}>
              withdraw from vault
            </button>
          ) : null,
          wallet.isActive ? `${(userVaultShare * 100).toFixed(2)}%` : null,
          wallet.isActive ? (
            <button key={5} onClick={callDepositEth}>
              deposit CP and stake
            </button>
          ) : null,
        ]}
      />
      <h2>SOLACE CAPITAL PROVIDER FARM</h2>
      <InvestTabPoolView
        names={['Rewards / Day', 'Total Liquidity', 'My Rewards', 'My Rewards per Day', 'Stake CP', 'Withdraw CP']}
        content={[
          rewardsPerDay.toFixed(2),
          formatEther(valueStaked).toString(),
          wallet.isActive ? userRewards.toFixed(2) : null,
          wallet.isActive ? userRewardsPerDay.toFixed(2) : null,
          wallet.isActive ? (
            <button key={4} onClick={callDepositCp}>
              deposit CP
            </button>
          ) : null,
          wallet.isActive ? (
            <button key={5} onClick={callWithdrawCp}>
              withdraw CP
            </button>
          ) : null,
        ]}
      />
      <h2>SOLACE-ETH LIQUIDITY FARM</h2>
      <InvestTabPoolView
        names={['Rewards / Day', 'Total Liquidity', 'My Rewards', 'My Rewards per Day', 'Stake LP', 'Withdraw LP']}
        content={[
          rewardsPerDay.toFixed(2),
          formatEther(valueStaked).toString(),
          wallet.isActive ? userRewards.toFixed(2) : null,
          wallet.isActive ? userRewardsPerDay.toFixed(2) : null,
          wallet.isActive ? (
            <button key={4} onClick={callDepositCp}>
              deposit CP
            </button>
          ) : null,
          wallet.isActive ? (
            <button key={5} onClick={callWithdrawCp}>
              withdraw CP
            </button>
          ) : null,
        ]}
      />
    </>
  )
}

export default Playground
