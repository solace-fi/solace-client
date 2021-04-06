import React, { useEffect } from 'react'
import { useMasterContract } from '../../hooks/useContract'

function Quote(): any {
  const masterContract = useMasterContract('0x00000000', false)
  return <div>Quote</div>
}

export default Quote
