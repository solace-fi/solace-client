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

  // UWP Lock Voting
  VOTE = 'Vote',
  VOTE_MULTIPLE = 'VoteMultiple',
  REMOVE_VOTE = 'RemoveVote',
  REMOVE_VOTE_MULTIPLE = 'RemoveVoteMultiple',
  SET_DELEGATE = 'SetDelegate',

  // UWP Locker
  // CREATE_LOCK = 'CreateLock', // duplicate
  INCREASE_AMOUNT = 'IncreaseAmount',
  INCREASE_AMOUNT_MULTIPLE = 'IncreaseAmountMultiple',
  // EXTEND_LOCK = 'ExtendLock', // duplicate
  EXTEND_LOCK_MULTIPLE = 'ExtendLockMultiple',
  WITHDRAW_LOCK = 'Withdraw',
  WITHDRAW_LOCK_IN_PART = 'WithdrawInPart',
  WITHDRAW_LOCK_MULTIPLE = 'WithdrawMultiple',
  WITHDRAW_LOCK_IN_PART_MULTIPLE = 'WithdrawInPartMultiple',

  // DepositHelper
  DEPOSIT_AND_LOCK = 'DepositAndLock',
  DEPOSIT_INTO_LOCK = 'DepositIntoLock',

  // Bribes
  BRIBE_PROVIDE = 'ProvideBribes',
  BRIBE_VOTE = 'VoteForBribe',
  BRIBE_VOTE_MULTIPLE_BRIBES = 'VoteForMultipleBribes',
  BRIBE_VOTE_MULTIPLE_VOTERS = 'VoteForBribeForMultipleVoters',
  BRIBE_REMOVE_VOTE = 'RemoveVoteForBribe',
  BRIBE_REMOVE_VOTES_MULTIPLE_BRIBES = 'RemoveVotesForMultipleBribes',
  BRIBE_REMOVE_VOTES_MULTIPLE_VOTERS = 'RemoveVotesForBribeForMultipleVoters',
  BRIBE_CLAIM = 'ClaimBribes',
}
