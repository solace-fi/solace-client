/**success response:
 * {
    "user": "0x1Ada9Ae98457aD8a2D53DE2B888cd1337d3438E8",
    "promo_code": "P1AA",
    "chain_id": 4,
    "policy_id": 1
}
 */

/** failure response:
 * {
    "Message": "User already applied for promo code P1AA" | string
}
 */

type Failure = { Message: string }
type Success = {
  user: string
  promo_code: string
  chain_id: number
  policy_id: number
}
export type ApplyPromoCodeResponse = Success | Failure
