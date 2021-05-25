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
} from '../constants'

const masterInter = new ethers.utils.Interface(masterABI)
const registryInter = new ethers.utils.Interface(registryABI)
const solaceInter = new ethers.utils.Interface(solaceABI)
const wethInter = new ethers.utils.Interface(wethABI)
const treasuryInter = new ethers.utils.Interface(treasuryABI)
const vaultInter = new ethers.utils.Interface(vaultABI)
const cpFarmInter = new ethers.utils.Interface(cpFarmABI)
const lpFarmInter = new ethers.utils.Interface(lpFarmABI)
const lpTokenInter = new ethers.utils.Interface(lpTokenArtifact.abi)

export const decodeInput = (tx: any) => {
  let inter
  switch (tx.to) {
    case String(SOLACE_CONTRACT_ADDRESS).toLowerCase():
      inter = solaceInter
      break
    case String(WETH_CONTRACT_ADDRESS).toLowerCase():
      inter = wethInter
      break
    case String(VAULT_CONTRACT_ADDRESS).toLowerCase():
      inter = vaultInter
      break
    case String(CPFARM_CONTRACT_ADDRESS).toLowerCase():
      inter = cpFarmInter
      break
    case String(UNISWAP_LPTOKEN_CONTRACT_ADDRESS).toLowerCase():
      inter = lpTokenInter
      break
    case String(LPFARM_CONTRACT_ADDRESS).toLowerCase():
      inter = lpFarmInter
      break
    case String(TREASURY_CONTRACT_ADDRESS).toLowerCase():
      inter = treasuryInter
      break
    case String(REGISTRY_CONTRACT_ADDRESS).toLowerCase():
      inter = registryInter
      break
    case String(MASTER_CONTRACT_ADDRESS).toLowerCase():
    default:
      inter = masterInter
  }
  const decodedInput = inter.parseTransaction({ data: tx.input, value: tx.value })
  return {
    function_name: decodedInput.name.charAt(0).toUpperCase() + decodedInput.name.slice(1),
  }
}
