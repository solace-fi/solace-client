/* eslint-disable prettier/prettier */
export interface GetByUserResponse {
	result: Result[];
}

export interface Result {
	updated_time:  string;
	policy_id:     number;
	chain_id:      number;
	referral_code: string;
	user:          string;
	created_time:  string;
	reward_amount: number;
}