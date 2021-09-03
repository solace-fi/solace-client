/*************************************************************************************

    Table of Contents:

    import react
    import managers
    import components
    import wallet

    LedgerDerivationPathModal function
      custom hooks
      Local functions
      Render

  *************************************************************************************/

/* import react */
import React, { useState, useCallback } from 'react'

/* import managers */
import { useNetwork } from '../../context/NetworkManager'
import { useWallet } from '../../context/WalletManager'

/* import components */
import { Button, ButtonWrapper } from '../atoms/Button'
import { FormOption, FormSelect } from '../atoms/Form'
import { ModalRow } from '../atoms/Modal'
import { Modal } from '../molecules/Modal'

/* import wallet */
import { LedgerConnector } from '../../wallet/wallet-connectors/Ledger'

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
  /*************************************************************************************

  custom hooks

  *************************************************************************************/
  const { connect } = useWallet()
  const [derivationPath, setDerivationPath] = useState<string>(String(LEDGER_DERIVATION_PATHS[0].value))

  /*************************************************************************************

  local functions

  *************************************************************************************/

  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  const handleSelect = (target: any) => {
    setDerivationPath(target.value as string)
  }

  const handleConnect = async () => {
    handleClose()
    connect(LedgerConnector, {
      baseDerivationPath: derivationPath,
    })
      .then(onSuccess)
      .catch(Error)
  }

  const onSuccess = () => {
    console.log('successfully connected ledger wallet')
  }

  /*************************************************************************************

  render

  *************************************************************************************/
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
