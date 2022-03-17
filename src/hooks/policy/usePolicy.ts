import { BigNumber, Contract } from 'ethers'
import { formatUnits } from '@ethersproject/units'
import { useEffect, useMemo, useState } from 'react'
import { ZERO } from '../../constants'
import { useContracts } from '../../context/ContractsManager'
import { NetworkConfig } from '../../constants/types'
import { useNetwork } from '../../context/NetworkManager'
import { useProvider } from '../../context/ProviderManager'
import { JsonRpcProvider } from '@ethersproject/providers'
import { isAddress } from '../../utils'
import { numberAbbreviate, truncateValue } from '../../utils/formatting'
import { useFunctions, useSupportedChains } from './useSolaceCoverProduct'
import { CheckboxData } from '../../pages/stake/types/LockCheckbox'

export const useTotalActivePolicies = () => {
  const { latestBlock } = useProvider()
  const { networks } = useNetwork()
  const [totalActivePolicies, setTotalActivePolicies] = useState<string>('-')
  const [totalActiveCoverLimit, setTotalActiveCoverLimit] = useState<string>('-')

  useEffect(() => {
    const getPolicyCount = async () => {
      const countedNetworks = networks.filter((n) => !n.isTestnet)
      let totalPolicyCount = ZERO
      let activeCoverLimit = ZERO
      for (let i = 0; i < countedNetworks.length; i++) {
        const activeNetwork = countedNetworks[i]
        if (activeNetwork.config.restrictedFeatures.noSoteria) continue
        const provider = new JsonRpcProvider(activeNetwork.rpc.httpsUrl)
        const solaceCoverProductSrc = activeNetwork.config.keyContracts.solaceCoverProduct
        if (!solaceCoverProductSrc) continue
        if (!solaceCoverProductSrc.addr || !isAddress(solaceCoverProductSrc.addr) || !solaceCoverProductSrc.abi)
          continue
        const solaceCoverProductContract = new Contract(solaceCoverProductSrc.addr, solaceCoverProductSrc.abi, provider)
        const policyCount = await solaceCoverProductContract.policyCount()
        const coverLimit = await solaceCoverProductContract.activeCoverLimit()
        activeCoverLimit = activeCoverLimit.add(coverLimit)
        totalPolicyCount = totalPolicyCount.add(policyCount)
      }
      setTotalActivePolicies(numberAbbreviate(totalPolicyCount.toString()))
      setTotalActiveCoverLimit(truncateValue(formatUnits(activeCoverLimit, 18), 2))
    }
    getPolicyCount()
  }, [latestBlock])

  return { totalActivePolicies, totalActiveCoverLimit }
}

export const useExistingPolicy = (account: string | undefined) => {
  const { networks } = useNetwork()
  const { latestBlock } = useProvider()
  const [loading, setLoading] = useState(true)
  const [policyId, setPolicyId] = useState<BigNumber>(ZERO)
  const [network, setNetwork] = useState<NetworkConfig>(networks[0])

  useEffect(() => {
    const getExistingPolicy = async () => {
      if (!account) {
        setPolicyId(ZERO)
        setLoading(true)
        return
      }
      const countedNetworks = networks.filter((n) => !n.isTestnet)
      // const countedNetworks = networks
      let _id = ZERO
      let _network = networks[0]
      for (let i = 0; i < countedNetworks.length; i++) {
        const activeNetwork = countedNetworks[i]
        if (activeNetwork.config.restrictedFeatures.noSoteria) continue
        const provider = new JsonRpcProvider(activeNetwork.rpc.httpsUrl)
        const solaceCoverProductSrc = activeNetwork.config.keyContracts.solaceCoverProduct
        if (!solaceCoverProductSrc) continue
        if (!solaceCoverProductSrc.addr || !isAddress(solaceCoverProductSrc.addr) || !solaceCoverProductSrc.abi)
          continue
        const solaceCoverProductContract = new Contract(solaceCoverProductSrc.addr, solaceCoverProductSrc.abi, provider)
        const _policyId = await solaceCoverProductContract.policyOf(account)
        _id = _policyId
        _network = activeNetwork
        if (_id.gt(ZERO)) break
      }
      setNetwork(_network)
      setPolicyId(_id)
      setLoading(false)
    }
    getExistingPolicy()
  }, [account, latestBlock, networks])

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
  const [loading, setLoading] = useState(true)
  const [policyChainsChecked, setPolicyChainsChecked] = useState<CheckboxData[]>([])
  const [chainsChecked, setChainsChecked] = useState<CheckboxData[]>([])

  const updateBoxChecked = (chains: CheckboxData[], oldArray: CheckboxData[]): CheckboxData[] => {
    if (oldArray.length === 0) return chains
    return chains.map((chain) => {
      const oldBox = oldArray.find((oldBox) => oldBox.id.eq(chain.id))
      return oldBox ? { id: chain.id, checked: oldBox.checked } : { id: chain.id, checked: false }
    })
  }

  const getPolicyChains = async (_policyId: number, _coverableChains: BigNumber[], shouldUpdateBoxchecked: boolean) => {
    if (activeNetwork.config.keyContracts.solaceCoverProduct.additionalInfo == 'v2' && _coverableChains.length == 0) {
      console.log('is v2 but no general chain info returned')
      return
    }
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
      if (numPolicyChains.includes(c.toNumber()) || numPolicyChains.length == 0) return { id: c, checked: true }
      return { id: c, checked: false }
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
    if (policyId == undefined) {
      return
    }
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
