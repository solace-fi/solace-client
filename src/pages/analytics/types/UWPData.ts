export interface FetchedUWPData {
	[key: string]: BlockData[]
}

export interface BlockData {
	blockNumber: number;
	timestamp:   number;
	timestring:  string;
	tokens:      { [key: string]: Token };
	pool?:       Pool;
}

export interface Pool {
	supply:        string;
	valuePerShare: string;
}

export interface Token {
	balance: string;
	price:   string;
}
