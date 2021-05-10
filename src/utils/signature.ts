import { BigNumberish, constants, Signature, Contract, utils } from 'ethers'
import { splitSignature } from 'ethers/lib/utils'
import { ContextWallet } from '../context/Web3Manager'
import { ecsign } from 'ethereumjs-util'

export const PERMIT_TYPEHASH = utils.keccak256(
  utils.toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)')
)

// Gets the EIP712 domain separator
export function getDomainSeparator(name: string, contractAddress: string, chainId: number) {
  return utils.keccak256(
    utils.defaultAbiCoder.encode(
      ['bytes32', 'bytes32', 'bytes32', 'uint256', 'address'],
      [
        utils.keccak256(
          utils.toUtf8Bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')
        ),
        utils.keccak256(utils.toUtf8Bytes(name)),
        utils.keccak256(utils.toUtf8Bytes('1')),
        chainId,
        contractAddress,
      ]
    )
  )
}

export const sign = (digest: any, privateKey: any) => {
  return ecsign(Buffer.from(digest.slice(2), 'hex'), privateKey)
}

// Returns the EIP712 hash which should be signed by the user
// in order to make a call to `permit`
export function getPermitDigest(
  name: string,
  address: string,
  chainId: number,
  approve: {
    owner: string
    spender: string
    value: BigNumberish
  },
  nonce: BigNumberish,
  deadline: BigNumberish
) {
  const DOMAIN_SEPARATOR = getDomainSeparator(name, address, chainId)
  return utils.keccak256(
    utils.solidityPack(
      ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
      [
        '0x19',
        '0x01',
        DOMAIN_SEPARATOR,
        utils.keccak256(
          utils.defaultAbiCoder.encode(
            ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'],
            [PERMIT_TYPEHASH, approve.owner, approve.spender, approve.value, nonce, deadline]
          )
        ),
      ]
    )
  )
}
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
