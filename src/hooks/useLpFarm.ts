import { BigNumber } from 'ethers'
import { DEADLINE, GAS_LIMIT } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { LocalTx } from '../constants/types'
import { useContracts } from '../context/ContractsManager'
import { useNetwork } from '../context/NetworkManager'
import { useWallet } from '../context/WalletManager'
import getPermitNFTSignature from '../utils/signature'

export const useLpFarm = () => {
  const { lpFarm, lpToken } = useContracts()
  const { account, library } = useWallet()
  const { chainId } = useNetwork()

  const depositLp = async (
    nftId: BigNumber,
    gasConfig: any
  ): Promise<
    | {
        tx: null
        localTx: null
      }
    | {
        tx: any
        localTx: LocalTx
      }
  > => {
    if (!lpToken || !lpFarm || !nftId || !chainId || !account || !library) return { tx: null, localTx: null }
    const { v, r, s } = await getPermitNFTSignature(account, chainId, library, lpToken, lpFarm.address, nftId, DEADLINE)
    const tx = await lpFarm.depositLpSigned(account, nftId, DEADLINE, v, r, s, {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.DEPOSIT_LP_SIGNED,
      value: `#${nftId.toString()}`,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const withdrawLp = async (
    nftId: BigNumber,
    gasConfig: any
  ): Promise<
    | {
        tx: null
        localTx: null
      }
    | {
        tx: any
        localTx: LocalTx
      }
  > => {
    if (!lpFarm) return { tx: null, localTx: null }
    const tx = await lpFarm.withdrawLp(nftId, {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.WITHDRAW_LP,
      value: `#${nftId.toString()}`,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return { depositLp, withdrawLp }
}
