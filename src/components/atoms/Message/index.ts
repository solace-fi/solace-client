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
