import styled, { css, keyframes } from 'styled-components'
import { ClickProps } from '../Button'
import { GeneralTextProps, GeneralTextCss } from '../Typography'
import { MAX_MOBILE_SCREEN_WIDTH } from '../../../constants'
import { GeneralElementProps, GeneralElementCss } from '../../generalInterfaces'

export interface ModalProps {
  handleClose: () => void
  isOpen: boolean
  modalTitle: string
  disableCloseButton: boolean
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
  z-index: 2;
  ${(props) => (props.isOpen ? 'display: flex;' : 'display: none;')}
  overflow-y: scroll;
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

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    width: 100%;
  }
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
  margin-bottom: 20px;
`

export const ModalRow = styled.div<GeneralElementProps>`
  display: flex;
  margin-bottom: 20px;
  justify-content: space-around;
  ${GeneralElementCss}

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    flex-direction: column;
    align-items: center;
  }
`

export const ModalCell = styled.div<GeneralTextProps & GeneralElementProps>`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 24px;
  position: relative;
  ${GeneralTextCss}
  ${GeneralElementCss}
`
