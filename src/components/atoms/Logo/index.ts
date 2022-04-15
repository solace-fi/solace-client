import styled from 'styled-components'
import { GeneralElementCss, GeneralElementProps } from '../../generalInterfaces'

export const LogoBase = styled.div<GeneralElementProps>`
  display: flex;
  align-items: flex-start;
  width: 107px;
  text-decoration: none;
  transition: all 200ms ease;
  color: ${({ theme }) => `${theme.typography.contrastText}`};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  :hover {
  }
  ${GeneralElementCss}
`
