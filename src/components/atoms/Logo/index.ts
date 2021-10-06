import styled from 'styled-components'
import { GeneralElementCss, GeneralElementProps } from '../../generalInterfaces'

export const LogoBase = styled.a<GeneralElementProps>`
  display: flex;
  align-items: flex-start;
  width: 114px;
  text-decoration: none;
  transition: all 200ms ease;
  color: ${({ theme }) => theme.typography.med_emphasis};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  :hover {
    color: ${({ theme }) => theme.typography.high_emphasis};
  }
  ${GeneralElementCss}
`
