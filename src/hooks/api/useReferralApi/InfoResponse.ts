/* eslint-disable prettier/prettier */
export interface InfoResponse {
	result: Result;
}

export interface Result {
	referral_codes:         AppliedPromoCode[];
	applied_referral_codes: AppliedPromoCode[];
	applied_promo_codes:    AppliedPromoCode[];
	reward_accounting:      RewardAccounting;
	referred_users:         AppliedPromoCode[];
}

export interface AppliedPromoCode {
	updated_time:   string;
	policy_id:      number;
	promo_code?:    string;
	chain_id:       number;
	user:           string;
	id?:            number;
	created_time:   string;
	referral_code?: string;
	reward_amount?: number;
}

export interface RewardAccounting {
	updated_time:   string;
	promo_rewards:  number;
	referred_count: number;
	user:           string;
	used_rewards:   number;
	created_time:   string;
	referred_earns: number;
}
