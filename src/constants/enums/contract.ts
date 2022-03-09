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
  SOTERIA_UPDATE_LIMIT = 'UpdateCoverLimit',
  SOTERIA_UPDATE_CHAINS = 'UpdatePolicyChainInfo',
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
