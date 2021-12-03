import { useEffect, useMemo, useState } from 'react'
import { BigNumber } from 'ethers'
import { useContracts } from '../context/ContractsManager'
import { ClaimDetails } from '../constants/types'
import { useWallet } from '../context/WalletManager'
import { useProvider } from '../context/ProviderManager'

export const useGetClaimsDetails = (): ClaimDetails[] => {
  const { account } = useWallet()
  const { keyContracts } = useContracts()
  const { claimsEscrow } = useMemo(() => keyContracts, [keyContracts])
  const [claimsDetails, setClaimsDetails] = useState<ClaimDetails[]>([])
  const { latestBlock } = useProvider()

  useEffect(() => {
    const getClaimDetails = async () => {
      if (!claimsEscrow || !account) return
      try {
        const claimIds: BigNumber[] = await claimsEscrow.listTokensOfOwner(account)
        const claimsDetails = await Promise.all(
          claimIds.map(async (claimId) => {
            const [cooldown, canWithdraw, claim] = await Promise.all([
              claimsEscrow.timeLeft(claimId),
              claimsEscrow.isWithdrawable(claimId),
              claimsEscrow.claim(claimId),
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
  }, [claimsEscrow, account, latestBlock])

  return claimsDetails
}

export const useGetCooldownPeriod = (): string => {
  const { keyContracts } = useContracts()
  const { claimsEscrow } = useMemo(() => keyContracts, [keyContracts])
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
