import styled, { css } from 'styled-components'
import { ArrowDropDown } from '@styled-icons/material-rounded/ArrowDropDown'
import { Close } from '@styled-icons/material-rounded/Close'
import { Checkmark } from '@styled-icons/evaicons-solid/Checkmark'
import { Clock } from '@styled-icons/bootstrap/Clock'
import { CoinStack } from '@styled-icons/boxicons-solid/CoinStack'
import { ShareAlt } from '@styled-icons/boxicons-solid/ShareAlt'
import { Copy } from '@styled-icons/boxicons-regular/Copy'
import { DarkMode } from '@styled-icons/material-outlined/DarkMode'
import { ModelTraining } from '@styled-icons/material-outlined/ModelTraining'
import { DarkTheme } from '@styled-icons/fluentui-system-regular/DarkTheme'
import { Dashboard } from '@styled-icons/material/Dashboard'
import { Discord } from '@styled-icons/simple-icons/Discord'
import { DocumentText } from '@styled-icons/typicons/DocumentText'
import { Documents } from '@styled-icons/ionicons-sharp/Documents'
import { Analytics } from '@styled-icons/ionicons-sharp/Analytics'
import { DotsHorizontalRounded } from '@styled-icons/boxicons-regular/DotsHorizontalRounded'
import { HelpCircle } from '@styled-icons/boxicons-regular/HelpCircle'
import { FileEarmarkLock2Fill } from '@styled-icons/bootstrap/FileEarmarkLock2Fill'
import { FileShield } from '@styled-icons/remix-fill/FileShield'
import { Gear } from '@styled-icons/octicons/Gear'
import { Github } from '@styled-icons/boxicons-logos/Github'
import { GraphDown } from '@styled-icons/bootstrap/GraphDown'
import { History } from '@styled-icons/boxicons-regular/History'
import { Info } from '@styled-icons/fluentui-system-regular/Info'
import { Options } from '@styled-icons/fluentui-system-regular/Options'
import { ArrowDownload } from '@styled-icons/fluentui-system-regular/ArrowDownload'
import { Calculator } from '@styled-icons/fluentui-system-regular/Calculator'
import { Expand } from '@styled-icons/boxicons-regular/Expand'
import { LinkExternal } from '@styled-icons/boxicons-regular/LinkExternal'
import { Medium } from '@styled-icons/boxicons-logos/Medium'
import { Menu } from '@styled-icons/boxicons-regular/Menu'
import { NetworkChart } from '@styled-icons/boxicons-regular/NetworkChart'
import { PeopleCommunity } from '@styled-icons/fluentui-system-filled/PeopleCommunity'
import { Add } from '@styled-icons/fluentui-system-filled/Add'
import { ReceiptMoney } from '@styled-icons/fluentui-system-filled/ReceiptMoney'
import { Refresh } from '@styled-icons/boxicons-regular/Refresh'
import { SendPlane } from '@styled-icons/remix-fill/SendPlane'
import { Sun } from '@styled-icons/evaicons-solid/Sun'
import { Twitter } from '@styled-icons/boxicons-logos/Twitter'
import { Wallet } from '@styled-icons/boxicons-solid/Wallet'
import { Warning } from '@styled-icons/fluentui-system-regular/Warning'
import { Work } from '@styled-icons/material/Work'
import { LocalFireDepartment } from '@styled-icons/material/LocalFireDepartment'
import { MultiselectLtr } from '@styled-icons/fluentui-system-regular/MultiselectLtr'
import { ArrowIosForwardOutline } from '@styled-icons/evaicons-outline/ArrowIosForwardOutline'
import { ArrowIosBackOutline } from '@styled-icons/evaicons-outline/ArrowIosBackOutline'
import { Vote } from '@styled-icons/fluentui-system-regular/Vote'
import { Tractor } from '@styled-icons/fa-solid/Tractor'
import { FolderHistory } from '@styled-icons/remix-fill/FolderHistory'
import { Export } from '@styled-icons/boxicons-regular/Export'

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

export const StyledMultiselect = styled(MultiselectLtr)``

export const StyledCopy = styled(Copy)``

export const StyledShare = styled(ShareAlt)``

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

export const StyledHelpCircle = styled(HelpCircle)``

export const StyledOptions = styled(Options)``
export const StyledCalculator = styled(Calculator)``

export const StyledModelTraining = styled(ModelTraining)``

export const StyledClose = styled(Close)``

export const StyledAdd = styled(Add)``

export const StyledExpand = styled(Expand)``

export const StyledExport = styled(Export)``

export const StyledVote = styled(Vote)``

export const StyledFire = styled(LocalFireDepartment)`
  ${StyledIconCss}
`

export const StyledAnalytics = styled(Analytics)``

export const StyledDownload = styled(ArrowDownload)``
