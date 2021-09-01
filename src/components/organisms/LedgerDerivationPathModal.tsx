import React, { useState, useCallback } from 'react'
import { useNetwork } from '../../context/NetworkManager'
import { useWallet } from '../../context/WalletManager'
import { LedgerConnector } from '../../wallet/wallet-connectors/Ledger'
import { Button, ButtonWrapper } from '../atoms/Button'
import { FormOption, FormSelect } from '../atoms/Form'
import { ModalRow } from '../atoms/Modal'
import { Modal } from '../molecules/Modal'

interface LedgerDerivationPathModalProps {
  closeModal: () => void
  isOpen: boolean
}

const LEDGER_DERIVATION_PATHS = [
  {
    value: `m/44'/60'/0'`,
    label: `Ethereum - m/44'/60'/0'`,
  },
  {
    value: `m/44'/60'/0'/0`,
    label: `Ethereum - Ledger Live - m/44'/60'/0'/0`,
  },
]

export const LedgerDerivationPathModal: React.FC<LedgerDerivationPathModalProps> = ({ closeModal, isOpen }) => {
  const { connect } = useWallet()
  const { activeNetwork } = useNetwork()
  const [derivationPath, setDerivationPath] = useState<string>(String(LEDGER_DERIVATION_PATHS[0].value))

  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  const handleSelect = (target: any) => {
    setDerivationPath(target.value as string)
  }

  const handleConnect = async () => {
    handleClose()

    // console.log('handleClose')
    // console.log('derivationPath:', derivationPath)
    // const connector = LedgerConnector.getConnector(activeNetwork)
    // console.log('on handleConnect connector:', connector)
    // const res = await connector.getProvider()
    // if (res) {
    //   const accounts = await res._providers[0].getAccountsAsync(30)
    //   console.log('on handleConnect provider:', res)
    //   console.log('on handleConnect accounts:', accounts)
    // } else {
    //   console.log('error, res not exist:', res)
    // }
    connect(LedgerConnector, {
      baseDerivationPath: derivationPath,
    })
      .then(onSuccess)
      .catch(Error)
  }

  const onSuccess = () => {
    console.log('successfully connected ledger wallet')
  }

  return (
    <Modal
      handleClose={handleClose}
      isOpen={isOpen}
      modalTitle={'Configure derivation path'}
      disableCloseButton={false}
    >
      <ModalRow>
        <FormSelect value={derivationPath} onChange={(e) => handleSelect(e.target)}>
          {LEDGER_DERIVATION_PATHS.map((path, i) => (
            <FormOption key={i} value={path.value}>
              {path.label}
            </FormOption>
          ))}
        </FormSelect>
      </ModalRow>
      <ButtonWrapper>
        <Button onClick={() => handleConnect()}>Connect</Button>
      </ButtonWrapper>
    </Modal>
  )
}
