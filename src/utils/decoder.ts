import { ethers } from 'ethers'
import masterABI from '../constants/abi/contracts/Master.sol/Master.json'
import registryABI from '../constants/abi/contracts/Registry.sol/Registry.json'
import solaceABI from '../constants/abi/contracts/SOLACE.sol/SOLACE.json'
import wethABI from '../constants/abi/contracts/mocks/WETH9.sol/WETH9.json'
import treasuryABI from '../constants/abi/contracts/Treasury.sol/Treasury.json'
import vaultABI from '../constants/abi/contracts/Vault.sol/Vault.json'
import cpFarmABI from '../constants/abi/contracts/CpFarm.sol/CpFarm.json'
import lpFarmABI from '../constants/abi/contracts/SolaceEthLpFarm.sol/SolaceEthLpFarm.json'
import lpTokenArtifact from '../../node_modules/@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import compAbi from '../constants/abi/contracts/products/CompoundProductRinkeby.sol/CompoundProductRinkeby.json'

import {
  SOLACE_CONTRACT_ADDRESS,
  WETH_CONTRACT_ADDRESS,
  MASTER_CONTRACT_ADDRESS,
  VAULT_CONTRACT_ADDRESS,
  CPFARM_CONTRACT_ADDRESS,
  UNISWAP_FACTORY_CONTRACT_ADDRESS,
  UNISWAP_ROUTER_CONTRACT_ADDRESS,
  UNISWAP_LPTOKEN_CONTRACT_ADDRESS,
  UNISWAP_POOL_CONTRACT_ADDRESS,
  LPFARM_CONTRACT_ADDRESS,
  TREASURY_CONTRACT_ADDRESS,
  REGISTRY_CONTRACT_ADDRESS,
  POLICY_MANAGER_CONTRACT_ADDRESS,
  COMPOUND_PRODUCT_CONTRACT_ADDRESS,
} from '../constants'

const getInterface = (toAddress: string) => {
  switch (toAddress) {
    case String(SOLACE_CONTRACT_ADDRESS).toLowerCase():
      return new ethers.utils.Interface(solaceABI)
    case String(WETH_CONTRACT_ADDRESS).toLowerCase():
      return new ethers.utils.Interface(wethABI)
    case String(VAULT_CONTRACT_ADDRESS).toLowerCase():
      return new ethers.utils.Interface(vaultABI)
    case String(CPFARM_CONTRACT_ADDRESS).toLowerCase():
      return new ethers.utils.Interface(cpFarmABI)
    case String(UNISWAP_LPTOKEN_CONTRACT_ADDRESS).toLowerCase():
      return new ethers.utils.Interface(lpTokenArtifact.abi)
    case String(LPFARM_CONTRACT_ADDRESS).toLowerCase():
      return new ethers.utils.Interface(lpFarmABI)
    case String(TREASURY_CONTRACT_ADDRESS).toLowerCase():
      return new ethers.utils.Interface(treasuryABI)
    case String(REGISTRY_CONTRACT_ADDRESS).toLowerCase():
      return new ethers.utils.Interface(registryABI)
    case String(COMPOUND_PRODUCT_CONTRACT_ADDRESS).toLowerCase():
      return new ethers.utils.Interface(compAbi)
    case String(MASTER_CONTRACT_ADDRESS).toLowerCase():
    default:
      return new ethers.utils.Interface(masterABI)
  }
}

export const decodeInput = (tx: any) => {
  console.log(tx.to, tx.input, tx.value)
  const inter = getInterface(tx.to)
  const decodedInput = inter.parseTransaction({ data: tx.input, value: tx.value })
  const function_name = decodedInput.name.charAt(0).toUpperCase() + decodedInput.name.slice(1)
  return {
    function_name,
  }
}
