export enum TransactionCondition {
  SUCCESS = 'Complete',
  FAILURE = 'Incomplete',
  PENDING = 'Pending',
  CANCELLED = 'Cancelled',
}

export enum Error {
  NETWORK = 'network',
}

export enum FunctionName {
  APPROVE = 'Approve',
  BUY_POLICY = 'BuyPolicy',
  CANCEL_POLICY = 'CancelPolicy',
  DEPOSIT = 'Deposit',
  DEPOSIT_CP = 'DepositCp',
  DEPOSIT_ETH = 'DepositEth',
  DEPOSIT_LP = 'DepositLp',
  EXTEND_POLICY = 'ExtendPolicy',
  SUBMIT_CLAIM = 'SubmitClaim',
  WITHDRAW = 'Withdraw',
  WITHDRAW_ETH = 'WithdrawEth',
  WITHDRAW_LP = 'WithdrawLp',
  WITHDRAW_PAYOUT = 'WithdrawPayout',
  WITHDRAW_REWARDS = 'WithdrawRewards',
}

export enum Unit {
  ETH = 'ETH',
  SCP = 'Solace CP Token',
  SOLACE = 'SOLACE',
  LP = 'LP',
  ID = 'ID',
}

export enum PolicyStatus {
  ACTIVE = 'Active',
  EXPIRED = 'Expired',
}
