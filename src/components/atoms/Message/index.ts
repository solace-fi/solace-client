import { ToastContainer } from 'react-toastify'
import styled from 'styled-components'
import { GeneralTextProps, GeneralTextCss } from '../Typography'

export const FlexedToastMessage = styled.div<GeneralTextProps>`
  margin-top: 10px;
  margin-right: 0px;
  margin-bottom: 10px;
  margin-left: 0px;
  display: flex;
  ${GeneralTextCss}
`

export const ToastWrapper = styled.div`
  text-align: center;
`

export const StylizedToastContainer = styled(ToastContainer)``

export const StaticMessage = styled.div<GeneralTextProps>`
  max-height: 2.5rem;
  position: fixed;
  background-color: rgb(75, 52, 112);
  ${GeneralTextCss}
  ${(props) => props.info && `background-color: ${props.theme.typography.infoText};`}
  ${(props) => props.success && `background-color: ${props.theme.typography.successText};`}
  ${(props) => props.error && `background-color: ${props.theme.typography.errorText};`}
  ${(props) => props.warning && `background-color: ${props.theme.typography.warningText};`}
  display: block;
  width: 100%;
  z-index: 1;
  text-align: center;
  color: rgb(250, 250, 250);
`
