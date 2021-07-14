import masterABI from '../constants/abi/contracts/Master.sol/Master.json'
import registryABI from '../constants/abi/contracts/Registry.sol/Registry.json'
import solaceABI from '../constants/abi/contracts/SOLACE.sol/SOLACE.json'
import wethABI from '../constants/abi/contracts/mocks/WETH9.sol/WETH9.json'
import treasuryABI from '../constants/abi/contracts/Treasury.sol/Treasury.json'
import vaultABI from '../constants/abi/contracts/Vault.sol/Vault.json'
import cpFarmABI from '../constants/abi/contracts/CpFarm.sol/CpFarm.json'
import lpFarmABI from '../constants/abi/contracts/SolaceEthLpFarm.sol/SolaceEthLpFarm.json'
import claimsEscrowABI from '../constants/abi/contracts/ClaimsEscrow.sol/ClaimsEscrow.json'
import lpTokenArtifact from '../../node_modules/@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import compAbi from '../constants/abi/contracts/products/CompoundProductRinkeby.sol/CompoundProductRinkeby.json'
import polMagABI from '../constants/abi/contracts/PolicyManager.sol/PolicyManager.json'

export const contractConfig: any = {
  '4': {
    keyContracts: {
      master: {
        addr: '0xA5B8d9924413151e93228Dd5f934ff147911CA95',
        abi: masterABI,
      },
      vault: {
        addr: '0xBad5C0743d2a272A7F9060761d8D2Ff86Bde05d5',
        abi: vaultABI,
      },
      solace: {
        addr: '0x44B843794416911630e74bAB05021458122c40A0',
        abi: solaceABI,
      },
      cpFarm: {
        addr: '0x9145E907175Dfc3Aa14b982E5715e8A6F31c2f9c',
        abi: cpFarmABI,
      },
      lpFarm: {
        addr: '0x530311825798ac952E97CECF72728aCecB0746c4',
        abi: lpFarmABI,
      },
      registry: {
        addr: '0x81c81AB3Ad5DD898B6ED864F6E29e4F031Bd8868',
        abi: registryABI,
      },
      lpToken: {
        addr: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
        abi: lpTokenArtifact.abi,
      },
      weth: {
        addr: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
        abi: wethABI,
      },
      claimsEscrow: {
        addr: '0x9a6D1bDfCbae96034bEb7f6f747B2A3461ffB960',
        abi: claimsEscrowABI,
      },
      policyManager: {
        addr: '0x1d17Fba6f0472Bf3B73C8d60475002405B6a1008',
        abi: polMagABI,
      },
    },
    productContracts: {
      comp: {
        addr: '0x57149Ad6B4c3051023CF46b3978692936C49154E',
        abi: compAbi,
      },
    },
    supportedProducts: [{ name: 'Compound', id: 'comp', contract: null, signer: false }],
  },
}
