import { BigNumber, PolicyReferral } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useGeneral } from '../../../context/GeneralManager'
import { useNetwork } from '../../../context/NetworkManager'
import { useCheckIsCoverageActive } from '../../policy/useSolaceCoverProductV3'

export default function useReferralApi(): {
  userReferralCode: string | undefined
  earnedAmount: number | undefined
  referredCount: number | undefined
  appliedReferralCode: string | undefined
  cookieReferralCode: string | undefined
  setCookieReferralCode: (code: string | undefined) => void
  cookieCodeUsable: boolean
  applyReferralCode: (referral_code: string, policy_id: number, chain_id: number) => Promise<boolean>
} {
  const { account } = useWeb3React()
  const { referralCode: localStorageReferralCode } = useGeneral()
  const { activeNetwork } = useNetwork()
  const { policyId } = useCheckIsCoverageActive()

  const policyReferralObj = useMemo(() => new PolicyReferral(), [])

  const [userReferralCode, setUserReferralCode] = useState<string | undefined>(undefined)
  const [earnedAmount, setEarnedAmount] = useState<number | undefined>(undefined)
  const [referredCount, setReferredCount] = useState<number | undefined>(undefined)
  const [appliedCode, setAppliedCode] = useState<string | undefined>(undefined)
  const [cookieCode, setCookieCode] = useState<string | undefined>(undefined)
  const [cookieCodeUsable, setCookieCodeUsable] = useState<boolean>(false)

  const getInfo = useCallback(async () => {
    if (!account || !policyId || policyId.isZero()) return
    const res = await policyReferralObj.getInfo(account, policyId, activeNetwork.chainId)
    setEarnedAmount(res.earnedAmount)
    setReferredCount(res.referredCount)
    setAppliedCode(res.appliedCode)
    setUserReferralCode(res.referralCode)
    console.log('referral - info', res)
  }, [account, activeNetwork, policyId, policyReferralObj])

  const checkReferralCodeUsability = useCallback(
    async (referral_code: string) => {
      const canBeUsed = await policyReferralObj.isReferralCodeUsable(referral_code)
      setCookieCodeUsable(canBeUsed)
    },
    [policyReferralObj]
  )

  useEffect(() => {
    const code = localStorageReferralCode
    if (code && code !== 'null' && code !== 'undefined' && code !== '') {
      setCookieCode(code)
    } else {
      setCookieCodeUsable(false)
      setCookieCode(undefined)
    }

    setTimeout(() => {
      getInfo()
    }, 400)
  }, [getInfo, account, activeNetwork, policyId, localStorageReferralCode])

  useEffect(() => {
    if (cookieCode) checkReferralCodeUsability(cookieCode)
  }, [cookieCode, checkReferralCodeUsability])

  const applyCode = useCallback(
    async (referral_code: string, policy_id: number, chain_id: number) => {
      console.log('referral - applying code', referral_code)
      console.log('referral - policy_id', policy_id)
      console.log('referral - chain_id', chain_id)
      if (!account) return false
      console.log('referral - account found, policyId found')
      if (appliedCode) return false
      const res = await policyReferralObj.applyCode(account, referral_code, BigNumber.from(policy_id), chain_id)
      console.log('referral - api response', res)
      if (res.message !== 'not found' && res.message !== 'failure' && res.status) {
        setAppliedCode(res.message)
        return true
      }
      return false
    },
    [account, appliedCode, policyReferralObj]
  )

  return {
    userReferralCode,
    earnedAmount,
    referredCount,
    appliedReferralCode: appliedCode, // the returned code from the server
    applyReferralCode: applyCode,
    cookieReferralCode: cookieCode, // the referral code on storage
    cookieCodeUsable,
    setCookieReferralCode: setCookieCode,
  }
}
