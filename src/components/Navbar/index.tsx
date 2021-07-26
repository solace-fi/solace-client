import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { ButtonBaseCss } from '../Button'
import { MAX_FULL_SCREEN_WIDTH } from '../../constants'

interface TopNavProps {
  isOpen?: boolean
}

export const TopNav = styled.div<TopNavProps>`
  ${(props) => (props.isOpen == false ? 'max-height: 4rem;' : 'max-height: 8rem;')}
  position: fixed;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.9);
  display: none;
  padding: 10px;
  transition: 200ms ease;

  @media screen and (max-width: ${MAX_FULL_SCREEN_WIDTH}px) {
    display: block;
    width: 100%;
    z-index: 1;
  }
`
export const NavButton = styled.button`
  ${ButtonBaseCss}
  display: block;
  position: absolute;
  right: 30px;
  top: 15px;
  min-height: 40px;
  min-width: 70px;
`

export const SidebarItem = styled(NavLink)`
  font-weight: 600;
  font-size: 16px;
  opacity: 0.8;
  color: #fff;
  text-decoration: none;
  transition: opacity 0.2s;
  &:hover,
  &.is-active {
    opacity: 1;
  }
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

  @media screen and (max-width: ${MAX_FULL_SCREEN_WIDTH}px) {
    display: flex;
    justify-content: space-evenly;
  }
`
