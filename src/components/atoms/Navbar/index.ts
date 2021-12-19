import { NavLink } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { BKPT_NAVBAR, BKPT_3, Z_TOPNAV } from '../../../constants'
// import { GeneralElementCss } from '../../generalInterfaces'
import { GeneralTextProps, GeneralTextCss } from '../Typography'

interface TopNavProps {
  isOpen?: boolean
}

export const TopNav = styled.div<TopNavProps>`
  position: fixed;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.92);
  display: none;
  padding: 10px 0;
  transition: 200ms ease;

  @media screen and (max-width: ${BKPT_NAVBAR}px) {
    display: block;
    width: 100%;
    z-index: ${Z_TOPNAV};
  }

  @media screen and (max-width: ${BKPT_3}px) {
    ${(props) => (props.isOpen == false ? 'max-height: 2.5rem;' : 'max-height: calc(100vh - 20px);')}
    text-align: center;
  }
`

export const SidebarTextCss = css<GeneralTextProps>`
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => `${theme.typography.contrastText}`};
  text-decoration: none;
  transition: all 0.2s ease;
  &:hover,
  &.is-active {
    opacity: 1 !important;
    font-weight: 600;
  }

  ${GeneralTextCss}
`

export const SidebarText = styled.div<GeneralTextProps>`
  ${SidebarTextCss}
`

export const SidebarItem = styled(NavLink)<GeneralTextProps>`
  ${SidebarTextCss}
`

export const ItemText = styled.li<GeneralTextProps>`
  display: flex;
  justify-content: start;
  align-items: center;
  padding: 4px 0;
  list-style: none;
  height: 30px;
  ${GeneralTextCss}
`

export const ItemList = styled.ul`
  width: 100%;
  padding: 0;

  @media screen and (max-width: ${BKPT_NAVBAR}px) {
    display: flex;
    justify-content: space-evenly;
  }

  @media screen and (max-width: ${BKPT_3}px) {
    flex-direction: column;
  }
`
