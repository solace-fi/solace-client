import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { MAX_NAVBAR_SCREEN_WIDTH, MAX_MOBILE_SCREEN_WIDTH } from '../../../constants'
import { GeneralTextProps, GeneralTextCss } from '../Typography'

interface TopNavProps {
  isOpen?: boolean
}

export const TopNav = styled.div<TopNavProps>`
  ${(props) => (props.isOpen == false ? 'max-height: 4rem;' : 'max-height: 8rem;')}
  position: fixed;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.9);
  display: none;
  padding: 10px 0;
  transition: 200ms ease;

  @media screen and (max-width: ${MAX_NAVBAR_SCREEN_WIDTH}px) {
    display: block;
    width: 100%;
    z-index: 1;
  }

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    ${(props) => (props.isOpen == false ? 'max-height: 4rem;' : 'max-height: 100vh;')}
    text-align: center;
  }
`

export const SidebarItem = styled(NavLink)<GeneralTextProps>`
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.typography.med_emphasis};
  text-decoration: none;
  transition: all 0.2s;
  &:hover,
  &.is-active {
    opacity: 1;
    transform: scale(1.1);
  }

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    padding: 20px 0;
  }
  ${GeneralTextCss}
`

export const ItemText = styled.li`
  display: flex;
  justify-content: start;
  align-items: center;
  padding: 8px 0px 8px 16px;
  list-style: none;
  height: 30px;
`

export const ItemList = styled.ul`
  width: 100%;
  padding: 0;

  @media screen and (max-width: ${MAX_NAVBAR_SCREEN_WIDTH}px) {
    display: flex;
    justify-content: space-evenly;
  }

  @media screen and (max-width: ${MAX_MOBILE_SCREEN_WIDTH}px) {
    flex-direction: column;
  }
`
