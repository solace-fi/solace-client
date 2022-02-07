import { AbstractConnector } from '@web3-react/abstract-connector'
import { LedgerConnector as Ledger_Connector } from '@web3-react/ledger-connector'
import { NetworkConfig } from '../../constants/types'
import LedgerLogo from '../../resources/svg/wallets/ledger-logo.svg'

const LEDGER_BASE_DERIVATION_PATH = 'solace_base_derivation_path'

export type LedgerWalletArgs = {
  baseDerivationPath?: string
}

export const LedgerConnector = {
  id: 'ledger',
  logo: LedgerLogo,
  name: 'Ledger',
  supportedTxTypes: [0, 2],
  getConnector(network: NetworkConfig, args?: LedgerWalletArgs): AbstractConnector {
    let baseDerivationPath: string | undefined = args?.baseDerivationPath

    if (!baseDerivationPath) {
      baseDerivationPath = sessionStorage.getItem(LEDGER_BASE_DERIVATION_PATH) ?? undefined
    }

    return new Ledger_Connector({
      chainId: network.chainId,
      url: network.rpc.httpsUrl,
      pollingInterval: network.rpc.pollingInterval,
      baseDerivationPath,
    })
  },
  onConnect(connector: AbstractConnector, args?: LedgerWalletArgs): void {
    const { sessionStorage } = window

    if (args?.baseDerivationPath) {
      sessionStorage.setItem(LEDGER_BASE_DERIVATION_PATH, args?.baseDerivationPath ?? '')
    }
  },
  onDisconnect(): void {
    const { sessionStorage } = window
    sessionStorage.removeItem(LEDGER_BASE_DERIVATION_PATH)
  },
  onError(error: Error): Error | undefined {
    return error
  },
}
