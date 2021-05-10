import React, { useEffect } from 'react'
import { useWallet } from '../../context/Web3Manager'

function Govern(): any {
  const wallet = useWallet()

  return wallet.isActive ? <div>Govern, connected</div> : <div>Govern, disconnected</div>
}

export default Govern
