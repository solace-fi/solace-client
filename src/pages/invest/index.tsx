import React, { useEffect } from 'react'
import { useMasterContract } from '../../hooks/useContract'

function Invest(): any {
  const masterContract = useMasterContract('0x00000000', false)
  return <div>Invest</div>
}

export default Invest
