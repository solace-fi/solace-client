/*************************************************************************************

    Table of Contents:

    import react
    import components

    TransactionHistoryModal function
      local functions
      Render

  *************************************************************************************/

/* import react */
import React, { useCallback } from 'react'

/* import components */
import { Modal } from '../molecules/Modal'
import { TransactionHistory } from '../molecules/TransactionHistory'

interface TransactionHistoryModalProps {
  closeModal: () => void
  isOpen: boolean
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({ closeModal, isOpen }) => {
  /************************************************************************************* 
    
  local functions

  *************************************************************************************/
  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])
  /************************************************************************************* 
    
  Render

  *************************************************************************************/
  return (
    <Modal handleClose={handleClose} isOpen={isOpen} modalTitle={'Recent Transactions'} disableCloseButton={false}>
      <TransactionHistory />
    </Modal>
  )
}
