import comp4 from './positionGetters/compoundPositionGetter/rinkeby/tokens.json'
import { POLICY_MANAGER_CONTRACT_ADDRESS } from '../constants/index'
import policyManagerAbi from '../constants/abi/contracts/PolicyManager.sol/PolicyManager.json'

export const getPoliciesConfig: any = {
  '4': {
    policyManagerAddr: POLICY_MANAGER_CONTRACT_ADDRESS,
    policyManagerAbi: policyManagerAbi,
    products: {
      compound: '0x8F0095A52f9783360177bc43aE61E01BB7630920',
    },
    productsRev: {
      '0x8F0095A52f9783360177bc43aE61E01BB7630920': 'Compound',
    },
    tokens: comp4,
    initialized: false,
  },
}
