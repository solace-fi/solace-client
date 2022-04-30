import { TransactionResponse } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { GAS_LIMIT, ZERO } from '../../constants'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { LocalTx } from '../../constants/types'
import { useNetwork } from '../../context/NetworkManager'
import { withBackoffRetries } from '../../utils/time'
import { useGetContract } from '../contract/useContract'
import { useGetFunctionGas } from '../provider/useGas'

export const useBridge = () => {
  const { activeNetwork } = useNetwork()
  const { account } = useWeb3React()
  const specialContracts = useMemo(() => activeNetwork.config.specialContracts, [activeNetwork])
  const bSolace = useGetContract(specialContracts.bSolace)
  const bridgeWrapper = useGetContract(specialContracts.bridgeWrapper)
  const { gasConfig } = useGetFunctionGas()

  const getUserBridgeBalance = async () => {
    if (!bSolace || !account) return ZERO
    try {
      const balance = await withBackoffRetries(async () => bSolace.balanceOf(account))
      return balance
    } catch (err) {
      console.log('error getUserBridgeBalance ', account, err)
      return ZERO
    }
  }

  const getBridgeLiquidity = async () => {
    if (!bSolace || !bridgeWrapper) return ZERO
    try {
      const liquidity = await withBackoffRetries(async () => bSolace.balanceOf(bridgeWrapper.address))
      return liquidity
    } catch (err) {
      console.log('error getBridgeLiquidity', err)
      return ZERO
    }
  }

  const bSolaceToSolace = async (amount: BigNumber) => {
    if (!bridgeWrapper || !account) return { tx: null, localTx: null }
    const estGas = await bridgeWrapper.estimateGas.bsolaceToSolace(amount, account)
    console.log('bridgeWrapper.estimateGas.bsolaceToSolace', estGas.toString())
    const tx: TransactionResponse = await bridgeWrapper.bsolaceToSolace(amount, account, {
      ...gasConfig,
      // gasLimit: GAS_LIMIT,
      gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.BRIDGE_BSOLACE_TO_SOLACE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const solaceToBSolace = async (amount: BigNumber) => {
    if (!bridgeWrapper || !account) return { tx: null, localTx: null }
    const estGas = await bridgeWrapper.estimateGas.solaceToBSolace(amount, account)
    console.log('bridgeWrapper.estimateGas.solaceToBSolace', estGas.toString())
    const tx: TransactionResponse = await bridgeWrapper.solaceToBSolace(amount, account, {
      ...gasConfig,
      // gasLimit: GAS_LIMIT,
      gasLimit: Math.floor(parseInt(estGas.toString()) * 1.5),
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.BRIDGE_SOLACE_TO_BSOLACE,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return { bSolace, bridgeWrapper, getUserBridgeBalance, getBridgeLiquidity, bSolaceToSolace, solaceToBSolace }
}
