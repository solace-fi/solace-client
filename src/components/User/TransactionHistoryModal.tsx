import React from 'react'
import { Modal } from '../Modal/Modal'
import { TransactionHistory } from '../../pages/TransactionHistory'

interface TransactionHistoryModalProps {
  closeModal: () => void
  isOpen: boolean
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({ closeModal, isOpen }) => {
  const handleClose = () => {
    closeModal()
  }

  return (
    <Modal handleClose={handleClose} isOpen={isOpen} modalTitle={'Recent Transactions'} disableCloseButton={false}>
      <TransactionHistory />
    </Modal>
  )
}
