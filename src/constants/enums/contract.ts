export enum FunctionName {
  APPROVE = 'Approve',

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
  HARVEST_LOCK_FOR_SCP = 'HarvestLockForScp',
  HARVEST_LOCKS_FOR_SCP = 'HarvestLocksForScp',
  COMPOUND_LOCK = 'CompoundLock',
  COMPOUND_LOCKS = 'CompoundLocks',

  // coverage v3
  COVER_PURCHASE_WITH_STABLE = 'PurchaseWithStable',
  COVER_PURCHASE_WITH_NON_STABLE = 'PurchaseWithNonStable',
  COVER_DEPOSIT_STABLE = 'DepositStable',
  COVER_DEPOSIT_NON_STABLE = 'DepositNonStable',
  COVER_PURCHASE = 'Purchase',
  COVER_CANCEL = 'Cancel',
  COVER_WITHDRAW = 'Withdraw',

  // bond tellers v2
  BOND_DEPOSIT_WMATIC = 'DepositWmatic',
  BOND_DEPOSIT_MATIC = 'DepositMatic',
  BOND_DEPOSIT_WFTM = 'DepositWftm',
  BOND_DEPOSIT_FTM = 'DepositFtm',
  BOND_DEPOSIT_WETH_V2 = 'DepositWeth',
  BOND_DEPOSIT_ETH_V2 = 'DepositEth',
  BOND_DEPOSIT_ERC20_V2 = 'Deposit',
  BOND_CLAIM_PAYOUT_V2 = 'ClaimPayout',

  // bridge
  BRIDGE_BSOLACE_TO_SOLACE = 'BSolaceToSolace',
  BRIDGE_SOLACE_TO_BSOLACE = 'SolaceToBSolace',

  // legacy
  STAKE_V1 = 'StakeSigned',
  UNSTAKE_V1 = 'Unstake',
}
