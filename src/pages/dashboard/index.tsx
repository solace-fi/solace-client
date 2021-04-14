import React, { useEffect } from 'react'
import { useWallet } from '../../context/Web3Manager'

function Dashboard(): any {
  const wallet = useWallet()

  return wallet.isActive ? <div>Dashboard, connected</div> : <div>Dashboard, disconnected</div>
}

export default Dashboard
