export interface FetchedPremiums {
	[key: string]: BlockPremiumData
}

export interface BlockPremiumData {
	history:          History[];
	lastScannedBlock: number;
}

export interface History {
	epochStartTimestamp: number;
	uweAmount:           string;
	uwpValuePerShare:    string;
	uwpPerUwe:           string;
}
