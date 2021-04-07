import React, { useEffect, useContext } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useMasterContract } from '../../hooks/useContract'

function Invest(): any {
  // const masterContract = useMasterContract('0x00000000', false)
  const { active, connector, library, chainId, account, error } = useWeb3React()
  console.log('active:', active)
  console.log('connector:', connector)
  console.log('library:', library)
  console.log('chainId:', chainId)
  console.log('account:', account)
  console.log('error:', error)
  return active ? <div>Invest, connected</div> : <div>Invest, disconnected</div>
}

export default Invest
