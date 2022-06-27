import { InfoResponseArray } from '../types/InfoResponse'

export const _checkReferralCodeUsability = async ({
  baseApiUrl,
  referral_code,
  setCookieCodeUsable,
}: {
  baseApiUrl: string
  referral_code: string | undefined
  setCookieCode: (code: string | undefined) => void
  setCookieCodeUsable: (usable: boolean) => void
  localStorageReferralCode: string | undefined
}): Promise<void> => {
  !referral_code && setCookieCodeUsable(false)
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
}
