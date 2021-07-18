import React from 'react'
import { Heading2 } from '../Typography'
import { ModalContainer, ModalBase, ModalClose, ModalHeader } from './index'
import { ModalProps, ModalButtonProps } from './index'

export const Modal: React.FC<ModalProps> = ({ children, ...props }) => {
  return (
    <ModalContainer {...props}>
      <ModalBase {...props}>
        <ModalHeader>
          <Heading2>{props.modalTitle}</Heading2>
          <ModalCloseButton hidden={props.disableCloseButton} onClick={() => props.handleClose()} />
        </ModalHeader>
        <hr style={{ marginBottom: '20px' }} />
        <div>{children}</div>
      </ModalBase>
    </ModalContainer>
  )
}

export const ModalCloseButton: React.FC<ModalButtonProps> = ({ onClick, hidden }) => {
  return (
    <ModalClose onClick={onClick} hidden={hidden}>
      <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M18.5351 3.30802C19.1823 2.6609 19.1823 1.61172 18.5351 0.964604C17.888 0.317488 16.8388 0.317488 16.1917 0.964604L9.99894 7.15739L3.80678 0.965226C3.15966 0.31811 2.11048 0.31811 1.46336 0.965226C0.816248 1.61234 0.816248 2.66152 1.46336 3.30864L7.65553 9.5008L1.46496 15.6914C0.817846 16.3385 0.817845 17.3877 1.46496 18.0348C2.11208 18.6819 3.16126 18.6819 3.80838 18.0348L9.99894 11.8442L16.1901 18.0354C16.8372 18.6825 17.8864 18.6825 18.5335 18.0354C19.1807 17.3883 19.1807 16.3391 18.5335 15.692L12.3424 9.5008L18.5351 3.30802Z"
          fill="white"
        />
      </svg>
    </ModalClose>
  )
}
