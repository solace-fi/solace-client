import React from 'react'
import { useWallet } from '../../context/WalletManager'
import { Button } from '.'
import { SUPPORTED_WALLETS } from '../../wallet/wallets'

export const WalletConnectButton: React.FC = () => {
  const wallet = useWallet()

  return (
    <Button
      onClick={() =>
        wallet.connect(SUPPORTED_WALLETS[SUPPORTED_WALLETS.findIndex((wallet) => wallet.id === 'metamask')])
      }
    >
      Connect Wallet
    </Button>
  )
}
