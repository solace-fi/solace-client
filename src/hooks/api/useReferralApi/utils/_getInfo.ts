import { InfoResponse } from '../types/InfoResponse'

export const _getInfo = async ({
  setEarnedAmount,
  setReferredCount,
  setAppliedCode,
  userReferralCode,
  account,
  baseApiUrl,
}: {
  setEarnedAmount: (amount: number | undefined) => void
  setReferredCount: (count: number | undefined) => void
  setAppliedCode: (code: string | undefined) => void
  setCookieCode: (code: string | undefined) => void
  setCookieCodeUsable: (usable: boolean) => void
  userReferralCode: string | undefined
  account: string | null | undefined
  baseApiUrl: string
}): Promise<void> => {
  if (!account) return
  const getInfoUrl = `${baseApiUrl}info?user=${account}`
  const response = await fetch(getInfoUrl, {
    method: 'GET',
    headers: {
      'X-API-KEY': process.env.REACT_APP_REFERRAL_API_KEY as string,
    },
  })
  const data = (await response.json()) as InfoResponse
  const _earnedAmount = data.result?.reward_accounting?.referred_earns
  const _referredCount = !userReferralCode ? 0 : data.result?.referred_users.length
  const _appliedCode = data.result?.applied_referral_codes?.[0]?.referral_code
  _earnedAmount ? setEarnedAmount(_earnedAmount) : setEarnedAmount(0)
  _referredCount ? setReferredCount(_referredCount) : setReferredCount(0)
  _appliedCode ? setAppliedCode(_appliedCode) : setAppliedCode('')
}
