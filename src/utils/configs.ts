import comp4 from './positionGetters/compoundPositionGetter/rinkeby/tokens.json'
import { POLICY_MANAGER_CONTRACT_ADDRESS } from '../constants/index'
import policyManagerAbi from '../constants/abi/contracts/PolicyManager.sol/PolicyManager.json'

export const getPoliciesConfig: any = {
  '4': {
    policyManagerAddr: POLICY_MANAGER_CONTRACT_ADDRESS,
    policyManagerAbi: policyManagerAbi,
    products: {
      compound: '0x57149Ad6B4c3051023CF46b3978692936C49154E',
    },
    productsRev: {
      '0x57149Ad6B4c3051023CF46b3978692936C49154E': 'Compound',
    },
    tokens: comp4,
    initialized: false,
  },
}
