import { BigNumber } from '@solace-fi/sdk-nightly'
import { NetworkConfig } from '../../../../constants/types'
import { GetByUserResponse } from '../types/GetByUserResponse'
import { InfoResponse } from '../types/InfoResponse'

export const _getUserReferralCode = async ({
  baseApiUrl,
  account,
  policyId,
  activeNetwork,
  setUserReferralCode,
}: {
  baseApiUrl: string
  account: string | null | undefined
  policyId: BigNumber | undefined
  activeNetwork: NetworkConfig
  setUserReferralCode: (code: string | undefined) => void
}): Promise<void> => {
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
}
