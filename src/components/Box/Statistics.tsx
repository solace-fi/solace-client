import React, { useEffect, useRef, useState } from 'react'
import { BoxRow, Box, BoxItem, BoxItemValue, BoxItemTitle, BoxItemUnits } from './index'
import { Button } from '../Button'

import { Contract } from '@ethersproject/contracts'
import { useWallet } from '../../context/Web3Manager'
import { useContracts } from '../../context/ContractsManager'
import { formatEther, parseEther } from '@ethersproject/units'

import { SUPPORTED_WALLETS } from '../../ethers/wallets'
import { useCapitalPoolSize } from '../../hooks/useCapitalPoolSize'
import { useScpBalance } from '../../hooks/useScpBalance'
import { useTotalPendingRewards } from '../../hooks/useRewards'
import { useSolaceBalance } from '../../hooks/useSolaceBalance'
import { usePoolStakedValue } from '../../hooks/usePoolStakedValue'
import { fixed } from '../../utils/fixedValue'

export const Statistics = () => {
  const wallet = useWallet()
  const { master, vault, solace, cpFarm, lpFarm, lpToken } = useContracts()

  const masterContract = useRef<Contract | null>()
  const vaultContract = useRef<Contract | null>()
  const solaceContract = useRef<Contract | null>()
  const cpFarmContract = useRef<Contract | null>()
  const lpFarmContract = useRef<Contract | null>()
  const lpTokenContract = useRef<Contract | null>()

  const [totalValueLocked, setTotalValueLocked] = useState<string>('0.00')
  const capitalPoolSize = useCapitalPoolSize()
  const solaceBalance = useSolaceBalance()
  const scpBalance = useScpBalance()

  const [lp, setLp] = useState<number>(0)

  const totalUserRewards = useTotalPendingRewards()

  const cpPoolValue = usePoolStakedValue(cpFarm)
  const lpPoolValue = usePoolStakedValue(lpFarm)

  const claimRewards = async () => {
    if (!masterContract.current) return
    await masterContract.current.withdrawRewards()
    wallet.reload()
  }

  const claimCpRewards = async () => {
    if (!cpFarmContract.current) return
    await cpFarmContract.current.withdrawRewards()
  }

  const claimLpRewards = async () => {
    if (!lpFarmContract.current) return
    await lpFarmContract.current.withdrawRewards()
  }

  const getTotalValueLocked = () => {
    const formattedTVL = formatEther(parseEther(cpPoolValue).add(parseEther(lpPoolValue)))
    setTotalValueLocked(formattedTVL)
  }

  useEffect(() => {
    cpFarmContract.current = cpFarm
    lpFarmContract.current = lpFarm
    lpTokenContract.current = lpToken
    masterContract.current = master
    solaceContract.current = solace
    vaultContract.current = vault

    getTotalValueLocked()
  }, [master, vault, solace, cpFarm, lpFarm, lpToken])

  useEffect(() => {
    getTotalValueLocked()
  }, [cpPoolValue, lpPoolValue, wallet])

  return (
    <BoxRow>
      {wallet.initialized ? (
        <Box>
          <BoxItem>
            <BoxItemTitle h3>My Balance</BoxItemTitle>
            <BoxItemValue h2>
              {`${fixed(parseFloat(solaceBalance))} `}
              <BoxItemUnits h3>SOLACE</BoxItemUnits>
            </BoxItemValue>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3>My SCP</BoxItemTitle>
            <BoxItemValue h2>
              {`${fixed(parseFloat(scpBalance))} `}
              <BoxItemUnits h3>TOKENS</BoxItemUnits>
            </BoxItemValue>
          </BoxItem>
          <BoxItem>
            <BoxItemTitle h3>My Rewards</BoxItemTitle>
            <BoxItemValue h2>
              {`${fixed(parseFloat(totalUserRewards))} `}
              <BoxItemUnits h3>SOLACE</BoxItemUnits>
            </BoxItemValue>
          </BoxItem>
          <BoxItem>
            <Button onClick={claimRewards}>Claim</Button>
          </BoxItem>
        </Box>
      ) : (
        <Box>
          <BoxItem>
            <Button
              onClick={() =>
                wallet.connect(SUPPORTED_WALLETS[SUPPORTED_WALLETS.findIndex((wallet) => wallet.id === 'metamask')])
              }
            >
              Connect Wallet
            </Button>
          </BoxItem>
        </Box>
      )}
      <Box purple>
        <BoxItem>
          <BoxItemTitle h3>Capital Pool Size</BoxItemTitle>
          <BoxItemValue h2>{fixed(parseFloat(formatEther(capitalPoolSize).toString()))}</BoxItemValue>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Total Value Locked</BoxItemTitle>
          <BoxItemValue h2>{fixed(parseFloat(totalValueLocked))}</BoxItemValue>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Active Cover Amount</BoxItemTitle>
          <BoxItemValue h2>$0</BoxItemValue>
        </BoxItem>
        <BoxItem>
          <BoxItemTitle h3>Total Active Policies</BoxItemTitle>
          <BoxItemValue h2>0</BoxItemValue>
        </BoxItem>
      </Box>
    </BoxRow>
  )
}
