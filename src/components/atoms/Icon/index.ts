import styled, { css } from 'styled-components'
import { ArrowDropDown } from '@styled-icons/remix-line/ArrowDropDown'
import { Checkmark } from '@styled-icons/evaicons-solid/Checkmark'
import { Clock } from 'styled-icons/bootstrap'
import { CoinStack } from '@styled-icons/boxicons-solid/CoinStack'
import { Copy } from '@styled-icons/boxicons-regular/Copy'
import { DarkMode } from '@styled-icons/material-outlined/DarkMode'
import { DarkTheme } from '@styled-icons/fluentui-system-regular/DarkTheme'
import { Dashboard } from '@styled-icons/material/Dashboard'
import { Discord } from '@styled-icons/simple-icons/Discord'
import { DocumentText } from '@styled-icons/typicons/DocumentText'
import { Documents } from '@styled-icons/ionicons-sharp/Documents'
import { DotsHorizontalRounded } from '@styled-icons/boxicons-regular/DotsHorizontalRounded'
import { FileEarmarkLock2Fill } from '@styled-icons/bootstrap/FileEarmarkLock2Fill'
import { FileShield } from '@styled-icons/remix-fill/FileShield'
import { Gear } from '@styled-icons/octicons/Gear'
import { Github } from '@styled-icons/boxicons-logos/Github'
import { GraphDown } from '@styled-icons/bootstrap/GraphDown'
import { History } from '@styled-icons/boxicons-regular/History'
import { Info } from '@styled-icons/fluentui-system-regular/Info'
import { LinkExternal } from '@styled-icons/boxicons-regular/LinkExternal'
import { Medium } from '@styled-icons/boxicons-logos/Medium'
import { Menu } from '@styled-icons/boxicons-regular/Menu'
import { NetworkChart } from '@styled-icons/boxicons-regular/NetworkChart'
import { PeopleCommunity } from '@styled-icons/fluentui-system-filled/PeopleCommunity'
import { ReceiptMoney } from '@styled-icons/fluentui-system-filled/ReceiptMoney'
import { Refresh } from '@styled-icons/boxicons-regular/Refresh'
import { SendPlane } from '@styled-icons/remix-fill/SendPlane'
import { Sun } from '@styled-icons/evaicons-solid/Sun'
import { Twitter } from '@styled-icons/boxicons-logos/Twitter'
import { Wallet } from '@styled-icons/boxicons-solid/Wallet'
import { Warning } from '@styled-icons/fluentui-system-regular/Warning'
import { Work } from '@styled-icons/material/Work'
import { Multiselect } from '@styled-icons/fluentui-system-regular/Multiselect'
import { ArrowIosForwardOutline } from '@styled-icons/evaicons-outline/ArrowIosForwardOutline'
import { ArrowIosBackOutline } from '@styled-icons/evaicons-outline/ArrowIosBackOutline'
import { Tractor } from '@styled-icons/fa-solid/Tractor'
import { FolderHistory } from '@styled-icons/remix-fill/FolderHistory'

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

export const StyledDots = styled(DotsHorizontalRounded)`
  margin: auto 0;
  display: block;
`

export const StyledInfo = styled(Info)``

export const StyledDashboard = styled(Dashboard)``

export const StyledReceiptMoney = styled(ReceiptMoney)``

export const StyledFileShield = styled(FileShield)``

export const StyledClock = styled(Clock)``

export const StyledCoinStack = styled(CoinStack)``

export const StyledCommunity = styled(PeopleCommunity)``

export const StyledDiscord = styled(Discord)``

export const StyledTwitter = styled(Twitter)``

export const StyledGithub = styled(Github)``

export const StyledMedium = styled(Medium)``

export const DefiPulse = styled.img<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background-color: red;
`

// eslint-disable-next-line @typescript-eslint/no-var-requires
const requireDefault = (path: string) => require(path).default

DefiPulse.defaultProps = {
  src: requireDefault(`../../../resources/svg/icons/defipulse.svg`),
}

/* grab this svg (DefiPulseLogo):
<svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.8393 3.80168C13.3192 5.14979 14 6.65967 14 8.60096C14 12.3757 10.9908 15 6.67935 15H2.45666L0 12.7621V0H4.30162C6.61029 0 8.55391 0.754943 9.87597 2.02217L11.8393 3.80168ZM2.3284 2.01318H2.2988V2.46255L4.40028 4.3589V3.90054L2.3284 2.01318ZM4.75546 3.83763L2.75264 2.01318H2.46653L4.46935 3.83763H4.75546ZM5.45595 3.83763L3.45314 2.01318H2.89077L4.89359 3.83763H5.45595ZM4.33122 2.01318H3.59126L5.59408 3.83763H6.33404L4.33122 2.01318ZM7.05426 3.84661L5.09091 2.05812C4.88372 2.03116 4.6864 2.02217 4.46935 2.01318L6.47216 3.83763H6.67935C6.80761 3.83763 6.93587 3.83763 7.05426 3.84661ZM7.68569 3.90953L5.77167 2.16597C5.60395 2.13002 5.42636 2.10305 5.24877 2.07609L7.20225 3.8556C7.36998 3.86459 7.5377 3.89155 7.68569 3.90953ZM8.25793 4.03535L6.39323 2.33673C6.25511 2.29179 6.10712 2.24685 5.95913 2.2109L7.86328 3.94548C8.00141 3.97244 8.12967 3.9994 8.25793 4.03535ZM8.47498 4.09826C8.60324 4.15219 8.74137 4.20611 8.85976 4.26004L7.0444 2.60635C6.91614 2.54344 6.77801 2.48053 6.63989 2.4266L8.47498 4.09826ZM2.2988 6.01258L2.65398 6.33613L2.57505 6.40803L2.2988 6.15638V10.8658H4.40028V4.48472L2.2988 2.60635V3.04673L4.29175 4.8532L4.21282 4.91612L2.2988 3.18155V3.63092L3.95631 5.14979L3.88725 5.22169L2.2988 3.76573V4.22409L3.63073 5.44637L3.56166 5.51827L2.2988 4.3589V4.81726L3.30514 5.74296L3.23608 5.81486L2.2988 4.95207V5.41941L2.97956 6.03954L2.90063 6.11144L2.2988 5.55422V6.01258ZM8.7019 3.99041C8.36646 3.51408 7.92248 3.10965 7.38971 2.79509L8.7019 3.99041ZM11.642 3.98143L10.8428 3.23547C11.3756 4.1432 11.7209 5.26663 11.7209 6.43499C11.7209 6.56081 11.7209 6.68664 11.7111 6.80347L13.7237 8.64589V8.60096C13.7237 6.72259 13.0529 5.30258 11.642 3.98143ZM4.67653 10.8568C7.54757 10.713 9.4024 8.9964 9.4024 6.43499C9.4024 5.76992 9.27414 5.15878 9.03735 4.61953C8.43552 4.24206 7.74489 4.08927 6.67935 4.08927H4.67653V10.8568ZM11.2967 8.74476L13.3883 10.6501C13.5856 10.0659 13.704 9.43679 13.7237 8.77172L11.7012 6.9293C11.6519 7.57639 11.5137 8.17855 11.2967 8.74476ZM13.3488 10.74L11.2572 8.83463C11.0698 9.284 10.833 9.70641 10.5469 10.0839L12.6779 12.0252C12.9542 11.6297 13.1811 11.1983 13.3488 10.74ZM11.8097 12.9958C12.1156 12.7262 12.382 12.4206 12.6187 12.0971L10.4975 10.1648C10.2509 10.4793 9.97463 10.7759 9.65892 11.0365L11.8097 12.9958ZM8.72163 11.7106L10.8823 13.6789C11.1882 13.4901 11.4743 13.2834 11.7407 13.0587L9.58985 11.0995C9.32347 11.3241 9.03735 11.5309 8.72163 11.7106ZM7.77449 12.1869L9.93516 14.1552C10.2311 14.0294 10.5173 13.8856 10.7935 13.7328L8.63284 11.7645C8.36645 11.9263 8.08034 12.0611 7.77449 12.1869ZM6.84708 12.5015L8.99789 14.4608C9.284 14.3889 9.57012 14.29 9.8365 14.1911L7.67583 12.2229C7.40944 12.3307 7.13319 12.4296 6.84708 12.5015ZM5.94926 12.6992L8.0902 14.6495C8.36646 14.6046 8.63284 14.5506 8.88936 14.4877L6.74841 12.5374C6.4919 12.6004 6.22551 12.6543 5.94926 12.6992ZM5.821 12.7172C5.58421 12.7621 5.33756 12.7891 5.09091 12.8071L7.21212 14.7304C7.46864 14.7214 7.71529 14.6944 7.96194 14.6675L5.821 12.7172ZM6.39323 14.7484H6.67935C6.81748 14.7484 6.94573 14.7484 7.07399 14.7394L4.96265 12.8161C4.74559 12.825 4.52854 12.834 4.30162 12.834H4.29175L6.39323 14.7484ZM0.473572 12.834L2.57505 14.7484H2.71318L0.621564 12.834H0.473572ZM0.75969 12.834L2.86117 14.7484H3.03876L0.937281 12.834H0.75969ZM1.07541 12.834L3.17689 14.7484H3.4038L1.30232 12.834H1.07541ZM1.44045 12.834L3.54193 14.7484H3.82805L1.72657 12.834H1.44045ZM1.86469 12.834L3.96617 14.7484H4.31149L2.21001 12.834H1.86469ZM2.34813 12.834L4.44961 14.7484H4.86399L2.76251 12.834H2.34813ZM2.9105 12.834L5.01198 14.7484H5.51515L3.41367 12.834H2.9105ZM3.5518 12.834L5.65328 14.7484H6.25511L4.14376 12.834H3.5518Z" fill="#fff"/>
</svg>
and export it as a styled component with this color:
theme.typography.infoText
*/

export const StyledDocuments = styled(Documents)``

export const StyledDocumentText = styled(DocumentText)``

export const StyledWork = styled(Work)``

export const StyledSun = styled(Sun)``

export const StyledMoon = styled(DarkMode)``

export const StyledTheme = styled(DarkTheme)``

export const StyledArrowDropDown = styled(ArrowDropDown)``

export const StyledLinkExternal = styled(LinkExternal)``

export const StyledLockFile = styled(FileEarmarkLock2Fill)``

export const StyledMenu = styled(Menu)`
  ${StyledIconCss}
`

export const StyledCheckmark = styled(Checkmark)`
  ${StyledIconCss}
`

export const StyledWarning = styled(Warning)`
  ${StyledIconCss}
`

export const StyledGear = styled(Gear)``

export const StyledGraphDown = styled(GraphDown)``

export const StyledSendPlane = styled(SendPlane)``

export const StyledRefresh = styled(Refresh)``

export const StyledMultiselect = styled(Multiselect)``

export const StyledCopy = styled(Copy)``

export const InfoCopy = styled(Copy)`
  color: ${(props) => props.theme.typography.infoText};
  height: 16px;
  width: 16px;
`
export const InfoCheckmark = styled(Checkmark)`
  color: ${(props) => props.theme.typography.infoText};
  height: 16px;
  width: 16px;
`

export const StyledArrowIosForwardOutline = styled(ArrowIosForwardOutline)``

export const StyledArrowIosBackOutline = styled(ArrowIosBackOutline)``

export const StyledTractor = styled(Tractor)``

export const StyledFolderHistory = styled(FolderHistory)``
