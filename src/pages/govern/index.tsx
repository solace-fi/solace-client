import React, { useEffect } from 'react'
import { useWallet } from '../../context/WalletManager'

function Govern(): any {
  const wallet = useWallet()

  return wallet.isActive ? <div>Govern, connected</div> : <div>Govern, disconnected</div>
}

export default Govern
