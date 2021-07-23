import React, { useState } from 'react'
import { Content } from '../../components/Layout'
import { Heading1 } from '../../components/Typography'
import { Table, TableHead, TableRow, TableHeader, TableBody, TableData, TableDataGroup } from '../../components/Table'
import { LP_ROI, DEADLINE } from '../../constants'
import { useWallet } from '../../context/WalletManager'
import { Button } from '../../components/Button'
import { truncateBalance } from '../../utils/formatting'
import { FunctionName } from '../../constants/enums'
import { useContracts } from '../../context/ContractsManager'
import { useRewardsPerDay, useUserPendingRewards, useUserRewardsPerDay } from '../../hooks/useRewards'
import { useUserStakedValue, usePoolStakedValue } from '../../hooks/useFarm'
import { BigNumberish, BigNumber as BN } from 'ethers'
import { sortTokens } from '../../utils/token'
import { FeeAmount, TICK_SPACINGS, getMaxTick, getMinTick } from '../../utils/uniswap'
import { getProviderOrSigner } from '../../utils'
import { Contract } from '@ethersproject/contracts'

interface LiquidityPoolProps {
  openModal: (func: FunctionName, modalTitle: string) => void
}

export const LiquidityPool: React.FC<LiquidityPoolProps> = ({ openModal }) => {
  const wallet = useWallet()
  const { solace, lpFarm, lpToken, weth } = useContracts()

  const lpRewardsPerDay = useRewardsPerDay(2)
  const lpUserRewardsPerDay = useUserRewardsPerDay(2, lpFarm, wallet.account)
  const [lpUserRewards] = useUserPendingRewards(lpFarm)

  const lpPoolValue = usePoolStakedValue(lpFarm)
  const lpUserStakeValue = useUserStakedValue(lpFarm, wallet.account)

  const callMintLpToken = async (amount: number) => {
    if (!weth || !solace || !lpToken) return
    const signer = getProviderOrSigner(wallet.library, wallet.account)
    const lpTokenAddress = lpToken.address
    try {
      const governance = await solace.governance()
      console.log(governance)
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
    } catch (err) {
      console.log(err)
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

  return (
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
            <TableData width={100}>{LP_ROI}</TableData>
            {wallet.account ? <TableData>{truncateBalance(parseFloat(lpUserRewards), 2)}</TableData> : null}
            {wallet.account ? <TableData>{truncateBalance(parseFloat(lpUserRewardsPerDay), 2)}</TableData> : null}
            <TableData>{truncateBalance(parseFloat(lpRewardsPerDay), 2)}</TableData>
            {wallet.account ? (
              <TableData textAlignRight>
                <TableDataGroup width={200}>
                  {/* <Button onClick={() => callMintLpToken(0.02)}>mintlp</Button> */}
                  <Button
                    disabled={wallet.errors.length > 0}
                    onClick={() => openModal(FunctionName.DEPOSIT_LP, 'Deposit')}
                  >
                    Deposit
                  </Button>
                  <Button
                    disabled={wallet.errors.length > 0}
                    onClick={() => openModal(FunctionName.WITHDRAW_LP, 'Withdraw')}
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
  )
}
