import { BKPT_3 } from '../../../constants'
import styled from 'styled-components'
import { GeneralElementProps, GeneralElementCss } from '../../generalInterfaces'

interface ScrollableProps extends GeneralElementProps {
  maxDesktopHeight?: number
  maxMobileHeight?: number
}

export const Scrollable = styled.div<ScrollableProps>`
  max-height: ${(props) => (props.maxDesktopHeight ? props.maxDesktopHeight : `60`)}vh;
  overflow-y: auto;
  padding: 10px;
  background-color: ${(props) => props.theme.accordion.bg_color};

  @media screen and (max-width: ${BKPT_3}px) {
    max-height: ${(props) => (props.maxMobileHeight ? props.maxMobileHeight : `75`)}vh;
  }
  border-radius: 10px;
  ${GeneralElementCss}
`
