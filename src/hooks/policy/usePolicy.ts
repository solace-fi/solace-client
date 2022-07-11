import { BigNumber } from 'ethers'
import { formatUnits } from '@ethersproject/units'
import { useEffect, useRef, useState } from 'react'
import { ZERO } from '../../constants'
import { NetworkConfig } from '../../constants/types'
import { useNetwork, networks } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { numberAbbreviate, truncateValue } from '../../utils/formatting'
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
      if (!account || activeNetwork.config.restrictedFeatures.noCoverageV3) {
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

      const data = await policy.getExistingPolicy_V2(account, rpcUrlMapping, false)
      if (data.length > 0) {
        const policyWithHighestCoverLimit = data.reduce((a, b) => (a.coverLimit.gt(b.coverLimit) ? a : b))
        const network = networks.find((n) => n.chainId === policyWithHighestCoverLimit.chainId)
        if (network) {
          setNetwork(network)
          setPolicyId(policyWithHighestCoverLimit.policyId)
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
