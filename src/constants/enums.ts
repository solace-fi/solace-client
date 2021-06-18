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
  DEPOSIT = 'Deposit',
  DEPOSIT_ETH = 'DepositEth',
  DEPOSIT_CP = 'DepositCp',
  WITHDRAW = 'Withdraw',
  WITHDRAW_ETH = 'WithdrawEth',
  DEPOSIT_LP = 'DepositLp',
  WITHDRAW_LP = 'WithdrawLp',
  WITHDRAW_REWARDS = 'WithdrawRewards',
  APPROVE = 'Approve',
  BUY_POLICY = 'BuyPolicy',
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
