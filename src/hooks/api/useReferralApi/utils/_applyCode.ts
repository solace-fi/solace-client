import { ApplyPromoCodeFailure, ApplyPromoCodeResponse, ApplyPromoCodeSuccess } from '../types/ApplyPromoCodeResponse'
import {
  ApplyReferralCodeResponse,
  ApplyReferralCodeFailure,
  ApplyReferralCodeSuccess,
} from '../types/ApplyReferralCodeResponse'

type ApplyReferralProps = {
  account: undefined | null | string
  appliedCode: string | undefined
  baseApiUrl: string
  setAppliedCode: (code: string | undefined) => void
  codeType: 'referral'
}

type ApplyPromoProps = {
  account: undefined | null | string
  appliedCodes: string[]
  baseApiUrl: string
  setAppliedCodes: (codes: string[]) => void
  codeType: 'promo'
}

// structure is: _applyCode = (props: ApplyReferralProps | ApplyPromoProps): (referral_code: string, policy_id: number, chain_id: number): Promise<boolean>

export const _applyCode = (props: ApplyReferralProps | ApplyPromoProps) => async (
  referral_code: string,
  policy_id: number,
  chain_id: number
): Promise<boolean> => {
  // common props
  const { account, baseApiUrl, codeType } = props
  // referral props
  const { setAppliedCode, appliedCode } = props as ApplyReferralProps
  // promo props
  const { setAppliedCodes, appliedCodes } = props as ApplyPromoProps

  const keyword = codeType
  console.log(`${keyword} - applying code`, referral_code)
  console.log(`${keyword} - policy_id`, policy_id)
  console.log(`${keyword} - chain_id`, chain_id)
  if (!account) return false
  console.log(keyword + ' - account found, policyId found')
  if (appliedCode) return false
  // add: promo-codes/apply
  const applyCodeUrl = `${baseApiUrl}${keyword}-codes/apply`
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
      referral_code: codeType === 'referral' ? referral_code : undefined,
      promo_code: codeType === 'promo' ? referral_code : undefined,
    }),
  })
  const data = (await response.json()) as ApplyReferralCodeResponse | ApplyPromoCodeResponse
  console.log(`${keyword} - api response`, data)

  const isReferralResponse = (
    data: ApplyReferralCodeResponse | ApplyPromoCodeResponse
  ): data is ApplyReferralCodeResponse => {
    return !!(
      !(data as ApplyReferralCodeFailure).Message &&
      ((data as ApplyReferralCodeResponse).result as ApplyReferralCodeSuccess).referral_code
    )
  }

  const isPromoResponse = (
    data: ApplyReferralCodeResponse | ApplyPromoCodeResponse
  ): data is ApplyPromoCodeResponse => {
    return !!(
      !(data as ApplyPromoCodeFailure).Message && ((data as ApplyPromoCodeResponse) as ApplyPromoCodeSuccess).promo_code
    )
  }

  if (codeType === 'referral' && isReferralResponse(data)) {
    const _appliedCode = data.result.referral_code
    _appliedCode && setAppliedCode(_appliedCode)
    console.log(`${keyword} - applied code`, _appliedCode)
    return _appliedCode ? true : false
  }
  if (codeType === 'promo' && isPromoResponse(data)) {
    const _appliedCodes = data.result?.promo_codes
    _appliedCodes && setAppliedCodes(_appliedCodes)
    console.log(`${keyword} - applied codes`, _appliedCodes)
    return _appliedCodes ? true : false
  }
}
