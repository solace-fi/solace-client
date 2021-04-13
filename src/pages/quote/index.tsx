import React, { useEffect } from 'react'
import { useMasterContract } from '../../hooks/useContract'
import { useWallet } from '../../context/Web3Manager'

function Quote(): any {
  // const masterContract = useMasterContract('0x00000000', false)
  const wallet = useWallet()

  return wallet.isActive ? <div>Quote, connected</div> : <div>Quote, disconnected</div>
}

export default Quote
