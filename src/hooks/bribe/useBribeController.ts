import { ERC20_ABI, MulticallContract, MulticallProvider, ZERO } from '@solace-fi/sdk-nightly'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, Contract } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FunctionName, TransactionCondition } from '../../constants/enums'
import { Bribe, GaugeBribeInfo, LocalTx, ReadToken, TokenInfo, Vote, VoteForGauge } from '../../constants/types'
import { useContracts } from '../../context/ContractsManager'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { useVoteContext } from '../../pages/vote/VoteContext'
import { useGetFunctionGas } from '../provider/useGas'
import underwritingPoolABI from '../../constants/abi/UnderwritingPool.json'
import solaceMegaOracleABI from '../../constants/abi/SolaceMegaOracle.json'
import { multicallChunked } from '../../utils/contract'
import { formatUnits } from 'ethers/lib/utils'

export const useBribeController = () => {
  const { keyContracts } = useContracts()
  const { bribeController } = useMemo(() => keyContracts, [keyContracts])
  const { gasConfig } = useGetFunctionGas()

  const getEpochStartTimestamp = useCallback(async (): Promise<BigNumber> => {
    if (!bribeController) return ZERO
    try {
      const epochStartTimestamp = await bribeController.getEpochStartTimestamp()
      return epochStartTimestamp
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }, [bribeController])

  const getEpochEndTimestamp = useCallback(async (): Promise<BigNumber> => {
    if (!bribeController) return ZERO
    try {
      const epochEndTimestamp = await bribeController.getEpochEndTimestamp()
      return epochEndTimestamp
    } catch (error) {
      console.error(error)
      return ZERO
    }
  }, [bribeController])

  const getUnusedVotePowerBPS = useCallback(
    async (voter: string): Promise<BigNumber> => {
      if (!bribeController) return ZERO
      try {
        const unusedVotePowerBPS = await bribeController.getUnusedVotePowerBPS(voter)
        return unusedVotePowerBPS
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [bribeController]
  )

  const getAvailableVotePowerBPS = useCallback(
    async (voter: string): Promise<BigNumber> => {
      if (!bribeController) return ZERO
      try {
        const availableVotePowerBPS = await bribeController.getAvailableVotePowerBPS(voter)
        return availableVotePowerBPS
      } catch (error) {
        console.error(error)
        return ZERO
      }
    },
    [bribeController]
  )

  const getBribeTokenWhitelist = useCallback(async (): Promise<string[]> => {
    if (!bribeController) return []
    try {
      const bribeTokenWhitelist = await bribeController.getBribeTokenWhitelist()
      return bribeTokenWhitelist
    } catch (error) {
      console.error(error)
      return []
    }
  }, [bribeController])

  const getClaimableBribes = useCallback(
    async (voter: string): Promise<Bribe[]> => {
      if (!bribeController) return []
      try {
        const claimableBribes = await bribeController.getClaimableBribes(voter)
        return claimableBribes
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [bribeController]
  )

  const getAllGaugesWithBribe = useCallback(async (): Promise<BigNumber[]> => {
    if (!bribeController) return []
    try {
      const allGaugesWithBribe = await bribeController.getAllGaugesWithBribe()
      return allGaugesWithBribe
    } catch (error) {
      console.error(error)
      return []
    }
  }, [bribeController])

  const getProvidedBribesForGauge = useCallback(
    async (gaugeID: BigNumber): Promise<Bribe[]> => {
      if (!bribeController) return []
      try {
        const providedBribesForGauge = await bribeController.getProvidedBribesForGauge(gaugeID)
        return providedBribesForGauge
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [bribeController]
  )

  const getLifetimeProvidedBribes = useCallback(
    async (briber: string): Promise<Bribe[]> => {
      if (!bribeController) return []
      try {
        const lifetimeProvidedBribes = await bribeController.getLifetimeProvidedBribes(briber)
        return lifetimeProvidedBribes
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [bribeController]
  )

  const getVotesForVoter = useCallback(
    async (voter: string): Promise<Vote[]> => {
      if (!bribeController) return []
      try {
        const votesForVoter = await bribeController.getVotesForVoter(voter)
        return votesForVoter
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [bribeController]
  )

  const getVotesForGauge = useCallback(
    async (gaugeID: BigNumber): Promise<VoteForGauge[]> => {
      if (!bribeController) return []
      try {
        const votesForGauge = await bribeController.getVotesForGauge(gaugeID)
        return votesForGauge
      } catch (error) {
        console.error(error)
        return []
      }
    },
    [bribeController]
  )

  const isBribingOpen = useCallback(async (): Promise<boolean> => {
    if (!bribeController) return false
    try {
      const isBribingOpen = await bribeController.isBribingOpen()
      return isBribingOpen
    } catch (error) {
      console.error(error)
      return false
    }
  }, [bribeController])

  const provideBribes = useCallback(
    async (bribeTokens: string[], bribeAmounts: BigNumber[], gaugeID: BigNumber) => {
      if (!bribeController) return { tx: null, localTx: null }
      const tx = await bribeController.provideBribes(bribeTokens, bribeAmounts, gaugeID, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.BRIBE_PROVIDE,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [bribeController, gasConfig]
  )

  const voteForBribe = useCallback(
    async (voter: string, gaugeID: BigNumber, votePowerBPS: BigNumber) => {
      if (!bribeController) return { tx: null, localTx: null }
      const tx = await bribeController.voteForBribe(voter, gaugeID, votePowerBPS, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.BRIBE_VOTE,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [bribeController, gasConfig]
  )

  const voteForMultipleBribes = useCallback(
    async (voter: string, gaugeIDs: BigNumber[], votePowerBPSs: BigNumber[]) => {
      if (!bribeController) return { tx: null, localTx: null }
      const tx = await bribeController.voteForMultipleBribes(voter, gaugeIDs, votePowerBPSs, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.BRIBE_VOTE_MULTIPLE_BRIBES,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [bribeController, gasConfig]
  )

  const voteForBribeForMultipleVoters = useCallback(
    async (voters: string[], gaugeIDs: BigNumber[], votePowerBPSs: BigNumber[]) => {
      if (!bribeController) return { tx: null, localTx: null }
      const tx = await bribeController.voteForBribeForMultipleVoters(voters, gaugeIDs, votePowerBPSs, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.BRIBE_VOTE_MULTIPLE_VOTERS,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [bribeController, gasConfig]
  )

  const removeVoteForBribe = useCallback(
    async (voter: string, gaugeID: BigNumber) => {
      if (!bribeController) return { tx: null, localTx: null }
      const tx = await bribeController.removeVoteForBribe(voter, gaugeID, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.BRIBE_REMOVE_VOTE,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [bribeController, gasConfig]
  )

  const removeVoteForMultipleBribes = useCallback(
    async (voter: string, gaugeIDs: BigNumber[]) => {
      if (!bribeController) return { tx: null, localTx: null }
      const tx = await bribeController.removeVoteForMultipleBribes(voter, gaugeIDs, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.BRIBE_REMOVE_VOTES_MULTIPLE_BRIBES,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [bribeController, gasConfig]
  )

  const removeVoteForBribeForMultipleVoters = useCallback(
    async (voters: string[], gaugeIDs: BigNumber[]) => {
      if (!bribeController) return { tx: null, localTx: null }
      const tx = await bribeController.removeVoteForBribeForMultipleVoters(voters, gaugeIDs, {
        ...gasConfig,
        gasLimit: 800000,
      })
      const localTx: LocalTx = {
        hash: tx.hash,
        type: FunctionName.BRIBE_REMOVE_VOTES_MULTIPLE_VOTERS,
        status: TransactionCondition.PENDING,
      }
      return { tx, localTx }
    },
    [bribeController, gasConfig]
  )

  const claimBribes = useCallback(async () => {
    if (!bribeController) return { tx: null, localTx: null }
    const tx = await bribeController.claimBribes({ ...gasConfig, gasLimit: 800000 })
    const localTx: LocalTx = {
      hash: tx.hash,
      type: FunctionName.BRIBE_CLAIM,
      status: TransactionCondition.PENDING,
    }
    return { tx, localTx }
  }, [bribeController, gasConfig])

  return {
    getEpochStartTimestamp,
    getEpochEndTimestamp,
    getUnusedVotePowerBPS,
    getAvailableVotePowerBPS,
    getBribeTokenWhitelist,
    getClaimableBribes,
    getAllGaugesWithBribe,
    getProvidedBribesForGauge,
    getLifetimeProvidedBribes,
    getVotesForVoter,
    getVotesForGauge,
    isBribingOpen,
    provideBribes,
    voteForBribe,
    voteForMultipleBribes,
    voteForBribeForMultipleVoters,
    removeVoteForBribe,
    removeVoteForMultipleBribes,
    removeVoteForBribeForMultipleVoters,
    claimBribes,
  }
}

export const useBribeControllerHelper = () => {
  const { account } = useWeb3React()
  const { getProvidedBribesForGauge, getVotesForGauge, getBribeTokenWhitelist } = useBribeController()
  const { activeNetwork } = useNetwork()
  const { provider } = useProvider()
  const { keyContracts } = useContracts()
  const { bribeController, uwp } = keyContracts
  const { gauges } = useVoteContext()
  const { currentGaugesData } = gauges

  const [bribeTokens, setBribeTokens] = useState<TokenInfo[]>([])
  const [gaugeBribeInfo, setGaugeBribeInfo] = useState<GaugeBribeInfo[]>([])

  useEffect(() => {
    const getBribesForGauges = async () => {
      if (currentGaugesData.length == 0 || !bribeController) return
      const bribes = await Promise.all(currentGaugesData.map((gauge) => getProvidedBribesForGauge(gauge.gaugeId)))
      const votes = await Promise.all(currentGaugesData.map((gauge) => getVotesForGauge(gauge.gaugeId)))
      const _gaugeBribeInfo: GaugeBribeInfo[] = currentGaugesData.map((gauge, index) => {
        return {
          gaugeID: gauge.gaugeId,
          bribes: bribes[index],
          votes: votes[index],
        }
      })
      setGaugeBribeInfo(_gaugeBribeInfo)
    }
    getBribesForGauges()
  }, [currentGaugesData, bribeController, getProvidedBribesForGauge, getVotesForGauge])

  useEffect(() => {
    const getBribeTokensAndUserBalances = async () => {
      if (!bribeController || !uwp) return
      const _bribeTokens = await getBribeTokenWhitelist()
      const tokenMetadata: TokenInfo[] = []
      for (let i = 0; i < _bribeTokens.length; i++) {
        const token = new Contract(_bribeTokens[i], ERC20_ABI, provider)
        const metadata = await Promise.all([
          token.name() as string,
          token.symbol() as string,
          (account ? token.balanceOf(account) : ZERO) as BigNumber,
        ])
        tokenMetadata.push({
          name: metadata[0],
          symbol: metadata[1],
          balance: metadata[2],
          decimals: 0,
          price: 0,
          address: _bribeTokens[i],
        })
      }

      const mcProvider = new MulticallProvider(provider, activeNetwork.chainId)
      const uwpMc = new MulticallContract(uwp.address, underwritingPoolABI)
      const requests1 = tokenMetadata.map((token) => uwpMc.tokenData(token.address))
      const tokenData = await multicallChunked(mcProvider, requests1, 50)

      const requests2 = tokenMetadata.map((token, index) => {
        const oracleMC = new MulticallContract(tokenData[index].oracle, solaceMegaOracleABI)
        return oracleMC.priceFeedForToken(token.address)
      })

      const prices: {
        latestPrice: BigNumber
        token: string
        tokenDecimals: number
        priceFeedDecimals: number
      }[] = await multicallChunked(mcProvider, requests2, 50)

      const adjustedTokenMetadata = tokenMetadata.map((token, index) => {
        return {
          ...token,
          decimals: prices[index].tokenDecimals,
          price: parseFloat(formatUnits(prices[index].latestPrice, prices[index].priceFeedDecimals)),
        }
      })

      setBribeTokens(adjustedTokenMetadata)
    }
    getBribeTokensAndUserBalances()
  }, [activeNetwork, bribeController, uwp, provider, account, getBribeTokenWhitelist])

  return { bribeTokens, gaugeBribeInfo }
}
