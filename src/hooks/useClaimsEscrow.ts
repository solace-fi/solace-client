import { BigNumber } from 'ethers'
import { useContracts } from '../context/ContractsManager'
import { ClaimDetails } from '../constants/types'
import { useEffect, useState } from 'react'

export const useGetClaimsDetails = (claimant: string | undefined): ClaimDetails[] => {
  const { claimsEscrow } = useContracts()
  const [claimsDetails, setClaimsDetails] = useState<ClaimDetails[]>([])

  useEffect(() => {
    const getClaimDetails = async () => {
      if (!claimsEscrow || !claimant) return
      try {
        const claimIds: BigNumber[] = await claimsEscrow.listClaims(claimant)
        const claimsDetails = []
        for (let i = 0; i < claimIds.length; i++) {
          const cooldown = await claimsEscrow.timeLeft(claimIds[i])
          const canWithdraw = await claimsEscrow.isWithdrawable(claimIds[i])
          const claim = await claimsEscrow.claims(claimIds[i])
          const amount = claim.amount
          const claimsDetail = { id: claimIds[i].toString(), cooldown, canWithdraw, amount }
          claimsDetails.push(claimsDetail)
        }
        setClaimsDetails(claimsDetails)
      } catch (err) {
        console.log('getClaimDetails', err)
      }
    }
    getClaimDetails()
  }, [claimsEscrow, claimant])

  return claimsDetails
}

export const useGetCooldownPeriod = (): string => {
  const { claimsEscrow } = useContracts()
  const [cooldownPeriod, setCooldownPeriod] = useState<string>('0')

  useEffect(() => {
    const getCooldownPeriod = async () => {
      if (!claimsEscrow) return
      try {
        const cooldown = await claimsEscrow.cooldownPeriod()
        setCooldownPeriod(cooldown.toString())
      } catch (err) {
        console.log('getCooldownPeriod', err)
      }
    }
    getCooldownPeriod()
  }, [claimsEscrow])

  return cooldownPeriod
}
