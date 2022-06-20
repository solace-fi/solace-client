import { useWeb3React } from '@web3-react/core'
import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { useGeneral } from '../../../context/GeneralManager'
import { useNetwork } from '../../../context/NetworkManager'
import { useCheckIsCoverageActive } from '../../policy/useSolaceCoverProductV3'
import { GetByUserResponse } from './GetByUserResponse'
import { InfoResponse, InfoResponseArray, AppliedPromoCode } from './InfoResponse'

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

  const [userReferralCode, setUserReferralCode] = useState<string | undefined>(undefined)
  const [earnedAmount, setEarnedAmount] = useState<number | undefined>(undefined)
  const [referredCount, setReferredCount] = useState<number | undefined>(undefined)
  const [appliedCode, setAppliedCode] = useState<string | undefined>(undefined)
  const [cookieCode, setCookieCode] = useState<string | undefined>(undefined)
  const [cookieCodeUsable, setCookieCodeUsable] = useState<boolean>(false)

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
        _referralCode && setUserReferralCode(_referralCode)
      }
      postReferralCode()
    } else setUserReferralCode(_referralCode)
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
    const _appliedCode = data.result?.applied_referral_codes?.[0]?.referral_code
    _earnedAmount ? setEarnedAmount(_earnedAmount) : setEarnedAmount(0)
    _referredCount ? setReferredCount(_referredCount) : setReferredCount(0)
    _appliedCode ? setAppliedCode(_appliedCode) : setAppliedCode('')
    console.log(_appliedCode)
  }, [account])

  const checkReferralCodeUsability = useCallback(async (referral_code: string) => {
    const url = `${baseApiUrl}referral-codes?referral_code=${referral_code}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': process.env.REACT_APP_REFERRAL_API_KEY as string,
      },
    })
    const data = (await response.json()) as InfoResponseArray
    const _referralCode = data.result?.length > 0
    setCookieCodeUsable(_referralCode)
  }, [])

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
    if (cookieCode) checkReferralCodeUsability(cookieCode)
  }, [cookieCode, checkReferralCodeUsability])

  const applyCode = async (referral_code: string, policy_id: number, chain_id: number) => {
    console.log('referral - applying code', referral_code)
    console.log('referral - policy_id', policy_id)
    console.log('referral - chain_id', chain_id)
    if (!account) return false
    console.log('referral - account found, policyId found')
    if (appliedCode) return false
    // add: promo-codes/apply
    const applyCodeUrl = `${baseApiUrl}referral-codes/apply`
    const response = await fetch(applyCodeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.REACT_APP_REFERRAL_API_KEY as string,
      },
      body: JSON.stringify({
        user: account,
        // chain_id: 4,
        // policy_id: 1,
        chain_id,
        policy_id,
        referral_code,
      }),
    })
    const data = await response.json()
    console.log('referral - api response', data)
    const _appliedCode = data.result?.referral_code
    _appliedCode && setAppliedCode(_appliedCode)
    console.log('referral - applied code', _appliedCode)
    return _appliedCode ? true : false
  }

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
