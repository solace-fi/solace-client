import styled, { css } from 'styled-components'
import { Menu } from '@styled-icons/boxicons-regular/Menu'
import { Checkmark } from '@styled-icons/evaicons-solid/Checkmark'
import { Warning } from '@styled-icons/fluentui-system-regular/Warning'
import { History } from '@styled-icons/boxicons-regular/History'
import { Wallet } from '@styled-icons/boxicons-solid/Wallet'
import { NetworkChart } from '@styled-icons/boxicons-regular/NetworkChart'
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

export const StyledMenu = styled(Menu)`
  ${StyledIconCss}
`

export const StyledCheckmark = styled(Checkmark)`
  ${StyledIconCss}
`

export const StyledWarning = styled(Warning)`
  ${StyledIconCss}
`
