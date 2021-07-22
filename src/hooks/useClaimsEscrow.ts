import { BigNumber } from 'ethers'
import { useContracts } from '../context/ContractsManager'
import { ClaimDetails } from '../constants/types'
import { useEffect, useState } from 'react'
import { useCachedData } from '../context/CachedDataManager'

export const useGetClaimsDetails = (claimant: string | undefined): ClaimDetails[] => {
  const { claimsEscrow } = useContracts()
  const [claimsDetails, setClaimsDetails] = useState<ClaimDetails[]>([])
  const { latestBlock } = useCachedData()

  useEffect(() => {
    const getClaimDetails = async () => {
      if (!claimsEscrow || !claimant) return
      try {
        const claimIds: BigNumber[] = await claimsEscrow.listClaims(claimant)
        const claimsDetails = await Promise.all(
          claimIds.map(async (claimId) => {
            const [cooldown, canWithdraw, claim] = await Promise.all([
              claimsEscrow.timeLeft(claimId),
              claimsEscrow.isWithdrawable(claimId),
              claimsEscrow.claims(claimId),
            ])
            const amount = claim.amount
            const claimsDetail = { id: claimId.toString(), cooldown, canWithdraw, amount }
            return claimsDetail
          })
        )
        setClaimsDetails(claimsDetails)
      } catch (err) {
        console.log('getClaimDetails', err)
      }
    }
    getClaimDetails()
  }, [claimsEscrow, claimant, latestBlock])

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
