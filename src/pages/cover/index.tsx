import { useWeb3React } from '@web3-react/core'
import React, { useMemo } from 'react'
import { Box } from '../../components/atoms/Box'
import { Button } from '../../components/atoms/Button'
import { StyledInfo } from '../../components/atoms/Icon'
import { Content, Flex, HeroContainer } from '../../components/atoms/Layout'
import { Text, TextSpan } from '../../components/atoms/Typography'
import { PleaseConnectWallet } from '../../components/molecules/PleaseConnectWallet'
import { useNetwork } from '../../context/NetworkManager'
import CoverageManager, { useCoverageContext } from './CoverageContext'
import { PortfolioSimulator } from './PortfolioSimulator'
import { PolicyContent } from './PolicyContent'
import { CldModal } from './CldModal'
import { SimCoverModal } from './SimCoverModal'
import { Portfolio } from './Portfolio'
import ReferralModal from './ReferralModal'

function VisibilityController({ show, children }: { show: boolean; children: React.ReactNode }) {
  return <div style={{ display: show ? 'block' : 'none' }}>{children}</div>
}

const CoverageContent = () => {
  const { intrface } = useCoverageContext()
  const { showPortfolioModal, showCLDModal, showSimulatorModal, showSimCoverModal, showReferralModal } = intrface

  const _showCldModal =
    showCLDModal && !showSimulatorModal && !showSimCoverModal && !showPortfolioModal && !showReferralModal
  const _showSimulatorModal =
    showSimulatorModal && !showCLDModal && !showSimCoverModal && !showPortfolioModal && !showReferralModal
  const _showSimCoverModal =
    showSimulatorModal && !showCLDModal && showSimCoverModal && !showPortfolioModal && !showReferralModal
  const _showPortfolioModal =
    showPortfolioModal && !showCLDModal && !showSimulatorModal && !showSimCoverModal && !showReferralModal
  const _showDefault =
    !showSimulatorModal && !showCLDModal && !showSimCoverModal && !showPortfolioModal && !showReferralModal

  const _showReferralModal =
    showReferralModal && !showCLDModal && !showSimulatorModal && !showSimCoverModal && !showPortfolioModal

  // const _showReferralModal = true
  // const _showCldModal = false
  // const _showSimulatorModal = false
  // const _showSimCoverModal = false
  // const _showDefault = false
  // const _showPortfolioModal = false

  return (
    <Content>
      <Flex justifyCenter>
        <Flex col w={375}>
          <VisibilityController show={_showCldModal}>
            <CldModal />
          </VisibilityController>
          <VisibilityController show={_showPortfolioModal}>
            <Portfolio />
          </VisibilityController>
          <VisibilityController show={_showSimulatorModal}>
            <PortfolioSimulator />
          </VisibilityController>
          <VisibilityController show={_showSimCoverModal}>
            <SimCoverModal />
          </VisibilityController>
          <VisibilityController show={_showDefault}>
            <CoveragePage />
          </VisibilityController>
          <VisibilityController show={_showReferralModal}>
            <ReferralModal />
          </VisibilityController>
        </Flex>
      </Flex>
    </Content>
  )
}

function Cover(): JSX.Element {
  return (
    <CoverageManager>
      <CoverageContent />
    </CoverageManager>
  )
}

const CoveragePage = (): JSX.Element => {
  const { account } = useWeb3React()
  const { activeNetwork } = useNetwork()
  const { styles, intrface } = useCoverageContext()
  const { handleShowSimulatorModal } = intrface
  const { gradientStyle } = styles
  const canShowCoverageV3 = useMemo(() => !activeNetwork.config.restrictedFeatures.noCoverageV3, [
    activeNetwork.config.restrictedFeatures.noCoverageV3,
  ])

  return (
    <>
      {canShowCoverageV3 && account ? (
        <PolicyContent />
      ) : account ? (
        <Content>
          <Box error pt={10} pb={10} pl={15} pr={15}>
            <TextSpan light textAlignLeft>
              <StyledInfo size={30} />
            </TextSpan>
            <Text light bold style={{ margin: '0 auto' }}>
              This dashboard is not supported on this network.
            </Text>
          </Box>
          <Flex justifyCenter>
            <HeroContainer>
              <Button {...gradientStyle} secondary noborder p={20} onClick={() => handleShowSimulatorModal(true)}>
                <Text t2>Open Portfolio Editor</Text>
              </Button>
            </HeroContainer>
          </Flex>
        </Content>
      ) : (
        <PleaseConnectWallet />
      )}
    </>
  )
}

// const PolicyContent = (): JSX.Element => {
//   const { intrface, styles, input, dropdowns } = useCoverageContext()
//   const { navbarThreshold } = intrface
//   const { bigButtonStyle, gradientStyle } = styles
//   const {
//     enteredAmount: asyncEnteredAmount,
//     enteredDays: asyncEnteredDays,
//     setEnteredAmount: setAsyncEnteredAmount,
//     setEnteredDays: setAsyncEnteredDays,
//   } = input
//   const { daysOptions, coinOptions, daysOpen, coinsOpen, setDaysOpen, setCoinsOpen } = dropdowns

//   // const buyCta = useMemo(() => [InterfaceState.BUYING].includes(intrface.interfaceState), [intrface.interfaceState])
//   // const extendCta = useMemo(() => [InterfaceState.EXTENDING].includes(intrface.interfaceState), [
//   //   intrface.interfaceState,
//   // ])
//   // const withdrawCta = useMemo(() => [InterfaceState.WITHDRAWING].includes(intrface.interfaceState), [
//   //   intrface.interfaceState,
//   // ])
//   // const neutralCta = useMemo(() => [InterfaceState.NEUTRAL].includes(intrface.interfaceState), [
//   //   intrface.interfaceState,
//   // ])

//   const [enteredDays, setEnteredDays] = useState(asyncEnteredDays)
//   const [enteredAmount, setEnteredAmount] = useState(asyncEnteredAmount)

//   const buyCta = true
//   const neutralCta = false
//   const extendCta = false
//   const withdrawCta = false

//   const _editDays = useDebounce(() => {
//     setAsyncEnteredDays(enteredDays ?? '')
//   }, 200)

//   const _editAmount = useDebounce(() => {
//     setAsyncEnteredAmount(enteredAmount ?? '')
//   }, 200)

//   useEffect(() => {
//     _editDays()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [enteredDays])

//   useEffect(() => {
//     _editAmount()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [enteredAmount])

//   return (
//     <Content>
//       <Flex col gap={24}>
//         <Flex col>
//           <Text mont {...gradientStyle} t2 textAlignCenter>
//             Ready to protect your portfolio?
//           </Text>
//           <Text t3 textAlignCenter pt={8}>
//             Here is the best policy price based on your portfolio and optimal coverage limit.
//           </Text>
//         </Flex>
//         <Flex center>
//           <div
//             style={{
//               width: navbarThreshold ? '50%' : '100%',
//               gridTemplateColumns: '1fr 1fr',
//               display: 'grid',
//               position: 'relative',
//               gap: '15px',
//             }}
//           >
//             <TileCard bigger padding={16}>
//               <Flex between style={{ alignItems: 'center' }}>
//                 <Text bold>My Portfolio</Text>
//                 <Text info>
//                   <StyledOptions size={20} />
//                 </Text>
//               </Flex>
//               <Text t3s bold {...gradientStyle} pt={8}>
//                 $1
//               </Text>
//               <Flex pt={16}>??</Flex>
//             </TileCard>
//             <TileCard bigger padding={16}>
//               <Flex between style={{ alignItems: 'center' }}>
//                 <Text bold>Pay as you go</Text>
//                 <Text info>
//                   <StyledOptions size={20} />
//                 </Text>
//               </Flex>
//               <Text pt={8}>
//                 <TextSpan t3s bold {...gradientStyle}>
//                   $1
//                 </TextSpan>
//                 <TextSpan t6 bold pl={5}>
//                   / Day
//                 </TextSpan>
//               </Text>
//               <Flex col pt={16}>
//                 <Text contrast t7 bold>
//                   Cover limit:
//                 </Text>
//                 <Text t6>Highest Position + 20%</Text>
//               </Flex>
//             </TileCard>
//           </div>
//         </Flex>
//         <div style={{ margin: 'auto' }}>
//           <TileCard>
//             <Flex stretch between center pb={24}>
//               <Flex col>
//                 <Text bold t4>
//                   My Balance
//                 </Text>
//                 <Text textAlignCenter bold t3 {...gradientStyle}>
//                   $69
//                 </Text>
//               </Flex>
//               <VerticalSeparator />
//               <Flex col>
//                 <Text bold t4>
//                   Policy Status
//                 </Text>
//                 <Text textAlignCenter bold t3 success>
//                   Active
//                 </Text>
//               </Flex>
//               <VerticalSeparator />
//               <Flex col>
//                 <Text bold t4>
//                   Est. Days
//                 </Text>
//                 <Text textAlignCenter bold t3 {...gradientStyle}>
//                   365
//                 </Text>
//               </Flex>
//             </Flex>
//             <Flex col gap={12}>
//               <Flex col>
//                 <Text t4s textAlignCenter>
//                   Enter the number of days or the amount of funds.
//                 </Text>
//                 <Text techygradient t5s textAlignCenter italics pt={4}>
//                   Paid daily. Cancel and withdraw any time.
//                 </Text>
//               </Flex>
//               {(buyCta || extendCta) && (
//                 <>
//                   <div>
//                     <DropdownInputSection
//                       hasArrow
//                       isOpen={daysOpen}
//                       placeholder={'Enter days'}
//                       icon={<StyledClock size={16} />}
//                       text={'Days'}
//                       value={enteredDays}
//                       onChange={(e) => setEnteredDays(e.target.value)}
//                       onClick={() => setDaysOpen(!daysOpen)}
//                     />
//                     <DropdownOptions
//                       isOpen={daysOpen}
//                       searchedList={daysOptions}
//                       onClick={(value: string) => {
//                         setEnteredDays(value)
//                         setDaysOpen(false)
//                       }}
//                     />
//                   </div>
//                   <div>
//                     <DropdownInputSection
//                       hasArrow
//                       isOpen={coinsOpen}
//                       placeholder={'Enter amount'}
//                       icon={<img src={`https://assets.solace.fi/zapperLogos/frax`} height={16} />}
//                       text={'FRAX'}
//                       value={enteredAmount}
//                       onChange={(e) => setEnteredAmount(e.target.value)}
//                       onClick={() => setCoinsOpen(!coinsOpen)}
//                     />
//                     <DropdownOptions
//                       isOpen={coinsOpen}
//                       searchedList={coinOptions}
//                       onClick={(value: string) => {
//                         setEnteredAmount(value)
//                         setCoinsOpen(false)
//                       }}
//                     />
//                   </div>
//                 </>
//               )}
//               {withdrawCta && (
//                 <DropdownInputSection
//                   placeholder={'Enter amount'}
//                   icon={<img src={`https://assets.solace.fi/solace`} height={16} />}
//                   text={'SOLACE'}
//                   value={enteredAmount}
//                   onChange={(e) => setEnteredAmount(e.target.value)}
//                 />
//               )}
//               <ButtonWrapper isColumn p={0}>
//                 {buyCta && (
//                   <Button {...gradientStyle} {...bigButtonStyle} secondary noborder>
//                     <Text bold t4s>
//                       Purchase Policy
//                     </Text>
//                   </Button>
//                 )}
//                 {neutralCta && (
//                   <Button {...gradientStyle} {...bigButtonStyle} secondary noborder>
//                     <Text bold t4s>
//                       Extend Policy
//                     </Text>
//                   </Button>
//                 )}
//                 {neutralCta && (
//                   <Button secondary matchBg {...bigButtonStyle} noborder>
//                     <Text bold t4s>
//                       Withdraw Funds
//                     </Text>
//                   </Button>
//                 )}
//                 {extendCta && (
//                   <ButtonWrapper style={{ width: '100%' }} p={0}>
//                     <Button pt={16} pb={16} separator>
//                       Cancel
//                     </Button>
//                     <Button {...bigButtonStyle} {...gradientStyle} secondary noborder>
//                       Extend Policy
//                     </Button>
//                   </ButtonWrapper>
//                 )}
//                 {withdrawCta && (
//                   <ButtonWrapper style={{ width: '100%' }} p={0}>
//                     <Button pt={16} pb={16} separator>
//                       Cancel
//                     </Button>
//                     <Button {...bigButtonStyle} matchBg secondary noborder>
//                       <Text {...gradientStyle}>Withdraw</Text>
//                     </Button>
//                   </ButtonWrapper>
//                 )}
//               </ButtonWrapper>
//             </Flex>
//           </TileCard>
//           {(buyCta || extendCta || neutralCta) && (
//             <Button {...bigButtonStyle} error mt={16}>
//               Cancel Policy
//             </Button>
//           )}
//         </div>
//       </Flex>
//     </Content>
//   )
// }

export default Cover
