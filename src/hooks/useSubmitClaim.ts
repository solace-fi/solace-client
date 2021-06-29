import React, { useEffect, useState } from 'react'
import { useContracts } from '../context/ContractsManager'
import { getClaims, ClaimAssessment } from '../utils/claimsGetter'

export const useSubmitClaim = (policyId: number): ClaimAssessment | null => {
  const [claims, setClaims] = useState<ClaimAssessment | null>(null)
  const { selectedProtocol } = useContracts()

  const getClaimAssessment = async () => {
    if (!selectedProtocol) return
    try {
      const assessment = await getClaims(String(policyId))
      setClaims(assessment)
    } catch (err) {
      console.log('getClaimAssessment', err)
    }
  }

  useEffect(() => {
    getClaimAssessment()
  }, [selectedProtocol])

  return claims
}
