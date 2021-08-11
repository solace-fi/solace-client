import styled from 'styled-components'
import { GeneralElementCss, GeneralElementProps } from '../../generalInterfaces'

export const LogoBase = styled.a<GeneralElementProps>`
  display: flex;
  align-items: flex-start;
  width: 114px;
  text-decoration: none;
  transition: all 200ms ease;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  :hover {
    transform: scale(1.1);
  }
  ${GeneralElementCss}
`
