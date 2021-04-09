import React, { useEffect, useContext } from 'react'

import { useWallet } from '../../context/Web3Manager'
import Coins from '../../components/ui/Coins'

function Dashboard(): any {
  const wallet = useWallet()
  const status = wallet.isActive ? <div>Dashboard, connected</div> : <div>Dashboard, disconnected</div>
  return (
    <>
      {status}
      <Coins />
    </>
  )
}

export default Dashboard
