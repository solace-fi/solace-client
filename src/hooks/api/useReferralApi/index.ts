import { useWeb3React } from '@web3-react/core'
import { useState, useEffect, useCallback } from 'react'
import { useGeneral } from '../../../context/GeneralManager'
import { useNetwork } from '../../../context/NetworkManager'
import { useCheckIsCoverageActive } from '../../policy/useSolaceCoverProductV3'
import { _applyCode } from './utils/_applyCode'
import { _checkReferralCodeUsability } from './utils/_checkReferralCodeUseability'
import { _getInfo } from './utils/_getInfo'
import { _getUserReferralCode } from './utils/_getUserReferralCode'

export default function useReferralApi(): {
  userReferralCode: string | undefined
  earnedAmount: number | undefined
  referredCount: number | undefined
  appliedReferralCode: string | undefined
  cookieReferralCode: string | undefined
  setCookieReferralCode: (code: string | undefined) => void
  cookieCodeUsable: boolean
  applyReferralCode: (referral_code: string, policy_id: number, chain_id: number) => Promise<boolean>
  applyPromoCode: (promo_code: string, policy_id: number, chain_id: number) => Promise<boolean>
} {
  const { account } = useWeb3React()
  const { referralCode: localStorageReferralCode, promoCode: localStoragePromoCode } = useGeneral()
  const { activeNetwork } = useNetwork()
  const { policyId } = useCheckIsCoverageActive()

  const [userReferralCode, setUserReferralCode] = useState<string | undefined>(undefined)
  const [earnedAmount, setEarnedAmount] = useState<number | undefined>(undefined)
  const [referredCount, setReferredCount] = useState<number | undefined>(undefined)
  const [appliedReferralCode, setAppliedReferralCode] = useState<string | undefined>(undefined)
  const [appliedPromoCodes, setAppliedPromoCodes] = useState<string[]>([])
  const [cookieCode, setCookieCode] = useState<string | undefined>(undefined)
  const [cookieCodeUsable, setCookieCodeUsable] = useState<boolean>(false)

  const baseApiUrl = 'https://2vo3wfced8.execute-api.us-west-2.amazonaws.com/prod/'

  const getUserReferralCode = useCallback(
    () =>
      _getUserReferralCode({
        baseApiUrl,
        account,
        policyId,
        activeNetwork,
        setUserReferralCode,
      }),
    [account, activeNetwork, policyId]
  )

  const getInfo = useCallback(
    () =>
      _getInfo({
        setEarnedAmount,
        account,
        baseApiUrl,
        setAppliedCode: setAppliedReferralCode,
        setReferredCount,
        setCookieCode,
        setCookieCodeUsable,
        userReferralCode,
      }),
    [account, userReferralCode]
  )

  const checkReferralCodeUsability = useCallback(
    () =>
      cookieCode &&
      _checkReferralCodeUsability({
        baseApiUrl,
        localStorageReferralCode,
        referral_code: cookieCode,
        setCookieCode,
        setCookieCodeUsable,
      }),
    [cookieCode, localStorageReferralCode]
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
      // GET OWN CODE
      getUserReferralCode()

      // GET EARNED AMOUNT, REFERRED COUNT and APPLIED CODE
      getInfo()
    }, 400)
  }, [getInfo, getUserReferralCode, account, activeNetwork, policyId, localStorageReferralCode])

  useEffect(() => {
    if (cookieCode) checkReferralCodeUsability()
  }, [cookieCode, checkReferralCodeUsability])

  const applyReferralCode = _applyCode({
    account,
    appliedCode: appliedReferralCode,
    baseApiUrl,
    setAppliedCode: setAppliedReferralCode,
    codeType: 'referral',
  })
  const applyPromoCode = _applyCode({
    account,
    appliedCode: undefined,
    baseApiUrl,
    setAppliedCode: setAppliedReferralCode,
    codeType: 'promo',
  })

  return {
    userReferralCode,
    earnedAmount,
    referredCount,
    appliedReferralCode: appliedReferralCode, // the returned code from the server
    applyReferralCode,
    applyPromoCode,
    cookieReferralCode: cookieCode, // the referral code on storage
    cookieCodeUsable,
    setCookieReferralCode: setCookieCode,
  }
}
