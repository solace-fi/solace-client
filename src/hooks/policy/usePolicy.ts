import { BigNumber } from 'ethers'
import { formatUnits } from '@ethersproject/units'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ZERO } from '../../constants'
import { useContracts } from '../../context/ContractsManager'
import { NetworkConfig, CheckboxData } from '../../constants/types'
import { useNetwork, networks } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { numberAbbreviate, truncateValue } from '../../utils/formatting'
import { useFunctions, useSupportedChains } from './useSolaceCoverProduct'
import { Policy } from '@solace-fi/sdk-nightly'
import { useCachedData } from '../../context/CachedDataManager'

export const useTotalActivePolicies = () => {
  const { minute } = useCachedData()
  const [totalActivePolicies, setTotalActivePolicies] = useState<string>('-')
  const [totalActiveCoverLimit, setTotalActiveCoverLimit] = useState<string>('-')

  useEffect(() => {
    const getPolicyCount = async () => {
      const policy = new Policy()

      const countedNetworks = networks.filter((n) => n.config.keyContracts.solaceCoverProduct && !n.isTestnet)
      const rpcUrlMapping: { [key: number]: string } = countedNetworks.reduce(
        (urls: any, network: NetworkConfig) => ({
          ...urls,
          [network.chainId]: network.rpc.httpsUrl,
        }),
        {}
      )

      const data = await policy.getTotalActivePolicies_All(rpcUrlMapping)
      setTotalActivePolicies(numberAbbreviate(data.totalPolicies.toString()))
      setTotalActiveCoverLimit(truncateValue(formatUnits(data.totalActiveCoverLimit, 18), 2))
    }
    getPolicyCount()
  }, [minute])

  return { totalActivePolicies, totalActiveCoverLimit }
}

export const useExistingPolicy = (account: string | null | undefined) => {
  const { latestBlock } = useProvider()
  const { activeNetwork } = useNetwork()
  const [loading, setLoading] = useState(true)
  const [policyId, setPolicyId] = useState<BigNumber>(ZERO)
  const [network, setNetwork] = useState<NetworkConfig>(networks[0])
  const fetching = useRef(false)

  useEffect(() => {
    const getExistingPolicy = async () => {
      if (!account || activeNetwork.config.restrictedFeatures.noSoteria) {
        setPolicyId(ZERO)
        setLoading(true)
        return
      }
      if (fetching.current) return
      fetching.current = true
      const policy = new Policy()

      const rpcUrlMapping: { [key: number]: string } = networks.reduce(
        (urls: any, network: NetworkConfig) => ({
          ...urls,
          [network.chainId]: network.rpc.httpsUrl,
        }),
        {}
      )

      const data = await policy.getExistingPolicy(account, rpcUrlMapping, false)
      if (data.length > 0) {
        const network = networks.find((n) => n.chainId === data[0].chainId)
        if (network) {
          setNetwork(network)
          setPolicyId(data[0].policyId)
        } else {
          setPolicyId(ZERO)
          setNetwork(networks[0])
        }
      } else {
        setPolicyId(ZERO)
        setNetwork(networks[0])
      }
      setLoading(false)
      fetching.current = false
    }
    getExistingPolicy()
  }, [account, latestBlock])

  useEffect(() => {
    setLoading(true)
  }, [account])

  return { policyId, network, loading }
}

export const useGetPolicyChains = (policyId: number | undefined) => {
  const { keyContracts } = useContracts()
  const { activeNetwork } = useNetwork()
  const { solaceCoverProduct } = useMemo(() => keyContracts, [keyContracts])
  const { getPolicyChainInfo } = useFunctions()
  const { coverableNetworks, coverableChains } = useSupportedChains()

  const [portfolioChains, setPortfolioChains] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [policyChainsChecked, setPolicyChainsChecked] = useState<CheckboxData[]>([])
  const [chainsChecked, setChainsChecked] = useState<CheckboxData[]>([])

  const updateBoxChecked = (chains: CheckboxData[], oldArray: CheckboxData[]): CheckboxData[] => {
    if (oldArray.length === 0) return chains
    return chains.map((chain) => {
      const oldBox = oldArray.find((oldBox) => oldBox.id === chain.id)
      return oldBox ? { id: chain.id, checked: oldBox.checked } : { id: chain.id, checked: false }
    })
  }

  const getPolicyChains = async (_policyId: number, _coverableChains: BigNumber[], shouldUpdateBoxchecked: boolean) => {
    if (activeNetwork.config.keyContracts.solaceCoverProduct.additionalInfo == 'v2' && _coverableChains.length == 0) {
      console.log('is v2 but no general chain info returned')
      return
    }
    setLoading(true)
    const _policyChains = await getPolicyChainInfo(BigNumber.from(_policyId))

    /* 
      if there are no chains from this policy, return portfolio for all chains
      else, return portfolio for chains from this policy
    */
    if (_policyChains.length > 0) {
      setPortfolioChains(_policyChains.map((c) => c.toNumber()))
    } else {
      setPortfolioChains(_coverableChains.map((c) => c.toNumber()))
    }

    const numPolicyChains = _policyChains.map((c) => c.toNumber())
    const newArr = _coverableChains.map((c) => {
      if (numPolicyChains.includes(c.toNumber()) || numPolicyChains.length == 0)
        return { id: c.toString(), checked: true }
      return { id: c.toString(), checked: false }
    })
    setPolicyChainsChecked(newArr)
    if (shouldUpdateBoxchecked) {
      setChainsChecked(updateBoxChecked(newArr, chainsChecked))
    } else {
      setChainsChecked(newArr)
    }
    setLoading(false)
  }

  // Should run based on whether the user has a policy or not
  useEffect(() => {
    if (policyId == undefined) return
    getPolicyChains(policyId, coverableChains, true)
  }, [policyId, coverableChains.length])

  /* 
    Should run when the user makes a change with their policy
    that should be reflected on the display
  */
  useEffect(() => {
    if (!solaceCoverProduct || policyId == undefined) return
    solaceCoverProduct.on('PolicyUpdated', async (id) => {
      if (BigNumber.from(policyId).eq(id)) getPolicyChains(id, coverableChains, false)
    })
    return () => {
      solaceCoverProduct.removeAllListeners()
    }
  }, [solaceCoverProduct, policyId, coverableChains])

  return {
    portfolioChains,
    policyChainsChecked,
    coverableNetworks,
    chainsChecked,
    setChainsChecked,
    loading,
  }
}
