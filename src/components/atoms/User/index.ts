import styled from 'styled-components'
import { GeneralElementProps, GeneralElementCss } from '../../generalInterfaces'

export const UserImage = styled.div<GeneralElementProps>`
  width: 30px;
  height: 30px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  ${GeneralElementCss}
`
