import { BigNumber, BigNumberish, constants, Signature, Contract } from 'ethers'
import { splitSignature } from 'ethers/lib/utils'
import { ContextWallet } from '../context/Web3Manager'

import { getProviderOrSigner } from '../utils'

//import { NonfungiblePositionManager } from '../../typechain'

export default async function getPermitNFTSignature(
  wallet: ContextWallet,
  positionManager: Contract, //NonfungiblePositionManager,
  spender: string,
  tokenId: BigNumberish,
  deadline: BigNumberish = constants.MaxUint256 //,
  //permitConfig?: { nonce?: BigNumberish; name?: string; chainId?: number; version?: string }
): Promise<Signature> {
  const [nonce, name, version, chainId] = await Promise.all([
    /*
    permitConfig?.nonce ?? positionManager.positions(tokenId).then((p:any) => p.nonce),
    permitConfig?.name ?? positionManager.name(),
    permitConfig?.version ?? '1',
    permitConfig?.chainId ?? wallet.getChainId(),
    */
    positionManager.positions(tokenId).then((p: any) => p.nonce),
    positionManager.name(),
    '1',
    wallet.networkId,
  ])

  return splitSignature(
    await wallet.library.getSigner(wallet.account)._signTypedData(
      {
        name,
        version,
        chainId,
        verifyingContract: positionManager.address,
      },
      {
        Permit: [
          {
            name: 'spender',
            type: 'address',
          },
          {
            name: 'tokenId',
            type: 'uint256',
          },
          {
            name: 'nonce',
            type: 'uint256',
          },
          {
            name: 'deadline',
            type: 'uint256',
          },
        ],
      },
      {
        owner: wallet.account,
        spender,
        tokenId,
        nonce,
        deadline,
      }
    )
  )
}
