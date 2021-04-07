import React, { useEffect } from 'react'
import { useMasterContract } from '../../hooks/useContract'
import { useWeb3React } from '@web3-react/core'

function Quote(): any {
  // const masterContract = useMasterContract('0x00000000', false)
  const { active } = useWeb3React()

  return active ? <div>Quote, connected</div> : <div>Quote, disconnected</div>
}

export default Quote
