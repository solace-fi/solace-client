import styled from 'styled-components'
import { Z_NAV, BKPT_TABLET_END, BKPT_MOBILE_END } from '../../../constants'
import { ThinScrollbarCss } from '../Scrollbar/ThinScrollbar'
import { GeneralTextProps, GeneralTextCss } from '../Typography'

interface TopNavProps {
  isOpen?: boolean
}

export const MobileNavPanelComponent = styled.div<{ shouldShow: boolean }>`
  background-color: ${({ theme }) => theme.body.bg_color};
  display: 'flex';
  width: 100%;
  overflow-y: auto;
  position: fixed;
  top: 0;
  z-index: ${Z_NAV};
  ${(props) => (props.shouldShow ? `left: 0%; transition: 350ms;` : `left: -100%; transition: 350ms;`)};
`

export const MobileNavMenu = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  ${ThinScrollbarCss}
`

export const TopNav = styled.div<TopNavProps>`
  position: fixed;
  overflow: hidden;
  background-color: ${(props) => props.theme.body.bg_color};
  padding: 10px 0;
  transition: 200ms ease;
  display: block;
  width: 100%;
  z-index: ${Z_NAV};

  @media screen and (max-width: ${BKPT_MOBILE_END}px) {
    ${(props) => (props.isOpen == false ? 'max-height: 2.5rem;' : 'max-height: calc(100vh - 20px);')}
    text-align: center;
  }
`

export const ItemText = styled.li<GeneralTextProps>`
  display: flex;
  justify-content: start;
  align-items: center;
  padding: 4px 0;
  list-style: none;
  height: 35px;
  ${GeneralTextCss}
`

export const ItemList = styled.ul`
  width: 100%;
  padding: 0;
  margin: 0;

  @media screen and (max-width: ${BKPT_TABLET_END}px) {
    display: flex;
    justify-content: space-evenly;
  }

  @media screen and (max-width: ${BKPT_MOBILE_END}px) {
    flex-direction: column;
  }
`
