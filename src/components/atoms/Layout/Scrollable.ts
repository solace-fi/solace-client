import { BKPT_3 } from '../../../constants'
import styled from 'styled-components'
import { GeneralElementProps, GeneralElementCss } from '../../generalInterfaces'
import { ThinScrollbarCss } from '../Scrollbar/ThinScrollbar'

interface ScrollableProps extends GeneralElementProps {
  maxDesktopHeight?: string
  maxMobileHeight?: string
}

export const Scrollable = styled.div<ScrollableProps>`
  max-height: ${(props) => (props.maxDesktopHeight ? props.maxDesktopHeight : `60vh`)};
  overflow-y: auto;
  padding: 10px;
  background-color: ${(props) => props.theme.table.head_bg_color};

  @media screen and (max-width: ${BKPT_3}px) {
    max-height: ${(props) => (props.maxMobileHeight ? props.maxMobileHeight : `75vh`)};
  }
  border-radius: 10px;
  ${GeneralElementCss}
  ${ThinScrollbarCss}
`
