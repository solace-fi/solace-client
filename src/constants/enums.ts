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

  STAKING_MIGRATE = 'MigrateSigned',

  // xsLocker
  CREATE_LOCK = 'CreateLock',
  INCREASE_LOCK_AMOUNT = 'IncreaseAmount',
  EXTEND_LOCK = 'ExtendLock',
  WITHDRAW_FROM_LOCK = 'Withdraw',
  WITHDRAW_IN_PART_FROM_LOCK = 'WithdrawInPart',
  WITHDRAW_MANY_FROM_LOCK = 'WithdrawMany',

  // staking rewards
  HARVEST_LOCK = 'HarvestLock',
  HARVEST_LOCKS = 'HarvestLocks',
  COMPOUND_LOCK = 'CompoundLock',
  COMPOUND_LOCKS = 'CompoundLocks',

  // soteria
  SOTERIA_ACTIVATE = 'ActivatePolicy',
  SOTERIA_DEACTIVATE = 'DeactivatePolicy',
  SOTERIA_UPDATE = 'UpdateCoverLimit',
  SOTERIA_DEPOSIT = 'Deposit',
  SOTERIA_WITHDRAW = 'Withdraw',

  // bond tellers v2
  BOND_DEPOSIT_WMATIC = 'DepositWmatic',
  BOND_DEPOSIT_MATIC = 'DepositMatic',
  BOND_DEPOSIT_WETH_V2 = 'DepositWeth',
  BOND_DEPOSIT_ETH_V2 = 'DepositEth',
  BOND_DEPOSIT_ERC20_V2 = 'Deposit',
  BOND_CLAIM_PAYOUT_V2 = 'ClaimPayout',

  // bond tellers v1
  BOND_DEPOSIT_WETH_V1 = 'DepositWeth',
  BOND_DEPOSIT_ETH_V1 = 'DepositEth',
  BOND_DEPOSIT_ERC20_V1 = 'Deposit',
  BOND_REDEEM_V1 = 'Redeem',

  // bridge
  BRIDGE_BSOLACE_TO_SOLACE = 'BSolaceToSolace',
  BRIDGE_SOLACE_TO_BSOLACE = 'SolaceToBSolace',

  // early farmers
  REWARDS_REDEEM = 'Redeem',

  // legacy
  STAKE_V1 = 'StakeSigned',
  UNSTAKE_V1 = 'Unstake',

  // discontinued
  EXERCISE_OPTION = 'ExerciseOption',
  FARM_OPTION_MULTI = 'FarmOptionMulti',
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
  FRAX = 'FRAX',
  WMATIC = 'WMATIC',
  MATIC = 'MATIC',
  NEAR = 'NEAR',
  AURORA = 'AURORA',
}

export enum Tab {
  DEPOSIT,
  LOCK,
  WITHDRAW,
  REWARDS,
}
