import { ToastContainer } from 'react-toastify'
import styled from 'styled-components'
import { MAX_MOBILE_SCREEN_WIDTH } from '../../../constants'

export const FlexedToastMessage = styled.div`
  margin-top: 10px;
  margin-right: 0px;
  margin-bottom: 10px;
  margin-left: 0px;
  display: flex;
`

export const ToastWrapper = styled.div`
  text-align: center;
`

export const StylizedToastContainer = styled(ToastContainer)`
  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    bottom: 60px;
  }
`
