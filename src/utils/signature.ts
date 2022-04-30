import { JsonRpcSigner } from '@ethersproject/providers'
import { BigNumberish, constants, Signature, Contract, BigNumber } from 'ethers'
import { splitSignature } from 'ethers/lib/utils'

// should be used on Solace NFTs
export async function getPermitErc721EnhancedSignature(
  account: string,
  chainId: number,
  signer: JsonRpcSigner,
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
    await signer._signTypedData(
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

export async function getPermitErc20Signature(
  account: string,
  chainId: number,
  signer: JsonRpcSigner,
  spender: string,
  token: Contract,
  amount: BigNumberish,
  deadline: BigNumberish = constants.MaxUint256,
  nonce: BigNumberish = constants.MaxUint256 // optional override. leave empty to use correct nonce
): Promise<Signature> {
  // get nonce if not given
  let nonceBN = BigNumber.from(nonce)
  if (nonceBN.eq(constants.MaxUint256)) {
    nonceBN = await token.nonces(account)
  }
  // get other vars
  const [name, version] = await Promise.all([token.name(), '1'])
  // split v, r, s
  return splitSignature(
    // sign message
    await signer._signTypedData(
      {
        name,
        version,
        chainId,
        verifyingContract: token.address,
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
        spender: spender,
        value: amount,
        nonce: nonceBN,
        deadline: deadline,
      }
    )
  )
}
