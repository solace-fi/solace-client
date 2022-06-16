import { useWeb3React } from '@web3-react/core'
import { useState, useEffect, useCallback } from 'react'
import { useNetwork } from '../../../context/NetworkManager'
import { useCheckIsCoverageActive } from '../useSolaceCoverProductV3'
import { GetByUserResponse } from './GetByUserResponse'
import { InfoResponse } from './InfoResponse'

export default function useReferralsApi(): {
  referralCode: string | undefined
  earnedAmount: number | undefined
  referredCount: number | undefined
  appliedCode: string | undefined
} {
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { policyId } = useCheckIsCoverageActive()

  const [referralCode, setReferralCode] = useState<string | undefined>(undefined)
  const [earnedAmount, setEarnedAmount] = useState<number | undefined>(undefined)
  const [referredCount, setReferredCount] = useState<number | undefined>(undefined)
  const [appliedCode, setAppliedCode] = useState<string | undefined>(undefined)

  const baseApiUrl = 'https://2vo3wfced8.execute-api.us-west-2.amazonaws.com/prod/'

  const getUserReferralCode = useCallback(async () => {
    if (!account || !policyId || policyId.isZero()) return
    // if (!account /**|| !policyId || policyId.isZero() */) return
    const getUserReferralCodeUrl = `${baseApiUrl}referral-codes?user=${account}`
    const response = await fetch(getUserReferralCodeUrl)
    const data = (await response.json()) as GetByUserResponse
    const _referralCode = data.result?.[0]?.referral_code

    // if there is no referral code, then we must set it by calling baseUrl + referral-codes
    // on success, we will have either Message or `result.referral_code`
    if (!_referralCode) {
      const postReferralCodeUrl = `${baseApiUrl}referral-codes`
      const postReferralCode = async () => {
        const response = await fetch(postReferralCodeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_REFERRAL_API_KEY as string,
          },
          body: JSON.stringify({
            user: account,
            // chain_id: 4,
            // policy_id: 12,
            chain_id: activeNetwork.chainId,
            policy_id: policyId.toNumber(),
          }),
        })
        const data = (await response.json()) as InfoResponse
        const _referralCode = data.result?.referral_codes?.[0]?.referral_code
        _referralCode && setReferralCode(_referralCode)
      }
      postReferralCode()
    } else setReferralCode(_referralCode)
  }, [account, activeNetwork, policyId])

  const getInfo = useCallback(async () => {
    if (!account) return
    const getInfoUrl = `${baseApiUrl}info?user=${account}`
    const response = await fetch(getInfoUrl, {
      method: 'GET',
      headers: {
        'X-API-KEY': process.env.REACT_APP_REFERRAL_API_KEY as string,
      },
    })
    const data = (await response.json()) as InfoResponse
    const _earnedAmount = data.result?.reward_accounting?.promo_rewards
    const _referredCount = data.result?.reward_accounting?.referred_count
    const _appliedCode = data.result?.applied_promo_codes?.[0]?.promo_code
    _earnedAmount ? setEarnedAmount(_earnedAmount) : setEarnedAmount(0)
    _referredCount ? setReferredCount(_referredCount) : setReferredCount(0)
    _appliedCode ? setAppliedCode(_appliedCode) : setAppliedCode('')
  }, [account])

  useEffect(() => {
    setTimeout(() => {
      // GET OWN CODE
      getUserReferralCode()

      // GET EARNED AMOUNT, REFERRED COUNT and APPLIED CODE
      getInfo()
    }, 400)
  }, [getInfo, getUserReferralCode])
  return { referralCode, earnedAmount, referredCount, appliedCode }
}
