export enum FunctionName {
  APPROVE = 'Approve',

  // UWP Lock Voting
  VOTE = 'Vote',
  VOTE_MULTIPLE = 'VoteMultiple',
  REMOVE_VOTE = 'RemoveVote',
  REMOVE_VOTE_MULTIPLE = 'RemoveVoteMultiple',
  SET_DELEGATE = 'SetDelegate',

  // UWP Locker
  CREATE_LOCK = 'CreateLock',
  INCREASE_AMOUNT = 'IncreaseAmount',
  INCREASE_AMOUNT_MULTIPLE = 'IncreaseAmountMultiple',
  EXTEND_LOCK = 'ExtendLock',
  EXTEND_LOCK_MULTIPLE = 'ExtendLockMultiple',
  WITHDRAW_LOCK = 'Withdraw',
  WITHDRAW_LOCK_IN_PART = 'WithdrawInPart',
  WITHDRAW_LOCK_MULTIPLE = 'WithdrawMultiple',
  WITHDRAW_LOCK_IN_PART_MULTIPLE = 'WithdrawInPartMultiple',

  // DepositHelper
  DEPOSIT_AND_LOCK = 'DepositAndLock',
  DEPOSIT_INTO_LOCK = 'DepositIntoLock',

  // Bribes
  BRIBE_PROVIDE = 'provideBribes',
  BRIBE_VOTE = 'voteForBribe',
  BRIBE_VOTE_MULTIPLE_BRIBES = 'voteForMultipleBribes',
  BRIBE_VOTE_MULTIPLE_VOTERS = 'voteForBribeForMultipleVoters',
  BRIBE_REMOVE_VOTE = 'removeVoteForBribe',
  BRIBE_REMOVE_VOTES_MULTIPLE_BRIBES = 'removeVotesForMultipleBribes',
  BRIBE_REMOVE_VOTES_MULTIPLE_VOTERS = 'removeVotesForBribeForMultipleVoters',
  BRIBE_CLAIM = 'claimBribes',
}
