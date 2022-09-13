export interface FetchedSipMathLib {
	U01:             U01;
	dateCreated:     string;
	error:           boolean;
	error_message:   null;
	globalVariables: GlobalVariable[];
	libraryType:     string;
	message:         string;
	name:            string;
	objectType:      string;
	sips:            SIP[];
	status_code:     number;
	token_map:       TokenMap[];
	version:         string;
}

export interface U01 {
	copula: Copula[];
	rng:    Rng[];
}

export interface Copula {
	arguments:   CopulaArguments;
	copulaLayer: string[];
	function:    string;
	name:        Name;
}

export interface CopulaArguments {
	correlationMatrix: CorrelationMatrix;
	rng:               string[];
}

export interface CorrelationMatrix {
	type:  string;
	value: string;
}

export enum Name {
	Gaussian = "Gaussian",
}

export interface Rng {
	arguments: RngArguments;
	function:  RngFunction;
	name:      string;
}

export interface RngArguments {
	counter: Counter;
	entity:  number;
	seed3:   number;
	seed4:   number;
	varId:   number;
}

export enum Counter {
	PMIndex = "PM_Index",
}

export enum RngFunction {
	Hdr2_0 = "HDR_2_0",
}

export interface GlobalVariable {
	name:  string;
	value: Value;
}

export interface Value {
	columns: string[];
	matrix:  Matrix[];
	rows:    string[];
}

export interface Matrix {
	col:   string;
	row:   string;
	value: number;
}

export interface SIP {
	arguments: SIPArguments;
	function:  SIPFunction;
	metadata:  Metadata;
	name:      string;
	ref:       Ref;
}

export interface SIPArguments {
	aCoefficients: number[];
}

export enum SIPFunction {
	Metalog1_0 = "Metalog_1_0",
}

export interface Metadata {
	P25:     number;
	P50:     number;
	P75:     number;
	count:   number;
	density: number[];
	max:     number;
	mean:    number;
	min:     number;
	std:     number;
}

export interface Ref {
	copulaLayer: string;
	name:        Name;
	source:      Source;
}

export enum Source {
	Copula = "copula",
}

export interface TokenMap {
	[key:string]: string;
	// aurigami?:           string;
	// "aurora-near"?:      string;
	// "bastion-protocol"?: string;
	// bluebit?:            string;
	// dai?:                string;
	// frax?:               string;
	// near?:               string;
	// solace?:             string;
	// tether?:             string;
	// trisolaris?:         string;
	// "usd-coin"?:         string;
	// weth?:               string;
	// "wrapped-bitcoin"?:  string;
}
