import React, { useEffect, useContext } from 'react'

import { useWallet } from '../../context/Web3Manager'

function Invest(): any {
  const wallet = useWallet()
  return wallet.isActive ? <div>Invest, connected</div> : <div>Invest, disconnected</div>
}

export default Invest
