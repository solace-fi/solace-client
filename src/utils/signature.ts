import { BigNumberish, constants, Signature, Contract, BigNumber } from 'ethers'
import { splitSignature } from 'ethers/lib/utils'

// should be used on Uniswap V3 NFTs
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

// should be used on Solace NFTs
export async function getPermitErc721EnhancedSignature(
  account: string,
  chainId: number,
  library: any,
  contract: Contract, // ClaimsEscrow, OptionsFarming, or PolicyManager
  spender: string,
  tokenID: BigNumberish,
  deadline: BigNumberish = constants.MaxUint256,
  nonce: BigNumberish = constants.MaxUint256 // optional override. leave empty to use correct nonce
): Promise<Signature> {
  // get nonce if not given
  let nonceBN = BigNumber.from(nonce)
  if (nonceBN.eq(constants.MaxUint256)) {
    nonceBN = await contract.nonces(tokenID)
  }
  // get other vars
  const [name, version] = await Promise.all([contract.name(), '1'])
  // split v, r, s
  return splitSignature(
    // sign message
    await library.getSigner(account)._signTypedData(
      {
        name,
        version,
        chainId,
        verifyingContract: contract.address,
      },
      {
        Permit: [
          { name: 'spender', type: 'address' },
          { name: 'tokenID', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      {
        owner: account,
        spender,
        tokenID,
        nonce: nonceBN,
        deadline,
      }
    )
  )
}

// staking
export async function getXSolaceStakeSignature(
  account: string,
  chainId: number,
  library: any,
  solace: Contract,
  xsolace: Contract,
  amount: BigNumberish,
  deadline: BigNumberish = constants.MaxUint256,
  nonce: BigNumberish = constants.MaxUint256 // optional override. leave empty to use correct nonce
): Promise<Signature> {
  // get nonce if not given
  let nonceBN = BigNumber.from(nonce)
  if (nonceBN.eq(constants.MaxUint256)) {
    nonceBN = await solace.nonces(account)
  }
  // get other vars
  const [name, version] = await Promise.all([solace.name(), '1'])
  // split v, r, s
  return splitSignature(
    // sign message
    await library.getSigner(account)._signTypedData(
      {
        name,
        version,
        chainId,
        verifyingContract: solace.address,
      },
      {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      {
        owner: account,
        spender: xsolace.address,
        value: amount,
        nonce: nonceBN,
        deadline: deadline,
      }
    )
  )
}

export async function getBondTellerDepositSignature(
  account: string,
  chainId: number,
  library: any,
  teller: Contract,
  principal: Contract,
  amount: BigNumberish,
  deadline: BigNumberish = constants.MaxUint256,
  nonce: BigNumberish = constants.MaxUint256 // optional override. leave empty to use correct nonce
): Promise<Signature> {
  // get nonce if not given
  let nonceBN = BigNumber.from(nonce)
  if (nonceBN.eq(constants.MaxUint256)) {
    nonceBN = await principal.nonces(account)
  }
  // get other vars
  const [name, version] = await Promise.all([principal.name(), '1'])
  // split v, r, s
  return splitSignature(
    // sign message
    await library.getSigner(account)._signTypedData(
      {
        name,
        version,
        chainId,
        verifyingContract: principal.address,
      },
      {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      {
        owner: account,
        spender: teller.address,
        value: amount,
        nonce: nonceBN,
        deadline: deadline,
      }
    )
  )
}
