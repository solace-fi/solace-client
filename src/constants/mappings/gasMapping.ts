import { FunctionName } from '../enums'

export const FunctionGasLimits: { [key: string]: number } = {
  ['claimsEscrow.withdrawClaimsPayout']: 150000,
  ['selectedProtocol.updatePolicy']: 230032,
  ['selectedProtocol.updateCoverAmount']: 224602,
  ['selectedProtocol.extendPolicy']: 158884,
  ['selectedProtocol.cancelPolicy']: 208993,
  ['farmController.farmOptionMulti']: 834261,
  ['tellerErc20.deposit']: 664165,
  ['tellerEth.depositEth']: 608016,
  ['tellerEth.depositWeth']: 664339,
  ['teller.redeem']: 171085,
  ['cpFarm.depositEth']: 243022,
  ['cpFarm.depositCp']: 189538,
  ['cpFarm.withdrawCp']: 189538,
  ['optionsFarming.exerciseOption']: 161379,
  ['vault.depositEth']: 126777,
  ['vault.withdrawEth']: 123823,
  ['xSolace.stakeSigned']: 143344,
  ['xSolace.unstake']: 113443,
  ['farmRewards.redeem']: 587271,
  ['stakingRewards.compoundLock']: 255664,
  ['stakingRewards.compoundLocks']: 278677,
  ['stakingRewards.harvestLock']: 213063,
  ['stakingRewards.harvestLocks']: 233061,
  ['xsLocker.createLockSigned']: 560597,
  ['xsLocker.increaseAmountSigned']: 202431,
  ['xsLocker.extendLock']: 189006,
  ['xsLocker.withdrawInPart']: 151213,
  ['xsLocker.withdrawMany']: 293442,
  ['xsLocker.withdraw']: 365209,
  ['xSolaceMigrator.migrateSigned']: 600000,
}

// this function is used in operations that determine max amount to send if the same currency being sent is also used as gas
export const getNameToFunctionGasLimit = (functionName: FunctionName, cond?: string): number => {
  switch (functionName) {
    case FunctionName.WITHDRAW_CLAIMS_PAYOUT:
      return FunctionGasLimits['claimsEscrow.withdrawClaimsPayout']
    case FunctionName.UPDATE_POLICY:
      return FunctionGasLimits['selectedProtocol.updatePolicy']
    case FunctionName.UPDATE_POLICY_AMOUNT:
      return FunctionGasLimits['selectedProtocol.updateCoverAmount']
    case FunctionName.EXTEND_POLICY_PERIOD:
      return FunctionGasLimits['selectedProtocol.extendPolicy']
    case FunctionName.CANCEL_POLICY:
      return FunctionGasLimits['selectedProtocol.cancelPolicy']
    case FunctionName.FARM_OPTION_MULTI:
      return FunctionGasLimits['farmController.farmOptionMulti']
    case FunctionName.BOND_DEPOSIT_ERC20:
      return FunctionGasLimits['tellerErc20.deposit']
    case FunctionName.DEPOSIT_ETH:
      if (!cond) return FunctionGasLimits['tellerEth.depositEth'] // by default, return teller variant of depositEth
      if (cond == 'vault') return FunctionGasLimits['vault.depositEth']
      else return FunctionGasLimits['cpFarm.depositEth']
    case FunctionName.BOND_DEPOSIT_WETH:
      return FunctionGasLimits['tellerEth.depositWeth']
    case FunctionName.BOND_REDEEM:
      return FunctionGasLimits['tellerEth.redeem']
    case FunctionName.DEPOSIT_CP:
      return FunctionGasLimits['cpFarm.depositCp']
    case FunctionName.WITHDRAW_CP:
      return FunctionGasLimits['cpFarm.withdrawCp']
    case FunctionName.EXERCISE_OPTION:
      return FunctionGasLimits['optionsFarming.exerciseOption']
    case FunctionName.WITHDRAW_ETH:
      return FunctionGasLimits['vault.withdrawEth']
    case FunctionName.STAKE_V1:
      return FunctionGasLimits['xSolace.stakeSigned']
    case FunctionName.UNSTAKE_V1:
    default:
      return FunctionGasLimits['xSolace.unstake']
  }
}
