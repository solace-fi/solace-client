import styled, { css } from 'styled-components'
import { Menu } from '@styled-icons/boxicons-regular/Menu'
import { Checkmark } from '@styled-icons/evaicons-solid/Checkmark'
import { Warning } from '@styled-icons/fluentui-system-regular/Warning'
import { History } from '@styled-icons/boxicons-regular/History'
import { Wallet } from '@styled-icons/boxicons-solid/Wallet'
import { NetworkChart } from '@styled-icons/boxicons-regular/NetworkChart'
import { Info } from '@styled-icons/fluentui-system-regular/Info'
import { LinkExternal } from '@styled-icons/boxicons-regular/LinkExternal'
import { ArrowDropDownCircle } from '@styled-icons/material-sharp/ArrowDropDownCircle'
import { DarkTheme } from '@styled-icons/fluentui-system-regular/DarkTheme'

export const StyledIconCss = css`
  margin: auto;
  display: block;
`

export const StyledHistory = styled(History)`
  display: block;
`

export const StyledWallet = styled(Wallet)`
  display: block;
`

export const StyledNetworkChart = styled(NetworkChart)`
  display: block;
`

export const StyledInfo = styled(Info)``

export const StyledTheme = styled(DarkTheme)``

export const StyledArrowDropDownCircle = styled(ArrowDropDownCircle)``

export const StyledLinkExternal = styled(LinkExternal)``

export const StyledMenu = styled(Menu)`
  ${StyledIconCss}
`

export const StyledCheckmark = styled(Checkmark)`
  ${StyledIconCss}
`

export const StyledWarning = styled(Warning)`
  ${StyledIconCss}
`
