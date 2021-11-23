import { BigNumber } from 'ethers'
import { useEffect, useState } from 'react'
import { BondTellerDetails, GasConfiguration, LocalTx, TxResult } from '../constants/types'
import { useContracts } from '../context/ContractsManager'
import { getContract } from '../utils'

import ierc20Json from '../constants/metadata/IERC20Metadata.json'
import sushiswapLpAbi from '../constants/metadata/ISushiswapMetadataAlt.json'
import weth9 from '../constants/abi/contracts/WETH9.sol/WETH9.json'
import { useWallet } from '../context/WalletManager'
import { formatUnits } from '@ethersproject/units'
import { GAS_LIMIT } from '../constants'
import { FunctionName, TransactionCondition } from '../constants/enums'
import { queryDecimals, queryName, querySymbol } from '../utils/contract'
import { useCachedData } from '../context/CachedDataManager'

export const useBondTeller = (selectedBondDetail: BondTellerDetails | undefined) => {
  const deposit = async (
    parsedAmount: BigNumber,
    minAmountOut: BigNumber,
    recipient: string,
    stake: boolean,
    txVal: string,
    func: FunctionName,
    gasConfig: GasConfiguration
  ): Promise<TxResult> => {
    if (!selectedBondDetail) return { tx: null, localTx: null }
    const tx =
      func == FunctionName.BOND_DEPOSIT_ERC20
        ? await selectedBondDetail.tellerData.teller.contract.deposit(parsedAmount, minAmountOut, recipient, stake, {
            ...gasConfig,
            gasLimit: GAS_LIMIT,
          })
        : func == FunctionName.DEPOSIT_ETH
        ? await selectedBondDetail.tellerData.teller.contract.depositEth(minAmountOut, recipient, stake, {
            value: parsedAmount,
            ...gasConfig,
            gasLimit: GAS_LIMIT,
          })
        : await selectedBondDetail.tellerData.teller.contract.depositWeth(
            parsedAmount,
            minAmountOut,
            recipient,
            stake,
            {
              ...gasConfig,
              gasLimit: GAS_LIMIT,
            }
          )
    const localTx: LocalTx = {
      hash: tx.hash,
      type: func,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  const redeem = async (bondId: BigNumber, txVal: string, gasConfig: GasConfiguration): Promise<TxResult> => {
    if (!selectedBondDetail) return { tx: null, localTx: null }
    console.log(bondId)
    const tx = await selectedBondDetail.tellerData.teller.contract.redeem(bondId, {
      ...gasConfig,
      gasLimit: GAS_LIMIT,
    })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.BOND_REDEEM,
      value: txVal,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }

  return { deposit, redeem }
}

export const useBondTellerDetails = () => {
  const { library, account } = useWallet()
  const { latestBlock, version } = useCachedData()
  const { tellers } = useContracts()
  const [tellerDetails, setTellerDetails] = useState<BondTellerDetails[]>([])

  useEffect(() => {
    const getBondTellerDetails = async () => {
      if (!library) return
      try {
        const tellerDetails = await Promise.all(
          tellers.map(async (teller) => {
            const [principal, bondPrice, vestingTermInSeconds, capacity, maxPayout, stakeFeeBps] = await Promise.all([
              teller.contract.principal(),
              teller.contract.bondPrice(),
              teller.contract.vestingTerm(),
              teller.contract.capacity(),
              teller.contract.maxPayout(),
              teller.contract.stakeFeeBps(),
            ])
            const principalContract = getContract(
              principal,
              teller.isLp ? sushiswapLpAbi : teller.isBondTellerErc20 ? ierc20Json.abi : weth9,
              library,
              account ?? undefined
            )
            const [decimals, name, symbol] = await Promise.all([
              queryDecimals(principalContract),
              queryName(principalContract, library),
              querySymbol(principalContract, library),
            ])
            let lpData = {}
            if (teller.isLp) {
              const [token0, token1] = await Promise.all([principalContract.token0(), principalContract.token1()])
              lpData = {
                token0,
                token1,
              }
            }
            const tellerDetail: BondTellerDetails = {
              tellerData: {
                teller,
                bondPrice: formatUnits(bondPrice, decimals),
                vestingTermInSeconds: vestingTermInSeconds.toNumber(),
                capacity,
                maxPayout,
                stakeFeeBps,
              },
              principalData: {
                principal: principalContract,
                principalProps: {
                  symbol,
                  decimals,
                  name,
                },
                ...lpData,
              },
            }
            return tellerDetail
          })
        )
        setTellerDetails(tellerDetails)
      } catch (err) {
        console.log('getBondTellerDetails', err)
      }
    }
    getBondTellerDetails()
  }, [tellers, account, latestBlock, version])

  return tellerDetails
}
