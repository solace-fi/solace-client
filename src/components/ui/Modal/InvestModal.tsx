import React from 'react'
import styled from 'styled-components'

interface ModalProps {
  isOpen: boolean
}

interface ModalButtonProps {
  onClick?: any
  hidden?: boolean
}

const ModalContainer = styled.div<ModalProps>`
  position: fixed;
  top: 0;
  left: 0;
  ${(props) => (props.isOpen ? 'display: flex;' : 'display: none;')}
  width: 100vw;
  height: 100vh;
  padding: 32px;
  background: linear-gradient(113.7deg, #b621ff 0%, #21d3fc 100%);
`

const ModalBase = styled.div`
  margin: auto;
  border-radius: 10px;
  padding: 24px;
  background-color: rgba(255, 255, 255, 0.3);
`

const ModalClose = styled.div<ModalButtonProps>`
  visibility: ${(props) => (props.hidden ? 'hidden;' : 'visible;')}
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
`

export const ModalContent = styled.div``

export const ModalRow = styled.div`
  display: flex;
  margin-bottom: 20px;
  justify-content: space-around;
`

export const ModalCell = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 24px;
`

export const ModalButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40px;
`

export const Modal: React.FC<ModalProps> = ({ isOpen, children }) => {
  return (
    <ModalContainer className="modal" isOpen={isOpen}>
      <ModalBase>{children}</ModalBase>
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
