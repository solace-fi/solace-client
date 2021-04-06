import React, { useEffect } from 'react'
import { formatEther } from '@ethersproject/units'
import { useMasterContract } from '../../hooks/useContract'
import { useBalance } from '../../hooks/useBalance'
import { useWeb3React } from '@web3-react/core'

function Dashboard(): any {
  const masterContract = useMasterContract('0x00000000', false)
  const balance = useBalance()
  const { active } = useWeb3React()
  const answer = active ? (
    <div>Dashboard, your balance is {`Ξ${balance ? formatEther(balance) : ''}`}</div>
  ) : (
    <div>Dashboard, please connect wallet</div>
  )
  return answer
}

export default Dashboard
