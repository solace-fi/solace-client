/*************************************************************************************

    Table of Contents:

    import packages
    import managers
    import components
    import wallet

    LedgerDerivationPathModal
      hooks
      local functions
      Render

  *************************************************************************************/

/* import packages */
import React, { useState, useCallback } from 'react'

/* import managers */
import { useWallet } from '../../../context/WalletManager'

/* import components */
import { Button, ButtonWrapper } from '../../atoms/Button'
import { ModalRow } from '../../atoms/Modal'
import { Modal } from '../../molecules/Modal'
import { StyledSelect } from '../../molecules/Select'

/* import wallet */
import { LedgerConnector } from '../../../wallet/wallet-connectors/Ledger'

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

  hooks

  *************************************************************************************/
  const { connect } = useWallet()
  const [derivationPath, setDerivationPath] = useState(LEDGER_DERIVATION_PATHS[0])

  /*************************************************************************************

  local functions

  *************************************************************************************/

  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  const handleSelect = (d: any) => {
    setDerivationPath(d)
  }

  const handleConnect = async () => {
    handleClose()
    connect(LedgerConnector, {
      baseDerivationPath: derivationPath.value,
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
      <ModalRow style={{ display: 'block' }}>
        <StyledSelect value={derivationPath} onChange={handleSelect} options={LEDGER_DERIVATION_PATHS} />
      </ModalRow>
      <ButtonWrapper>
        <Button onClick={handleConnect} info>
          Connect
        </Button>
      </ButtonWrapper>
    </Modal>
  )
}
