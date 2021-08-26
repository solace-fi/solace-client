import React, { useState, useCallback } from 'react'
import { useWallet } from '../../context/WalletManager'
import { Button, ButtonWrapper } from '../atoms/Button'
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
  const [derivationPath, setDerivationPath] = useState<string>(String(LEDGER_DERIVATION_PATHS[0].value))

  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  const handleSelect = (value: any) => {
    setDerivationPath(value as string)
  }

  return (
    <Modal
      handleClose={handleClose}
      isOpen={isOpen}
      modalTitle={'Configure derivation path'}
      disableCloseButton={false}
    >
      <ModalRow></ModalRow>
      <ButtonWrapper>
        <Button></Button>
      </ButtonWrapper>
    </Modal>
  )
}
