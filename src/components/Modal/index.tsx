import styled, { css, keyframes } from 'styled-components'
import { ClickProps } from '../Button'
import { GeneralTextProps, GeneralTextCss } from '../Text'

export interface ModalProps {
  handleClose: () => void
  isOpen: boolean
  modalTitle: string
  modalLoading: boolean
}

export interface ModalButtonProps extends ClickProps {
  hidden?: boolean
}

const FadeInAnimation = keyframes`  
  from { opacity: 0; }
  to { opacity: 1; }
`

export const ModalContainer = styled.div<ModalProps>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(113.7deg, rgba(182, 33, 255) 0%, rgba(33, 211, 252) 100%);
  z-index: 1;
  ${(props) => (props.isOpen ? 'display: flex;' : 'display: none;')}
`

export const ModalBase = styled.div<ModalProps>`
  margin: auto;
  border-radius: 10px;
  padding: 24px;
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 7px #fff;
  opacity: 0;
  ${(props) =>
    props.isOpen &&
    css`
      animation: ${FadeInAnimation} 300ms ease-in-out normal forwards;
    `}
`

export const ModalClose = styled.div<ModalButtonProps>`
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
  margin-bottom: 30px;
`

export const ModalContent = styled.div``

export const ModalRow = styled.div`
  display: flex;
  margin-bottom: 20px;
  justify-content: space-around;
`

export const ModalCell = styled.div<GeneralTextProps>`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 24px;
  ${GeneralTextCss}
`
