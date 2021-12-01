export enum TransactionCondition {
  SUCCESS = 'Complete',
  FAILURE = 'Incomplete',
  PENDING = 'Pending',
  CANCELLED = 'Cancelled',
}

export enum Error {
  UNSUPPORTED_NETWORK = 'UN',
  NO_PROVIDER = 'NP',
  UNKNOWN_WALLET_ERROR = 'UWE',
  NO_ACCESS = 'NA',
  WALLET_NETWORK_UNSYNC = 'WNU',
}

export enum SystemNotice {
  LOSS_EVENT_DETECTED = 'LED',
  AUDIT_NOTICE = 'AN',
}

export enum FunctionName {
  APPROVE = 'Approve',
  BUY_POLICY = 'BuyPolicy',
  CANCEL_POLICY = 'CancelPolicy',
  DEPOSIT_ETH = 'DepositEth',
  DEPOSIT_CP = 'DepositCp',
  DEPOSIT_LP_SIGNED = 'DepositLpSigned',
  EXTEND_POLICY_PERIOD = 'ExtendPolicy',
  UPDATE_POLICY_AMOUNT = 'UpdateCoverAmount',
  UPDATE_POLICY = 'UpdatePolicy',
  SUBMIT_CLAIM = 'SubmitClaim',
  WITHDRAW_ETH = 'WithdrawEth',
  WITHDRAW_CP = 'WithdrawCp',
  WITHDRAW_LP = 'WithdrawLp',
  WITHDRAW_CLAIMS_PAYOUT = 'WithdrawClaimsPayout',
  WITHDRAW_REWARDS = 'WithdrawRewards',
  MULTI_CALL = 'Multicall',
  START_COOLDOWN = 'StartCooldown',
  STOP_COOLDOWN = 'StopCooldown',

  // TODO: include in transaction history retrieval
  EXERCISE_OPTION = 'ExerciseOption',
  FARM_OPTION_MULTI = 'FarmOptionMulti',

  STAKE = 'StakeSigned',
  UNSTAKE = 'Unstake',
  BOND_DEPOSIT_WETH = 'DepositWeth',
  BOND_DEPOSIT_ERC20 = 'Deposit',
  BOND_REDEEM = 'Redeem',

  REWARDS_DEPOSIT = 'DepositSigned',
  REWARDS_REDEEM = 'RedeemRewards',
}

export enum ExplorerscanApi {
  TX = 'tx',
  BLOCK = 'block',
  ADDRESS = 'address',
}

export enum Unit {
  ETH = 'ETH',
  MATIC = 'MATIC',
  SCP = 'CP Token',
  SOLACE = 'SOLACE',
  X_SOLACE = 'xSolace',
  LP = 'LP Token',
  POLICY = 'Policy',
  CLAIM = 'Claim',
  BOND = 'Bond',
  _ = 'Unknown',
}

export enum PolicyState {
  ACTIVE = 'Active',
  EXPIRED = 'Expired',
}

export enum ProductName {
  AAVE = 'Aave',
  COMPOUND = 'Compound',
  CURVE = 'Curve',
  LIQUITY = 'Liquity',
  SUSHISWAP = 'Sushiswap',
  UNISWAP_V2 = 'UniswapV2',
  UNISWAP_V3 = 'UniswapV3',
  WAAVE = 'Waave',
  YEARN = 'Yearn',
}

export enum PositionType {
  TOKEN = 'token',
  LQTY = 'liquity',
  OTHER = 'other',
}

export enum BondName {
  DAI = 'DAI',
  SOLACE_DAI_SLP = 'SOLACE-DAI SLP',
  ETH = 'ETH',
  WETH = 'WETH',
  SOLACE_ETH_SLP = 'SOLACE-ETH SLP',
  USDC = 'USDC',
  SOLACE_USDC_SLP = 'SOLACE-USDC SLP',
  SCP = 'SCP',
  WBTC = 'WBTC',
  USDT = 'USDT',
}
