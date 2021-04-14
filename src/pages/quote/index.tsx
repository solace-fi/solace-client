import React, { useEffect } from 'react'
import { useWallet } from '../../context/Web3Manager'

function Quote(): any {
  const wallet = useWallet()

  return wallet.isActive ? <div>Quote, connected</div> : <div>Quote, disconnected</div>
}

export default Quote
