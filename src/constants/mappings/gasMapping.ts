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
  ['farmRewards.redeem']: 206305,
}

export const getNameToFunctionGasLimit = (functionName: FunctionName, cond?: string): number => {
  const gasLimitMap = FunctionGasLimits
  switch (functionName) {
    case FunctionName.WITHDRAW_CLAIMS_PAYOUT:
      return gasLimitMap['claimsEscrow.withdrawClaimsPayout']
    case FunctionName.UPDATE_POLICY:
      return gasLimitMap['selectedProtocol.updatePolicy']
    case FunctionName.UPDATE_POLICY_AMOUNT:
      return gasLimitMap['selectedProtocol.updateCoverAmount']
    case FunctionName.EXTEND_POLICY_PERIOD:
      return gasLimitMap['selectedProtocol.extendPolicy']
    case FunctionName.CANCEL_POLICY:
      return gasLimitMap['selectedProtocol.cancelPolicy']
    case FunctionName.FARM_OPTION_MULTI:
      return gasLimitMap['farmController.farmOptionMulti']
    case FunctionName.BOND_DEPOSIT_ERC20:
      return gasLimitMap['tellerErc20.deposit']
    case FunctionName.DEPOSIT_ETH:
      if (!cond) return gasLimitMap['tellerEth.depositEth'] // by default, return teller variant of depositEth
      if (cond == 'vault') return gasLimitMap['vault.depositEth']
      else return gasLimitMap['cpFarm.depositEth']
    case FunctionName.BOND_DEPOSIT_WETH:
      return gasLimitMap['tellerEth.depositWeth']
    case FunctionName.BOND_REDEEM:
      return gasLimitMap['tellerEth.redeem']
    case FunctionName.DEPOSIT_CP:
      return gasLimitMap['cpFarm.depositCp']
    case FunctionName.WITHDRAW_CP:
      return gasLimitMap['cpFarm.withdrawCp']
    case FunctionName.EXERCISE_OPTION:
      return gasLimitMap['optionsFarming.exerciseOption']
    case FunctionName.WITHDRAW_ETH:
      return gasLimitMap['vault.withdrawEth']
    case FunctionName.STAKE_V1:
      return gasLimitMap['xSolace.stakeSigned']
    case FunctionName.UNSTAKE_V1:
    default:
      return gasLimitMap['xSolace.unstake']
  }
}
