import React, { useEffect } from 'react'
import { useMasterContract } from '../../hooks/useContract'
import { useWallet } from '../../context/Web3Manager'

function Dashboard(): any {
  // const masterContract = useMasterContract('0x00000000', false)
  const wallet = useWallet()

  return wallet.isActive ? <div>Dashboard, connected</div> : <div>Dashboard, disconnected</div>
}

export default Dashboard
