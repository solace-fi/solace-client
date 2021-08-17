import { NetworkConnector } from '@web3-react/network-connector'
import { LedgerConnector } from '@web3-react/ledger-connector'

import { RPC_URLS, POLLING_INTERVAL } from '../../constants'

export const network = new NetworkConnector({
  urls: { 1: RPC_URLS[1], 4: RPC_URLS[4] },
  defaultChainId: 4,
})

export const ledger = new LedgerConnector({ chainId: 4, url: RPC_URLS[4], pollingInterval: POLLING_INTERVAL })
