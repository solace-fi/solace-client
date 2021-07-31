import { BigNumberish, constants, Signature, Contract } from 'ethers'
import { splitSignature } from 'ethers/lib/utils'

export default async function getPermitNFTSignature(
  account: string,
  chainId: number,
  library: any,
  positionManager: Contract, //NonfungiblePositionManager,
  spender: string,
  tokenId: BigNumberish,
  deadline: BigNumberish = constants.MaxUint256 //,
): Promise<Signature> {
  const [nonce, name, version] = await Promise.all([
    positionManager.positions(tokenId).then((p: any) => p.nonce),
    positionManager.name(),
    '1',
  ])

  return splitSignature(
    await library.getSigner(account)._signTypedData(
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
        owner: account,
        spender,
        tokenId,
        nonce,
        deadline,
      }
    )
  )
}
