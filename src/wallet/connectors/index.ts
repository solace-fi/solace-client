import { InjectedConnector } from '@web3-react/injected-connector'

export const injected = new InjectedConnector({
  supportedChainIds: Array.from({ length: 31337 }, (_, i) => i + 1),
})
